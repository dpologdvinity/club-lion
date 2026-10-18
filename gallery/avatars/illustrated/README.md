# Illustrated doll: actual layered art

The owner approved `../doll-replacement-concept.png` and explicitly requires full mix-and-match customization. The flat vector approach was rejected. This fitting proof uses the illustrated artwork itself; it does not redraw the character as simplified geometry.

Open `preview.html` through the project's existing Vite server. It assembles separate body, back hair, front fringe, top, trousers, shoes, and the existing selectable accessory art. The checkboxes show that each piece remains separate. `assembled-preview.png` is an actual compositor render, not a second generated concept image.

This is **not wired into the game yet**. It must not replace Avatar with a single fixed image or silently send unsupported wardrobe choices back to the rejected renderer. No saved looks or catalog options were removed.

## Art and fitting

All five PNG layers were generated with the built-in image-generation tool on 2026-10-17 using the approved concept and the new base as references. They retain alpha. The generator did not keep exact fitting coordinates, so `src/components/avatar/illustrated.ts` owns their current affine fits and front/back clipping. An alpha transfer removes the low-opacity external halos during rendering. The closed high-neck halter covers the modest base layer; it is one garment variant, not the exact open neckline of the reference.

Prompt set:

- **Base:** retain the approved adult fashion-doll identity, face, sophisticated shaded illustration, slender proportions, left hand on hip, right arm down, and complete feet. Remove hair, accessories and outer clothing. Wear an opaque lavender bandeau and fitted bike shorts as a modest base. Transparent full-body 1024 × 1536 canvas, no glow.
- **Hair:** retain the approved flowing caramel butterfly blowout, fine blonde strands, curls and clips; remove all skin, face, body, clothes and jewelry. Hollow wig on the same transparent full-body canvas.
- **Top:** isolated metallic lavender halter, fitted against the base reference. Fine contours and natural iridescent folds. Transparent full-body canvas, no mannequin. A follow-up edit closes the neckline with matching opaque lavender fabric.
- **Trousers:** isolated indigo low-rise flares with gold embroidery, silver chain belt, fabric texture and approved illustration quality; fit the base's hip and leg pose. No wearer, shoes or background.
- **Shoes:** two isolated metallic lavender platform sandals, matching the base's left and right foot angles and approved style. No feet, legs, person or background.

## Remaining production work

- Fit each existing hairstyle, bangs and clip separately; current butterfly clips are still baked into the first hair asset.
- Separate or author makeup and skin variants without baking the player's choices into the base.
- Complete and visually verify every existing top, bottom and shoe variant, including sleeves and hands over garments.
- Fit neck accessories, eyewear, headwear, bags, bracelets, carried props and boards.
- Rig action poses and portrait framing on the new proportions; check world movement and game/riding uses.
- Integrate the complete layer registry with Avatar and the existing saved AvatarLook. Keep old saves and all customization controls working.
- Import production assets through the build, keep offline caching complete, and measure the resulting payload on phone/iPad.

The live game intentionally keeps its current renderer while this work remains incomplete. Real iPad verification is outstanding.
