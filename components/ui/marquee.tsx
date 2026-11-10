// Magic UI "Marquee" (added with `npx shadcn add @magicui/marquee`), with small changes for RepoGuide:
// - The content is repeated to make the loop seamless. Only the first copy is read out by
//   screen readers; the repeats are aria-hidden.
// - `children` can be a function that is told whether it is drawing a repeat, so buttons in
//   the repeats can be skipped by the Tab key (keyboard users meet each button once).
// - pauseOnHover also pauses while something inside has keyboard focus.

import { type ComponentPropsWithoutRef } from "react"

import { cn } from "@/lib/utils"

interface MarqueeProps extends Omit<ComponentPropsWithoutRef<"div">, "children"> {
  /**
   * Optional CSS class name to apply custom styles
   */
  className?: string
  /**
   * Whether to reverse the animation direction
   * @default false
   */
  reverse?: boolean
  /**
   * Whether to pause the animation on hover
   * @default false
   */
  pauseOnHover?: boolean
  /**
   * Content to be displayed in the marquee. Pass a function to know whether
   * you are drawing one of the repeated (hidden from screen readers) copies.
   */
  children: React.ReactNode | ((isCopy: boolean) => React.ReactNode)
  /**
   * Whether to animate vertically instead of horizontally
   * @default false
   */
  vertical?: boolean
  /**
   * Number of times to repeat the content
   * @default 4
   */
  repeat?: number
}

export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}: MarqueeProps) {
  return (
    <div
      {...props}
      className={cn(
        "group flex gap-(--gap) overflow-hidden p-2 [--duration:40s] [--gap:1rem]",
        {
          "flex-row": !vertical,
          "flex-col": vertical,
        },
        className
      )}
    >
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            aria-hidden={i > 0 || undefined}
            className={cn("flex shrink-0 justify-around gap-(--gap)", {
              "animate-marquee flex-row": !vertical,
              "animate-marquee-vertical flex-col": vertical,
              "group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]":
                pauseOnHover,
              "[animation-direction:reverse]": reverse,
            })}
          >
            {typeof children === "function" ? children(i > 0) : children}
          </div>
        ))}
    </div>
  )
}
