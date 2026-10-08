import { Sun, Sunset, CloudMoon, Moon, RefreshCw } from "lucide-react";
import type { TimeOfDay } from "../utils/environmentalLighting.ts";

const OPTIONS: { time: TimeOfDay; label: string; Icon: typeof Sun }[] = [
  { time: "day", label: "Day", Icon: Sun },
  { time: "sunset", label: "Sunset", Icon: Sunset },
  { time: "dusk", label: "Dusk", Icon: CloudMoon },
  { time: "night", label: "Night", Icon: Moon },
];

export function LightingControls({
  timeOfDay,
  autoTime,
  onSelectTime,
  onToggleAuto,
}: {
  timeOfDay: TimeOfDay;
  autoTime: boolean;
  onSelectTime: (time: TimeOfDay) => void;
  onToggleAuto: () => void;
}) {
  return (
    <div
      className="lighting-controls"
      role="group"
      aria-label="Environmental lighting"
    >
      {OPTIONS.map(({ time, label, Icon }) => (
        <button
          key={time}
          type="button"
          className="icon-button lighting-btn"
          aria-label={label}
          aria-pressed={!autoTime && timeOfDay === time}
          title={label}
          onClick={() => onSelectTime(time)}
        >
          <Icon size={18} aria-hidden="true" />
          <span className="sr-only">{label}</span>
        </button>
      ))}
      <button
        type="button"
        className="icon-button lighting-btn lighting-btn-auto"
        aria-label="Auto time of day"
        aria-pressed={autoTime}
        title="Sync with system clock"
        onClick={onToggleAuto}
      >
        <RefreshCw size={18} aria-hidden="true" />
        <span className="sr-only">{autoTime ? "Auto on" : "Auto off"}</span>
      </button>
    </div>
  );
}
