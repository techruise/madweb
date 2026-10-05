"use client";
import { useEffect, useRef, useState, useId, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { adminFields } from "@/config/admin-fields";
import type { Media } from "@/lib/catalog-types";
import { AdminMedia } from "./admin-media";
type Row = Record<string, unknown> & { id: string };
export function AdminResource({
  resource,
  rows,
  role,
}: {
  resource: string;
  rows: Row[];
  role: "admin" | "editor";
}) {
  const router = useRouter();
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const [editing, setEditing] = useState<Row | null>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const allFields = adminFields[resource];
  const fields =
    resource === "users" && editing
      ? allFields.filter((field) => field.key === "role")
      : allFields;
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else dialog.current?.close();
  }, [open]);
  const edit = (row: Row | null) => {
    setEditing(row);
    setError("");
    setNotice("");
    setOpen(true);
  };
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const data: Record<string, unknown> = {};
    for (const field of fields) {
      const value = form.get(field.key);
      data[field.key] =
        field.type === "checkbox"
          ? value === "on"
          : field.type === "number"
            ? value === "" && field.nullable
              ? null
              : Number(value)
            : String(value ?? "");
    }
    try {
      const response = await fetch(`/api/admin/${resource}`, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...(editing ? { id: editing.id } : {}), data }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error ?? "Could not save this item.");
      setEditing({ ...editing, ...data, id: result.id ?? editing?.id });
      setNotice("Saved.");
      router.refresh();
      if (resource !== "properties" && resource !== "projects") setOpen(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }
  async function remove(row: Row) {
    if (
      !confirm(
        `Permanently delete this ${resource === "inquiries" ? "enquiry" : "item"}? This cannot be undone.`,
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/admin/${resource}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row.id }),
      });
      if (!response.ok) throw new Error();
      router.refresh();
    } catch {
      setError("Could not delete this item. You may not have permission.");
    } finally {
      setBusy(false);
    }
  }
  const canDelete = resource !== "inquiries" || role === "admin";
  return (
    <>
      <div className="admin-toolbar">
        <p className="muted">{rows.length} items on this page</p>
        {resource !== "inquiries" && (
          <button className="button primary" onClick={() => edit(null)}>
            Add{" "}
            {resource === "properties"
              ? "property"
              : resource === "users"
                ? "user"
                : resource.replace(/s$/, "")}
          </button>
        )}
      </div>
      {error && !open && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {rows.length === 0 ? (
        <div className="empty-state">
          <h2>Nothing here yet.</h2>
          <p>
            {resource === "inquiries"
              ? "New website enquiries will appear here."
              : "Add an item to get started. Publish only verified content."}
          </p>
        </div>
      ) : (
        <div className="admin-rows">
          {rows.map((row) => (
            <article className="admin-row" key={row.id}>
              <div>
                <h2>
                  {String(
                    row.title ??
                      row.name ??
                      row.question ??
                      row.email ??
                      row.id,
                  )}
                </h2>
                <p>
                  {String(row.area ?? "")}
                  {row.service ? ` · ${row.service}` : ""}
                  {row.status ? ` · ${row.status}` : ""}
                  {row.created_at
                    ? ` · ${new Date(String(row.created_at)).toLocaleDateString("en-GB", { timeZone: "Asia/Karachi" })}`
                    : ""}
                </p>
                <div className="row-badges">
                  {"published" in row && (
                    <span>{row.published ? "Published" : "Draft"}</span>
                  )}
                  {"approved" in row && (
                    <span>{row.approved ? "Approved" : "Hidden"}</span>
                  )}
                  {row.is_sample === true && <span>SAMPLE</span>}
                  {row.featured === true && <span>Featured</span>}
                  {Boolean(row.role) && <span>{String(row.role)}</span>}
                </div>
              </div>
              <div className="row-actions">
                <button className="button outline" onClick={() => edit(row)}>
                  {resource === "inquiries" ? "View enquiry" : "Edit"}
                </button>
                {canDelete && (
                  <button
                    className="delete-button"
                    disabled={busy}
                    onClick={() => void remove(row)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
      <dialog
        className="admin-editor"
        ref={dialog}
        aria-label={`Edit ${resource}`}
        onCancel={() => setOpen(false)}
      >
        <button
          className="dialog-close"
          onClick={() => setOpen(false)}
          aria-label="Close editor"
        >
          <X />
        </button>
        <h2>
          {editing ? "Edit" : "Add"}{" "}
          {resource === "properties" ? "property" : resource.replace(/s$/, "")}
        </h2>
        {resource === "inquiries" && editing && (
          <div className="inquiry-details">
            <dl>
              {[
                "name",
                "phone",
                "email",
                "service",
                "area",
                "message",
                "source_page",
                "created_at",
              ].map((key) => (
                <div key={key}>
                  <dt>{key.replaceAll("_", " ")}</dt>
                  <dd>{String(editing[key] ?? "—")}</dd>
                </div>
              ))}
            </dl>
            <div className="hero-ctas">
              <a
                className="button primary"
                href={`https://wa.me/${String(editing.phone).replace(/\D/g, "")}?text=${encodeURIComponent(`Assalam o Alaikum ${editing.name}, this is MAD regarding your enquiry.`)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Reply on WhatsApp
              </a>
              <a className="button outline" href={`tel:${editing.phone}`}>
                Call
              </a>
            </div>
          </div>
        )}
        {open && (
          <form key={editing?.id ?? "new"} onSubmit={save}>
            <div className="form-grid">
              {fields.map((field) => (
                <label
                  key={field.key}
                  className={
                    field.type === "textarea"
                      ? "full-width"
                      : field.type === "checkbox"
                        ? "consent"
                        : ""
                  }
                  htmlFor={`${id}-${field.key}`}
                >
                  {field.type !== "checkbox" && field.label}
                  {field.type === "textarea" ? (
                    <textarea
                      id={`${id}-${field.key}`}
                      name={field.key}
                      defaultValue={String(editing?.[field.key] ?? "")}
                      required={field.key !== "notes"}
                      maxLength={field.key === "description" ? 10000 : 5000}
                    />
                  ) : field.type === "select" ? (
                    <select
                      id={`${id}-${field.key}`}
                      name={field.key}
                      defaultValue={String(
                        editing?.[field.key] ?? field.options?.[0],
                      )}
                    >
                      {field.options?.map((option) => (
                        <option key={option}>{option}</option>
                      ))}
                    </select>
                  ) : field.type === "checkbox" ? (
                    <>
                      <input
                        id={`${id}-${field.key}`}
                        name={field.key}
                        type="checkbox"
                        defaultChecked={editing?.[field.key] === true}
                      />
                      <span>{field.label}</span>
                    </>
                  ) : (
                    <input
                      id={`${id}-${field.key}`}
                      name={field.key}
                      type={field.type}
                      defaultValue={String(
                        editing?.[field.key] ??
                          (field.type === "number" && !field.nullable
                            ? (field.min ?? 0)
                            : ""),
                      )}
                      required={!field.nullable}
                      min={field.min}
                      max={field.max}
                      step={["price", "size"].includes(field.key) ? ".01" : "1"}
                      maxLength={field.type === "password" ? 128 : 200}
                      minLength={field.type === "password" ? 12 : undefined}
                      autoComplete={
                        field.type === "password" ? "new-password" : undefined
                      }
                    />
                  )}
                </label>
              ))}
            </div>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            {notice && (
              <p className="save-notice" role="status">
                {notice}
              </p>
            )}
            <button className="button primary" disabled={busy}>
              {busy ? "Saving…" : "Save changes"}
            </button>
          </form>
        )}
        {open &&
          (resource === "properties" || resource === "projects") &&
          (editing ? (
            <AdminMedia
              key={editing.id}
              kind={resource}
              parent={editing.id}
              title={String(editing.title ?? "")}
              initial={
                (editing[
                  resource === "properties"
                    ? "property_images"
                    : "project_images"
                ] ?? []) as Media[]
              }
            />
          ) : (
            <p className="muted small-copy">
              Save the item first to upload and arrange images.
            </p>
          ))}
      </dialog>
    </>
  );
}
