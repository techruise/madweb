import { site } from "@/config/site";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function Image() {
  const font = await readFile(
    path.join(process.cwd(), "public/fonts/font-2.ttf"),
  );
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        background: "#1C1F26",
        color: "#F5F3F1",
        padding: "65px 80px",
        borderBottom: "12px solid #5B0F1A",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 23,
          letterSpacing: 4,
          color: "#C8A97E",
        }}
      >
        <span>MAD</span>
        <span>LAHORE · EST. {site.established}</span>
      </div>
      <div
        style={{
          fontFamily: "Cormorant",
          fontSize: 85,
          lineHeight: 1.08,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <span>Building Trust.</span>
        <span style={{ color: "#C8A97E" }}>Delivering Homes.</span>
      </div>
      <div style={{ fontSize: 21, color: "#9AA0AB" }}>{site.legalName}</div>
    </div>,
    {
      ...size,
      fonts: [{ name: "Cormorant", data: font, style: "normal", weight: 400 }],
    },
  );
}
