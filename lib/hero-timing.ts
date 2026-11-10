// Timing for the hero's page-load sequence: the headline blurs in word by word,
// then the subheadline and the form fade and rise in just after it.
//
// These live in a plain (non-client) file so the server-rendered home page can read
// them as real numbers. A value exported from a "use client" file can't be read on the server.

/** Gap between one headline word starting and the next, in milliseconds. */
export const HEADLINE_WORD_STAGGER_MS = 90;

/** How long each step of a word's blur-in takes, in seconds. */
export const HEADLINE_STEP_SECONDS = 0.3;

/** When the subheadline starts to appear, in seconds after load. */
export const SUBHEAD_DELAY_SECONDS = 0.9;

/** When the form starts to appear, in seconds after load. */
export const FORM_DELAY_SECONDS = 1.05;

/** How long the subheadline and form take to fade and rise in, in seconds. */
export const FADE_RISE_SECONDS = 0.6;

/** When the input's placeholder starts typing examples, in milliseconds (once the form is in). */
export const TYPING_START_MS = (FORM_DELAY_SECONDS + FADE_RISE_SECONDS) * 1000 + 300;
