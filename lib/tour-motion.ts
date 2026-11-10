// Timing for moving between the home page and a tour, the loading state, and the results
// entrance. Kept in one plain file so the values stay consistent across components.

/** The ease used across the app: quick start, gentle stop (the same one FadeRise uses). */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** How long the home page and the tour take to cross-fade, in seconds. */
export const TOUR_FADE_SECONDS = 0.3;

/** How long the URL bar takes to glide between the hero and the results header, in seconds. */
export const URL_BAR_MOVE_SECONDS = 0.5;

/** How long the map takes to zoom to fit when it first appears, in milliseconds. */
export const MAP_FIT_MS = 600;

/** The side panel's slide-in spring: settles fast without bouncing much. */
export const PANEL_SPRING = { type: "spring", stiffness: 420, damping: 36, mass: 0.8 } as const;

/** The spring for things that "pop" in: badges, ticks and loading-graph nodes. */
export const POP_SPRING = { type: "spring", stiffness: 500, damping: 26 } as const;
