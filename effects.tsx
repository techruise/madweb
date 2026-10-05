"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Monogram } from "./brand";
const DesktopEffects = dynamic(() => import("./desktop-effects"), {
  ssr: false,
});
export function Effects() {
  const [loading, setLoading] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const media = matchMedia(
      "(pointer:fine) and (prefers-reduced-motion:no-preference)",
    );
    const update = () =>
      setDesktop(media.matches && navigator.maxTouchPoints === 0);
    update();
    media.addEventListener("change", update);
    const reduced = matchMedia("(prefers-reduced-motion:reduce)").matches;
    const curtain = setTimeout(() => setLeaving(true), reduced ? 0 : 900);
    const timer = setTimeout(() => setLoading(false), reduced ? 0 : 1750);
    return () => {
      clearTimeout(timer);
      clearTimeout(curtain);
      media.removeEventListener("change", update);
    };
  }, []);
  // The same transform-only curtain uses CSS, so mobile pays no animation-library cost.
  return (
    <>
      {loading && (
        <div
          className={`preloader ${leaving ? "curtain-leaving" : ""}`}
          aria-hidden="true"
        >
          <Monogram animated />
          <span>BUILDING TRUST. DELIVERING HOMES.</span>
        </div>
      )}
      {desktop && <DesktopEffects />}
    </>
  );
}
