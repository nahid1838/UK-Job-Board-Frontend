"use client";

import { ContentSkeleton } from "@/components/shared/content-skeleton";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { backendErrorMessage, backendRequest } from "@/lib/backend";
import type { Category } from "@/lib/categories";
import { useEffect, useState, type FormEvent } from "react";

type ManagedCategory = Category & { active: boolean };
const panelStyle = "rounded-2xl border border-slate-200 bg-white p-5 sm:p-6";
const inputStyle = "mt-1 block min-h-10 w-full rounded-lg border border-slate-300 px-3 font-normal focus-visible:outline-2 focus-visible:outline-emerald-700";

function CategoryForm({ category, disabled, save }: {
  category?: ManagedCategory;
  disabled: boolean;
  save: (event: FormEvent<HTMLFormElement>, id?: string) => void;
}) {
  return (
    <form method="post" onSubmit={(event) => save(event, category?._id)} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_7rem_auto_auto] sm:items-end">
      <label className="text-sm font-semibold">Name
        <input name="name" required maxLength={100} defaultValue={category?.name} className={inputStyle} />
      </label>
      <label className="text-sm font-semibold">Display order
        <input name="order" type="number" min={0} max={9999} step={1} defaultValue={category?.order ?? 0} required className={inputStyle} />
      </label>
      <label className="flex min-h-10 items-center gap-2 text-sm font-medium">
        <input name="active" type="checkbox" defaultChecked={category?.active ?? true} className="size-4 accent-emerald-700" />
        Visible
      </label>
      <Button type="submit" disabled={disabled} variant={category ? "outline" : "default"} className={`min-h-10 ${category ? "" : "bg-[#007653] hover:bg-[#005c41]"}`}>
        {category ? "Save changes" : "Add category"}
      </Button>
    </form>
  );
}

export function CategoryManager() {
  const [categories, setCategories] = useState<ManagedCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    backendRequest<{ categories: ManagedCategory[] }>("/api/admin/categories", { signal: controller.signal })
      .then(({ categories }) => { if (!controller.signal.aborted) setCategories(categories); })
      .catch((error) => { if (!controller.signal.aborted) setLoadError(backendErrorMessage(error)); })
      .finally(() => { if (!controller.signal.aborted) setIsLoading(false); });
    return () => controller.abort();
  }, []);

  async function save(event: FormEvent<HTMLFormElement>, id?: string) {
    event.preventDefault();
    if (isSaving) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    setIsSaving(true);
    setSaveError("");
    setNotice("");
    try {
      const { category } = await backendRequest<{ category: ManagedCategory }>(id ? `/api/admin/categories/${id}` : "/api/admin/categories", {
        method: id ? "PATCH" : "POST",
        body: JSON.stringify({ name: values.get("name"), order: Number(values.get("order")), active: values.has("active") }),
      });
      setCategories((current) => [...current.filter((item) => item._id !== category._id), category]
        .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "en-GB")));
      const message = id ? `${category.name} was updated.` : `${category.name} was added.`;
      setNotice(message);
      toast.success("Category saved", { description: message });
      if (!id) form.reset();
    } catch (error) {
      const message = backendErrorMessage(error);
      setSaveError(message);
      toast.error("Couldn’t save the category", { description: message });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <ContentSkeleton label="Loading categories…" className="mt-6 text-sm" />;
  if (loadError) return <p role="alert" className="mt-6 text-sm text-red-700">{loadError} Refresh to retry.</p>;

  return (
    <div className="mt-6 space-y-4">
      <section className={panelStyle}>
        <h2 className="mb-3 text-lg font-bold">Add a category</h2>
        <CategoryForm save={save} disabled={isSaving} />
      </section>
      {saveError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{saveError}</p>}
      {notice && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p>}
      <section className={panelStyle}>
        <h2 className="text-lg font-bold">Manage categories</h2>
        <p className="mt-1 text-sm text-slate-600">Lower display numbers appear first. Clear Visible to hide a category.</p>
        {categories.length === 0 && <p className="mt-4 text-sm text-slate-600">No categories have been added yet.</p>}
        <ul className="mt-4 divide-y divide-slate-200">
          {categories.map((category) => (
            <li key={category._id} className="py-3">
              <CategoryForm key={`${category.name}-${category.order}-${category.active}`} category={category} save={save} disabled={isSaving} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
