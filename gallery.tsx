"use client";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { imagePlaceholder, imageUrl } from "@/lib/images";
import type { CatalogKind, Media } from "@/lib/catalog-types";
export function Gallery({
  images,
  kind,
  title,
}: {
  images: Media[];
  kind: CatalogKind;
  title: string;
}) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const entries: Media[] = images.length
    ? images
    : [
        {
          id: "placeholder",
          storage_path: "",
          alt: `${title}: image awaiting owner upload`,
          sort_order: 0,
        },
      ];
  const show = (offset: number) =>
    setActive((value) => (value + offset + entries.length) % entries.length);
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);
  return (
    <div className="gallery">
      <button
        className="gallery-main"
        onClick={() => setOpen(true)}
        aria-label="Open image gallery"
      >
        <Image
          src={imageUrl(kind, entries[active].storage_path)}
          alt={entries[active].alt}
          fill
          sizes="(max-width: 767px) 86vw, 65vw"
          placeholder="blur"
          blurDataURL={imagePlaceholder}
        />
        <span>
          View gallery · {active + 1}/{entries.length}
        </span>
      </button>
      <div className="gallery-thumbs">
        {entries.map((image, i) => (
          <button
            key={image.id}
            aria-label={`View image ${i + 1}${image.stage ? ` (${image.stage})` : ""}`}
            aria-pressed={i === active}
            onClick={() => setActive(i)}
          >
            <Image
              src={imageUrl(kind, image.storage_path)}
              alt={image.alt}
              fill
              sizes="100px"
            />
            {image.stage && <span>{image.stage}</span>}
          </button>
        ))}
      </div>
      <dialog
        className="lightbox"
        ref={dialog}
        onCancel={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOpen(false);
        }}
        aria-label={`${title} image gallery`}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") show(1);
          if (e.key === "ArrowLeft") show(-1);
        }}
      >
        <button
          className="dialog-close"
          onClick={() => setOpen(false)}
          aria-label="Close gallery"
        >
          <X />
        </button>
        <div className="lightbox-image">
          <Image
            src={imageUrl(kind, entries[active].storage_path)}
            alt={entries[active].alt}
            fill
            sizes="90vw"
          />
        </div>
        <div className="gallery-controls">
          <button onClick={() => show(-1)} aria-label="Previous image">
            <ChevronLeft />
          </button>
          <p aria-live="polite">
            {entries[active].alt} · {active + 1}/{entries.length}
          </p>
          <button onClick={() => show(1)} aria-label="Next image">
            <ChevronRight />
          </button>
        </div>
      </dialog>
    </div>
  );
}
