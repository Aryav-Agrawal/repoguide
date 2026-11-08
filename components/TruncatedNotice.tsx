export default function TruncatedNotice() {
  return (
    <p className="rounded-lg border border-warn/30 bg-warn-soft px-4 py-3 text-sm text-ink">
      <span className="font-medium text-warn">Partial file list.</span> This repo is so big that
      GitHub only sent part of its file tree, so some files are missing below.
    </p>
  );
}
