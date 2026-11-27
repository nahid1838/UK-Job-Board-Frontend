import { ContentSkeleton } from "@/components/shared/content-skeleton";

export default function LoadingAuth() {
  return (
    <div className="space-y-4">
      <ContentSkeleton label="Loading account form" />
      <div aria-hidden="true" className="space-y-3 motion-safe:animate-pulse">
        <div className="h-11 rounded-lg bg-slate-100" />
        <div className="h-11 rounded-lg bg-slate-100" />
        <div className="h-11 rounded-lg bg-emerald-100" />
      </div>
    </div>
  );
}
