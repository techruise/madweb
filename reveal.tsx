"use client";
import { useEffect, useRef, type ReactNode } from "react";
/** Visible without JS. Framer Motion loads only when a desktop section enters view. */
export function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || matchMedia("(prefers-reduced-motion:reduce)").matches)
      return;
    let disposed = false;
    let stop: (() => void) | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        if (matchMedia("(pointer:fine)").matches) {
          void import("framer-motion").then(({ animate }) => {
            if (disposed) return;
            const animation = animate(
              element,
              { opacity: [0.5, 1], y: [22, 0] },
              { duration: 0.65, ease: "easeOut" },
            );
            stop = () => animation.stop();
          });
        } else {
          const animation = element.animate(
            [
              { opacity: 0.5, transform: "translateY(22px)" },
              { opacity: 1, transform: "translateY(0)" },
            ],
            { duration: 450, easing: "ease-out" },
          );
          stop = () => animation.cancel();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(element);
    return () => {
      disposed = true;
      observer.disconnect();
      stop?.();
    };
  }, []);
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
