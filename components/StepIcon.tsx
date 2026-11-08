type StepIconProps = {
  status: "waiting" | "active" | "done";
};

// The circle next to each step: hollow while waiting, spinning while active, a tick when done.
export default function StepIcon({ status }: StepIconProps) {
  if (status === "done") {
    return (
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink">
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3.5 8.5l3 3 6-7" />
        </svg>
      </span>
    );
  }

  if (status === "active") {
    return (
      <span className="size-5 shrink-0 animate-spin rounded-full border-2 border-accent/25 border-t-accent motion-reduce:animate-none" />
    );
  }

  return <span className="size-5 shrink-0 rounded-full border-2 border-line" />;
}
