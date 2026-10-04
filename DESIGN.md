---
version: alpha
name: Club Lion
description: A sunny, illustrated savanna world for little browser adventures.
colors:
  primary: "#294b3c"
  background: "#faf8f2"
  surface: "#fffdf9"
  muted: "#626f61"
  accent: "#ee964c"
  on-accent: "#59361b"
  accent-soft: "#ffebc8"
  border: "#e9e5da"
  success: "#579371"
  danger: "#a94635"
typography:
  display:
    fontFamily: "Lilita One, Nunito, sans-serif"
  body:
    fontFamily: "Nunito, sans-serif"
rounded:
  DEFAULT: "1rem"
  sm: "0.5rem"
  control: "0.625rem"
  dialog: "1.375rem"
spacing:
  page-max: "91.5rem"
  desktop-gutter: "2.5rem"
  mobile-gutter: "0.875rem"
  section-gap: "1.5rem"
components:
  button:
    rounded: "0.625rem"
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
  dialog:
    rounded: "1.375rem"
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
  world:
    rounded: "1rem"
    backgroundColor: "{colors.surface}"
---

# Club Lion

## Overview

An original lion neighborhood inspired by the cozy, explorable feeling of Club Penguin. The page is a playable product surface, with the illustrated village as its defining feature. Its audience is people looking for an easy, cheerful browser game; the first version is a single-player world with scripted neighbors and local progress. English is the supported interface language. No account, payments, or real-time messaging are involved.

The generated primary screen established the visual reference: rounded lettering, forest green chrome, warm orange actions, and a richly illustrated savanna. Keep controls quiet enough that the art remains the focus. Avoid marketing hero sections, dark gaming dashboards, neon UI, and imitations of Club Penguin branding.

Runtime variables in [src/styles.css](src/styles.css) are canonical. This file records their roles and values; update the two together when changing the visual system.

## Colors

Warm ivory is the page background, with almost-white panels. Forest green owns navigation, headings, and focused controls. Orange indicates inviting actions. Green indicates completed adventures. Errors use dark red and explicit text. Scrollbars inherit a sage thumb and ivory track globally; forced-colors mode uses system colors.

## Typography

Lilita One at its native 400 weight supplies the logo and short display headings. Nunito's 400–900 variable range supplies the interface and body text. Fonts are bundled locally with their OFL licenses. Headings remain short; long player names wrap within the profile. Numeric coin counts use tabular figures.

## Layout

The desktop shell is bounded at 1464px with 40px gutters. A wide game canvas sits beside a compact lion profile and adventure list. Destination previews continue below the world, including the park, midway, plaza, and club. At 850px, the world fills the width and sidebar panels follow. At 590px, navigation wraps onto its own row, profiles and adventures stack, and destinations form two columns. Preserve document scrolling; dialogs scroll within the viewport.

## Elevation & Depth

Panel borders and very soft shadows separate the UI from the cream page. Stronger shadows are reserved for speech bubbles, dialogs, and the shared status notification. The world stage is the one exception: a global environmental lighting layer grades the background with a time-of-day tint, ambient dimming, stars, fireflies, and a sun/moon glow. It never covers controls, the avatar, neighbors, or portals, and freezes under reduced motion. A small lower-edge shadow also makes the scene's controls readable.

## Shapes

Use 16px panels, 10px buttons, softly rounded 12px destination previews, and 22px dialogs. Utility controls are circular or compact rounded squares. Character names sit in small capsules because they identify occupants of the scene.

## Components

Native buttons own all actions, with hover, pressed, disabled, and visible focus states. Primary buttons use orange with dark text; secondary buttons use muted sage. A single native modal dialog supplies all map, wardrobe, shop, game, and help surfaces. One shared live status region supplies transient feedback.

Lucide outline icons use mostly 16–22px sizes with consistent strokes. The lion is a reusable generated transparent sprite with color variants and code-native accessories. World characters use smooth position transitions; reduced-motion mode disables them and all other transitions. Background atlas quadrants become independent WebP assets and render with cover sizing, preserving their proportions. The four panoramic rooms use original code-native SVG landscapes: warm carnival tents, a moving coaster and upright Ferris cabins, a fountain plaza, and a dusky blue Club Pulse with warm gold signage. A single stage scale positions scenery, portals, avatars, trails, and the 8×6 dance floor; the camera reveals the panorama as the lion moves. Named room controls sit in a quiet ivory strip below the scene, providing access to off-camera paths and activities. Reduced motion freezes ambient scenery.

Copy is friendly, concrete, and short. Real progress owns every coin count, adventure bar, and level. The help screen clearly describes the single-player neighborhood and local chat.

## Do's and Don'ts

- Keep the playable world as the first meaningful screen.
- Keep the same action labels and modal behavior across all screens.
- Make character greetings, keyboard movement, rewards, and saved looks functional.
- Do not imply that scripted neighbors are online players.
- Do not add decorative progress, daily resets, or multiplayer status without implementing them.
