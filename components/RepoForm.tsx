"use client";

import { useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useTypingPlaceholder } from "@/hooks/use-typing-placeholder";
import AnalyzeButton from "./AnalyzeButton";
import { BorderBeam } from "./ui/border-beam";

type RepoFormProps = {
  url: string;
  onUrlChange: (url: string) => void;
  onSubmit: () => void;
  loading: boolean;
};

export default function RepoForm({ url, onUrlChange, onSubmit, loading }: RepoFormProps) {
  const reduceMotion = usePrefersReducedMotion();
  const [focused, setFocused] = useState(false);
  // Becomes true the first time the visitor clicks or tabs into the input, and stays true.
  const [touched, setTouched] = useState(false);
  const placeholder = useTypingPlaceholder({ stopped: touched, paused: url !== "" });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="flex flex-col gap-2"
    >
      <label htmlFor="repo-url" className="text-sm font-medium text-ink">
        GitHub repo URL
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* The wrapper holds the light that travels around the input's border. */}
        <div className="relative w-full min-w-0 rounded-lg sm:flex-1">
          <input
            id="repo-url"
            type="text"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            required
            value={url}
            onChange={(event) => onUrlChange(event.target.value)}
            onPointerDown={() => setTouched(true)}
            onFocus={() => {
              setTouched(true);
              setFocused(true);
            }}
            onBlur={() => setFocused(false)}
            placeholder={placeholder}
            className="h-12 w-full min-w-0 rounded-lg border border-line bg-surface px-4 font-mono text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          {/* Decorative, so it's skipped with reduced motion. Brighter and thicker while typing. */}
          {!reduceMotion && (
            <BorderBeam
              size={80}
              duration={8}
              borderWidth={focused ? 2 : 1}
              colorFrom="var(--accent)"
              colorTo="color-mix(in srgb, var(--accent) 30%, transparent)"
              className={`transition-opacity duration-300 ${focused ? "opacity-100" : "opacity-50"}`}
            />
          )}
        </div>
        <AnalyzeButton loading={loading} />
      </div>
    </form>
  );
}
