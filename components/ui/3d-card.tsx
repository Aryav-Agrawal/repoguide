"use client";

// Aceternity UI "3D Card Effect" (added with `npx shadcn add @aceternity/3d-card`), with small changes
// for RepoGuide:
// - `disabled` on CardContainer turns the tilt off (phones, touch screens, reduced motion).
// - The tilt is worked out from where the cursor is *within* the card, so wide and narrow cards
//   tilt by the same amount (at most MAX_TILT_DEGREES). The original divided by 25 pixels, which
//   tips a wide card by ~20 degrees.
// - It also writes the cursor position as --glare-x / --glare-y, so a glare layer can follow it.
// - Types tightened so lint passes.

import { cn } from "@/lib/utils";

import React, { createContext, useState, useContext, useRef, useEffect } from "react";

const MAX_TILT_DEGREES = 7;

const MouseEnterContext = createContext<
  [boolean, React.Dispatch<React.SetStateAction<boolean>>] | undefined
>(undefined);

export const CardContainer = ({
  children,
  className,
  containerClassName,
  disabled = false,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  /** When true the card stays flat and ignores the mouse. */
  disabled?: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMouseEntered, setIsMouseEntered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = containerRef.current;
    if (!card) return;
    const { left, top, width, height } = card.getBoundingClientRect();
    // 0 at the left/top edge, 1 at the right/bottom edge.
    const px = (e.clientX - left) / width;
    const py = (e.clientY - top) / height;
    // The side under the cursor dips toward you, the far side tips away.
    const rotateY = (px - 0.5) * 2 * MAX_TILT_DEGREES;
    const rotateX = -(py - 0.5) * 2 * MAX_TILT_DEGREES;
    card.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
    card.style.setProperty("--glare-x", `${px * 100}%`);
    card.style.setProperty("--glare-y", `${py * 100}%`);
  };

  const handleMouseEnter = () => {
    setIsMouseEntered(true);
  };

  const handleMouseLeave = () => {
    setIsMouseEntered(false);
    if (!containerRef.current) return;
    containerRef.current.style.transform = `rotateY(0deg) rotateX(0deg)`;
  };

  // If the card is switched off while tilted (e.g. the window gets narrow), lay it flat again.
  useEffect(() => {
    if (disabled && containerRef.current) {
      containerRef.current.style.transform = "";
    }
  }, [disabled]);

  const mouseEntered = isMouseEntered && !disabled;

  return (
    <MouseEnterContext.Provider value={[mouseEntered, setIsMouseEntered]}>
      <div
        className={cn("py-20 flex items-center justify-center", containerClassName)}
        style={{
          perspective: "1000px",
        }}
      >
        <div
          ref={containerRef}
          onMouseEnter={disabled ? undefined : handleMouseEnter}
          onMouseMove={disabled ? undefined : handleMouseMove}
          onMouseLeave={disabled ? undefined : handleMouseLeave}
          data-mouse-entered={mouseEntered || undefined}
          className={cn(
            "flex items-center justify-center relative transition-all duration-200 ease-linear",
            className
          )}
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {children}
        </div>
      </div>
    </MouseEnterContext.Provider>
  );
};

export const CardBody = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "h-96 w-96 [transform-style:preserve-3d]  [&>*]:[transform-style:preserve-3d]",
        className
      )}
    >
      {children}
    </div>
  );
};

type CardItemProps = {
  as?: React.ElementType;
  children?: React.ReactNode;
  className?: string;
  translateX?: number | string;
  translateY?: number | string;
  translateZ?: number | string;
  rotateX?: number | string;
  rotateY?: number | string;
  rotateZ?: number | string;
} & Omit<React.HTMLAttributes<HTMLElement>, "children" | "className">;

export const CardItem = ({
  as: Tag = "div",
  children,
  className,
  translateX = 0,
  translateY = 0,
  translateZ = 0,
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  ...rest
}: CardItemProps) => {
  const ref = useRef<HTMLElement>(null);
  const [isMouseEntered] = useMouseEnter();

  // While the cursor is over the card, lift this item toward the viewer by its own amount.
  useEffect(() => {
    if (!ref.current) return;
    if (isMouseEntered) {
      ref.current.style.transform = `translateX(${translateX}px) translateY(${translateY}px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`;
    } else {
      ref.current.style.transform = `translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)`;
    }
  }, [isMouseEntered, translateX, translateY, translateZ, rotateX, rotateY, rotateZ]);

  return (
    <Tag ref={ref} className={cn("w-fit transition duration-200 ease-linear", className)} {...rest}>
      {children}
    </Tag>
  );
};

// Create a hook to use the context
export const useMouseEnter = () => {
  const context = useContext(MouseEnterContext);
  if (context === undefined) {
    throw new Error("useMouseEnter must be used within a MouseEnterProvider");
  }
  return context;
};
