export function ContentSkeleton({
  label = "Loading",
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div role="status" className={className}>
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="space-y-3 motion-safe:animate-pulse">
        <div className="h-5 w-2/5 rounded-md bg-slate-200" />
        <div className="h-3 w-full rounded bg-slate-100" />
        <div className="h-3 w-3/4 rounded bg-slate-100" />
      </div>
    </div>
  );
}
