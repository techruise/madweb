"use client";
import Image from "next/image";
import { useState } from "react";
import { imageUrl } from "@/lib/images";
import type { CatalogKind, Media } from "@/lib/catalog-types";
export function AdminMedia({
  kind,
  parent,
  initial,
  title,
}: {
  kind: CatalogKind;
  parent: string;
  initial: Media[];
  title: string;
}) {
  const [images, setImages] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [alt, setAlt] = useState(title);
  const [stage, setStage] = useState("after");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const table = kind === "properties" ? "property_images" : "project_images";
  async function upload(files: FileList | null) {
    if (!files?.length || busy) return;
    setBusy(true);
    setError("");
    try {
      for (const file of Array.from(files)) {
        if (file.size > 4 * 1024 * 1024)
          throw new Error("Use images smaller than 4 MB.");
        const data = new FormData();
        data.set("file", file);
        data.set("parent", parent);
        data.set("kind", kind);
        data.set("alt", alt);
        data.set("stage", stage);
        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body: data,
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Upload failed.");
        setImages((current) => [...current, result.image]);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }
  async function reorder(from: number, to: number) {
    if (to < 0 || to >= images.length || busy) return;
    setBusy(true);
    setError("");
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    try {
      for (let i = 0; i < next.length; i++) {
        const response = await fetch(`/api/admin/${table}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: next[i].id,
            data: {
              alt: next[i].alt,
              sort_order: i,
              ...(kind === "projects"
                ? { stage: next[i].stage ?? "after" }
                : {}),
            },
          }),
        });
        if (!response.ok)
          throw new Error(
            "Could not save the order. Reopen this item and try again.",
          );
      }
      setImages(next.map((image, i) => ({ ...image, sort_order: i })));
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to reorder.");
    } finally {
      setBusy(false);
    }
  }
  async function remove(image: Media) {
    if (!confirm("Delete this image permanently?")) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/${table}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: image.id }),
      });
      if (!response.ok) throw new Error();
      setImages((current) => current.filter((item) => item.id !== image.id));
    } catch {
      setError("Could not delete the image.");
    } finally {
      setBusy(false);
    }
  }
  async function editAlt(image: Media) {
    const text = prompt("Image description (3–200 characters)", image.alt);
    if (text === null) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/${table}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: image.id,
          data: {
            alt: text,
            sort_order: image.sort_order,
            ...(kind === "projects" ? { stage: image.stage ?? "after" } : {}),
          },
        }),
      });
      if (!response.ok) throw new Error();
      setImages((current) =>
        current.map((item) =>
          item.id === image.id ? { ...item, alt: text } : item,
        ),
      );
    } catch {
      setError("Could not update the image description.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="admin-media">
      <h3>Images</h3>
      <p className="muted small-copy">
        JPEG, PNG or WebP. Maximum 4 MB per upload (Vercel request limit); 30
        images per item. Drag to reorder or use the arrow buttons.
      </p>
      <label>
        Image description
        <input
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          minLength={3}
          maxLength={200}
        />
      </label>
      {kind === "projects" && (
        <label>
          Photo stage
          <select value={stage} onChange={(e) => setStage(e.target.value)}>
            <option value="before">Before</option>
            <option value="after">After</option>
          </select>
        </label>
      )}
      <div
        className="drop-zone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void upload(event.dataTransfer.files);
        }}
      >
        <label>
          Drop images here or choose files
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            disabled={busy}
            onChange={(event) => {
              void upload(event.target.files);
              event.target.value = "";
            }}
          />
        </label>
      </div>
      {busy && <p role="status">Saving images…</p>}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <div className="admin-media-grid">
        {images.map((image, i) => (
          <div
            key={image.id}
            draggable={!busy}
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (dragIndex !== null) void reorder(dragIndex, i);
              setDragIndex(null);
            }}
          >
            <Image
              src={imageUrl(kind, image.storage_path)}
              alt={image.alt}
              width={180}
              height={120}
            />
            <p>
              {image.alt}
              {image.stage ? ` · ${image.stage}` : ""}
            </p>
            <div className="media-actions">
              <button
                type="button"
                disabled={busy || i === 0}
                onClick={() => void reorder(i, i - 1)}
                aria-label={`Move image ${i + 1} earlier`}
              >
                ↑
              </button>
              <button
                type="button"
                disabled={busy || i === images.length - 1}
                onClick={() => void reorder(i, i + 1)}
                aria-label={`Move image ${i + 1} later`}
              >
                ↓
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void editAlt(image)}
              >
                Alt text
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void remove(image)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
