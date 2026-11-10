"use client";

import { MotionConfig } from "motion/react";

// Wraps the whole app so every motion animation follows the visitor's
// "reduce motion" setting. With reducedMotion="user", motion skips movement
// (like sliding or scaling) for people who turned that setting on, but still
// lets gentle changes like fades happen.
//
// This needs to be a client component because MotionConfig uses React context,
// and the root layout is a server component.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
