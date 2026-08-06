"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Megaphone, Trash2, Upload } from "lucide-react";

import { advertisementsApi, apiErrorMessage, useNotificationStore, type Advertisement } from "@career-os/shared";
import { Badge, Button, EmptyState, EnterpriseCard, ErrorState, SkeletonCard } from "@career-os/ui";
import { cn } from "@career-os/utils";

import { inputClass } from "../admin-portal";
import { FormCard, TextField } from "./shared";

const queryKey = ["admin", "advertisements"];

export function AdvertisementsView() {
  const client = useQueryClient();
  const notify = useNotificationStore((state) => state.notify);
  const query = useQuery({ queryKey, queryFn: advertisementsApi.list });
  const items = (query.data && typeof query.data === "object" && Array.isArray((query.data as { items?: unknown }).items)
    ? (query.data as { items: Advertisement[] }).items
    : []
  );

  const refresh = () => client.invalidateQueries({ queryKey });
  const failed = (error: unknown) => notify({ title: "Advertisement action failed", description: apiErrorMessage(error), intent: "error" });

  const toggleActive = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => advertisementsApi.update(id, { is_active }),
    onSuccess: () => { refresh(); notify({ title: "Advertisement updated", description: "Visibility changed.", intent: "success" }); },
    onError: failed
  });
  const remove = useMutation({
    mutationFn: (id: string) => advertisementsApi.remove(id),
    onSuccess: () => { refresh(); notify({ title: "Advertisement removed", description: "The banner was deleted.", intent: "success" }); },
    onError: failed
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <UploadForm onUploaded={refresh} />
      <EnterpriseCard title="Homepage Banners" description="Every banner uploaded, active or not. Only active banners within their schedule show on the homepage." icon={<Megaphone size={18} />} badge={<Badge>{items.length}</Badge>} disabled={false}>
        {query.isPending ? (
          <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 2 }, (_, i) => <SkeletonCard key={i} lines={3} />)}</div>
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => void query.refetch()} retrying={query.isFetching} />
        ) : items.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((ad) => (
              <div key={ad.id} className="overflow-hidden rounded-[var(--radius-career-card)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-lowest)]">
                <div className="aspect-[3/1] w-full overflow-hidden bg-[var(--cos-surface-container-low)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ad.image_url} alt={ad.alt_text || ad.title} className="h-full w-full object-cover" />
                </div>
                <div className="grid gap-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold">{ad.title}</h3>
                    <Badge tone={ad.is_active ? "success" : "neutral"}>{ad.is_active ? "Active" : "Hidden"}</Badge>
                  </div>
                  {ad.link_url ? <a href={ad.link_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-[var(--cos-primary)] hover:underline"><ExternalLink size={12} /> {ad.link_url}</a> : null}
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" loading={toggleActive.isPending} disabled={toggleActive.isPending} onClick={() => toggleActive.mutate({ id: ad.id, is_active: !ad.is_active })}>
                      {ad.is_active ? "Hide" : "Show"}
                    </Button>
                    <Button size="sm" variant="danger" loading={remove.isPending} disabled={remove.isPending} onClick={() => { if (window.confirm(`Remove "${ad.title}"? This cannot be undone.`)) remove.mutate(ad.id); }}>
                      <Trash2 size={14} /> Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={<Megaphone size={18} />} title="No banners yet" description="Upload a banner using the form to have it appear on the homepage." />
        )}
      </EnterpriseCard>
    </div>
  );
}

function UploadForm({ onUploaded }: { onUploaded: () => void }) {
  const notify = useNotificationStore((state) => state.notify);
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const upload = useMutation({
    mutationFn: () => {
      if (!file) throw new Error("Choose an image first.");
      return advertisementsApi.create(file, { title: title.trim(), link_url: linkUrl.trim(), alt_text: altText.trim() });
    },
    onSuccess: () => {
      notify({ title: "Banner uploaded", description: "It's now live on the homepage.", intent: "success" });
      setTitle(""); setLinkUrl(""); setAltText(""); setFile(null); setPreviewUrl("");
      if (fileRef.current) fileRef.current.value = "";
      onUploaded();
    },
    onError: (error) => notify({ title: "Upload failed", description: apiErrorMessage(error), intent: "error" })
  });

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = event.target.files?.[0] ?? null;
    setFile(picked);
    setPreviewUrl(picked ? URL.createObjectURL(picked) : "");
  }

  return (
    <FormCard title="Upload a Banner" description="Add a new advertisement banner for the homepage." icon={<Upload size={18} />}>
      <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); if (title.trim() && file) upload.mutate(); }}>
        <label className="grid gap-1.5 text-sm font-semibold">
          <span>Banner image (PNG, JPEG, WEBP, or GIF, up to 5MB)</span>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" required onChange={onFileChange} className={cn(inputClass, "h-auto py-2")} />
        </label>
        {previewUrl ? (
          <div className="aspect-[3/1] w-full overflow-hidden rounded-[var(--radius-career-button)] border border-[var(--cos-outline-variant)] bg-[var(--cos-surface-container-low)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
          </div>
        ) : null}
        <TextField label="Title (internal label)" value={title} setValue={setTitle} required />
        <TextField label="Link URL (where clicking the banner goes)" value={linkUrl} setValue={setLinkUrl} type="url" />
        <TextField label="Alt text (for accessibility; defaults to title)" value={altText} setValue={setAltText} />
        <Button type="submit" loading={upload.isPending} disabled={upload.isPending || !title.trim() || !file}>
          <Upload size={16} /> Upload banner
        </Button>
      </form>
    </FormCard>
  );
}
