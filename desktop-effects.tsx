"use client";
import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
export default function DesktopEffects() {
  const ring = useRef<HTMLDivElement>(null),
    dot = useRef<HTMLDivElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    const ctx = gsap.context(() => {
      gsap.to(".hero-scene", {
        y: 65,
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    });
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      ctx.revert();
    };
  }, []);
  useEffect(() => {
    if (
      !matchMedia("(pointer:fine) and (prefers-reduced-motion: no-preference)")
        .matches
    )
      return;
    const move = (event: PointerEvent) => {
      const target = event.target as HTMLElement;
      if (!ring.current || !dot.current) return;
      ring.current.style.opacity = "1";
      dot.current.style.opacity = "1";
      gsap.to(dot.current, {
        x: event.clientX,
        y: event.clientY,
        duration: 0.05,
      });
      gsap.to(ring.current, {
        x: event.clientX,
        y: event.clientY,
        duration: 0.35,
        ease: "power2.out",
      });
      const view = !!target.closest("[data-view]");
      ring.current.classList.toggle(
        "expanded",
        !!target.closest("a,button,[data-view]"),
      );
      ring.current.textContent = view ? "View" : "";
    };
    const leave = () => {
      if (ring.current) ring.current.style.opacity = "0";
      if (dot.current) dot.current.style.opacity = "0";
    };
    const buttons = document.querySelectorAll<HTMLElement>("[data-magnetic]");
    const cleanups = Array.from(buttons).map((button) => {
      const hover = (e: PointerEvent) => {
        const r = button.getBoundingClientRect();
        gsap.to(button, {
          x: (e.clientX - r.left - r.width / 2) * 0.12,
          y: (e.clientY - r.top - r.height / 2) * 0.15,
          duration: 0.35,
        });
      };
      const reset = () => {
        gsap.to(button, { x: 0, y: 0, duration: 0.4 });
      };
      button.addEventListener("pointermove", hover);
      button.addEventListener("pointerleave", reset);
      return () => {
        button.removeEventListener("pointermove", hover);
        button.removeEventListener("pointerleave", reset);
        gsap.killTweensOf(button);
      };
    });
    window.addEventListener("pointermove", move);
    document.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      cleanups.forEach((fn) => fn());
    };
  }, []);
  return (
    <>
      <div className="cursor-dot" ref={dot} />
      <div className="cursor-ring" ref={ring} />
    </>
  );
}
