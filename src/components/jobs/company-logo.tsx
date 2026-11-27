import Image from "next/image";

export function CompanyLogo({ name, src }: { name: string; src?: string }) {
  if (src) {
    return <Image src={src} alt={name} width={144} height={36} unoptimized className="h-9 w-auto max-w-full object-contain object-left" />;
  }
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "UK";
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-lg bg-emerald-50 text-xs font-bold text-emerald-800">{initials}</span>
      <span className="min-w-0 truncate text-sm font-bold" title={name}>{name}</span>
    </span>
  );
}
