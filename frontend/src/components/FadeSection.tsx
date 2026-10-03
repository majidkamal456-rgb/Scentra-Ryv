"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** Render visible immediately (matches Django's `fade-section visible`). */
  visible?: boolean;
  id?: string;
};

/** Port of the IntersectionObserver reveal used by static/js/main.js. */
export function FadeSection({ children, className = "", as: Tag = "section", visible = false, id }: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(visible);

  useEffect(() => {
    if (visible || shown) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible, shown]);

  return (
    <Tag ref={ref} id={id} className={`fade-section ${shown ? "visible" : ""} ${className}`}>
      {children}
    </Tag>
  );
}
