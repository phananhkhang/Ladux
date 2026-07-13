import { useCallback, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { cn } from "./ui/utils";

type ProductImageMagnifierProps = {
  src: string;
  alt: string;
  /** Lens diameter in px (default 168) */
  lensSize?: number;
  /** Zoom multiplier inside the lens (default 2.5) */
  zoom?: number;
  className?: string;
  imageClassName?: string;
};

/**
 * Product main image with a classic circular magnifying-glass hover effect.
 * Disabled on coarse pointers (touch) where hover is unreliable.
 */
export function ProductImageMagnifier({
  src,
  alt,
  lensSize = 168,
  zoom = 2.5,
  className,
  imageClassName,
}: ProductImageMagnifierProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [canHover, setCanHover] = useState(true);
  const [lens, setLens] = useState({
    x: 0,
    y: 0,
    imgLeft: 0,
    imgTop: 0,
  });
  const [box, setBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    setActive(false);
  }, [src]);

  const measure = useCallback(() => {
    const el = containerRef.current;
    if (!el) return { w: 0, h: 0, left: 0, top: 0 };
    const rect = el.getBoundingClientRect();
    return { w: rect.width, h: rect.height, left: rect.left, top: rect.top };
  }, []);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canHover) return;
    const { w, h, left, top } = measure();
    if (w <= 0 || h <= 0) return;

    const x = Math.max(0, Math.min(w, e.clientX - left));
    const y = Math.max(0, Math.min(h, e.clientY - top));
    const half = lensSize / 2;

    // Keep lens fully inside the image
    const lx = Math.max(half, Math.min(w - half, x));
    const ly = Math.max(half, Math.min(h - half, y));

    // Zoomed image is (w*zoom)×(h*zoom) with same object-cover crop scale;
    // shift so the point under the cursor sits at the center of the lens.
    const imgLeft = half - x * zoom;
    const imgTop = half - y * zoom;

    setBox({ w, h });
    setLens({ x: lx, y: ly, imgLeft, imgTop });
    setActive(true);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-muted select-none",
        // Hide system cursor while the lens is open so no + / crosshair sits in the glass
        canHover && (active ? "cursor-none" : "cursor-zoom-in"),
        className,
      )}
      onMouseMove={onMove}
      onMouseEnter={(e) => {
        if (canHover) onMove(e);
      }}
      onMouseLeave={() => setActive(false)}
      role="img"
      aria-label={alt}
    >
      <ImageWithFallback
        src={src}
        alt={alt}
        draggable={false}
        className={cn(
          "aspect-[4/3] w-full object-cover pointer-events-none",
          imageClassName,
        )}
      />

      {canHover && !active && (
        <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-1 text-xs text-muted-foreground shadow-sm backdrop-blur transition-opacity duration-200 group-hover:opacity-0">
          <Search size={12} />
          Di chuột để phóng to
        </div>
      )}

      {canHover && active && box.w > 0 && (
        <div
          className="pointer-events-none absolute z-10 overflow-hidden rounded-full border-2 border-background shadow-xl ring-1 ring-black/15"
          style={{
            width: lensSize,
            height: lensSize,
            left: lens.x - lensSize / 2,
            top: lens.y - lensSize / 2,
          }}
        >
          <img
            src={src}
            alt=""
            draggable={false}
            className="absolute max-w-none object-cover"
            style={{
              width: box.w * zoom,
              height: box.h * zoom,
              left: lens.imgLeft,
              top: lens.imgTop,
            }}
          />
          {/* Glass rim highlight */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 via-transparent to-black/15" />
          <div className="absolute inset-[3px] rounded-full ring-1 ring-white/40" />
        </div>
      )}
    </div>
  );
}
