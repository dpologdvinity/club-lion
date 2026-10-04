import { useEffect, useMemo, useState } from "react";
import { RotateCw, Trash2, X } from "lucide-react";
import {
  FURNITURE_CATALOG,
  GRID_SIZE,
  TILE_WIDTH,
  TILE_HEIGHT,
  gridToScreen,
  getEffectiveFootprint,
  isValidPlacement,
  calculateDepthOrder,
  serializeLayout,
  deserializeLayout,
  type PlacedFurniture,
  type Orientation,
} from "../utils/condoGrid.ts";

const ORIGIN_X = (GRID_SIZE * TILE_WIDTH) / 2;
const ORIGIN_Y = 40;
const NEXT_ORIENTATION: Record<Orientation, Orientation> = {
  N: "E",
  E: "S",
  S: "W",
  W: "N",
};

function createId(): string {
  return `furn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function diamondPoints(col: number, row: number): string {
  const { x, y } = gridToScreen(col, row, ORIGIN_X, ORIGIN_Y);
  const halfW = TILE_WIDTH / 2;
  const halfH = TILE_HEIGHT / 2;
  return [
    `${x},${y - halfH}`,
    `${x + halfW},${y}`,
    `${x},${y + halfH}`,
    `${x - halfW},${y}`,
  ].join(" ");
}

export function Condo({
  condoLayout,
  onSaveLayout,
  onClose,
}: {
  condoLayout?: string;
  onSaveLayout: (layout: string) => void;
  onClose?: () => void;
}) {
  const [items, setItems] = useState<PlacedFurniture[]>(() =>
    deserializeLayout(condoLayout),
  );
  const [editMode, setEditMode] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [activeFurnitureId, setActiveFurnitureId] = useState<string | null>(
    null,
  );
  const sortedItems = useMemo(
    () =>
      [...items].sort(
        (a, b) => calculateDepthOrder(a) - calculateDepthOrder(b),
      ),
    [items],
  );

  const [placementError, setPlacementError] = useState<string | null>(null);

  function handleTilePlace(col: number, row: number) {
    if (!editMode || !selectedItemId) return;
    const candidate: PlacedFurniture = {
      id: createId(),
      itemId: selectedItemId,
      col,
      row,
      orientation: "N",
    };
    if (!isValidPlacement(candidate, items)) {
      setPlacementError(
        "Cannot place here: tile is occupied or out of bounds.",
      );
      setTimeout(() => setPlacementError(null), 2500);
      return;
    }
    setPlacementError(null);
    setItems((current) => [...current, candidate]);
  }

  function handleRotate(id: string) {
    setItems((current) => {
      const target = current.find((item) => item.id === id);
      if (!target) return current;
      const rotated: PlacedFurniture = {
        ...target,
        orientation: NEXT_ORIENTATION[target.orientation],
      };
      const others = current.filter((item) => item.id !== id);
      if (!isValidPlacement(rotated, others)) {
        setPlacementError(
          "Rotation blocked: item collides with another piece or wall!",
        );
        setTimeout(() => setPlacementError(null), 2500);
        return current;
      }
      setPlacementError(null);
      return [...others, rotated];
    });
  }

  function handleRemove(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
    setActiveFurnitureId((current) => (current === id ? null : current));
  }

  function toggleEditMode() {
    if (editMode) {
      onSaveLayout(serializeLayout(items));
    }
    setEditMode((current) => !current);
    setSelectedItemId(null);
    setActiveFurnitureId(null);
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const tiles: { col: number; row: number }[] = [];
  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      tiles.push({ col, row });
    }
  }

  return (
    <div className="condo-room">
      <header className="condo-toolbar">
        <h2>Luxury Penthouse Condo</h2>
        <div className="condo-toolbar-actions">
          <button
            type="button"
            className="button"
            onClick={toggleEditMode}
            aria-pressed={editMode}
          >
            {editMode ? "Save Changes" : "Customize Den"}
          </button>
          {onClose && (
            <button
              type="button"
              className="icon-button"
              aria-label="Close condo"
              onClick={onClose}
            >
              <X size={21} />
            </button>
          )}
        </div>
      </header>

      {placementError && (
        <div className="condo-alert" role="status" aria-live="polite">
          {placementError}
        </div>
      )}

      {editMode && (
        <div
          className="condo-furniture-tray"
          role="toolbar"
          aria-label="Furniture palette"
        >
          {FURNITURE_CATALOG.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`condo-tray-item ${selectedItemId === item.id ? "selected" : ""}`}
              aria-pressed={selectedItemId === item.id}
              onClick={() =>
                setSelectedItemId((current) =>
                  current === item.id ? null : item.id,
                )
              }
            >
              {item.name}
            </button>
          ))}
        </div>
      )}

      <svg
        className="condo-grid"
        viewBox={`0 0 ${GRID_SIZE * TILE_WIDTH} ${GRID_SIZE * TILE_HEIGHT + 80}`}
        role="grid"
        aria-label="Condo floor grid"
      >
        {tiles.map(({ col, row }) => (
          <polygon
            key={`tile-${col}-${row}`}
            role="gridcell"
            tabIndex={editMode ? 0 : -1}
            aria-label={`Floor tile column ${col + 1} row ${row + 1}`}
            points={diamondPoints(col, row)}
            className="condo-tile"
            onClick={() => handleTilePlace(col, row)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleTilePlace(col, row);
              }
            }}
          />
        ))}
        {sortedItems.map((placed) => {
          const catalogItem = FURNITURE_CATALOG.find(
            (entry) => entry.id === placed.itemId,
          );
          const { width, depth } = getEffectiveFootprint(placed);
          const centerCol = placed.col + width / 2 - 0.5;
          const centerRow = placed.row + depth / 2 - 0.5;
          const { x, y } = gridToScreen(
            centerCol,
            centerRow,
            ORIGIN_X,
            ORIGIN_Y,
          );
          const isActive = activeFurnitureId === placed.id;
          return (
            <g
              key={placed.id}
              className={`condo-furniture ${catalogItem?.isRug ? "is-rug" : ""}`}
              transform={`translate(${x}, ${y})`}
              role="button"
              tabIndex={editMode ? 0 : -1}
              aria-label={`${catalogItem?.name ?? placed.itemId}, facing ${placed.orientation}`}
              onClick={() =>
                editMode &&
                setActiveFurnitureId((current) =>
                  current === placed.id ? null : placed.id,
                )
              }
              onKeyDown={(event) => {
                if (!editMode) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setActiveFurnitureId((current) =>
                    current === placed.id ? null : placed.id,
                  );
                }
              }}
            >
              <rect
                x={-(width * TILE_WIDTH) / 4}
                y={-(depth * TILE_HEIGHT) / 4}
                width={(width * TILE_WIDTH) / 2}
                height={(depth * TILE_HEIGHT) / 2}
                rx={6}
              />
              <title>{catalogItem?.name ?? placed.itemId}</title>
              {isActive && editMode && (
                <foreignObject x={-40} y={-50} width={80} height={32}>
                  <div className="condo-furniture-controls">
                    <button
                      type="button"
                      aria-label={`Rotate ${catalogItem?.name ?? placed.itemId}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRotate(placed.id);
                      }}
                    >
                      <RotateCw size={14} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${catalogItem?.name ?? placed.itemId}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRemove(placed.id);
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </foreignObject>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
