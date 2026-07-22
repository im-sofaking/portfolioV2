import { useEffect, useRef, useState } from "react";

const INTERVAL_MS = 1000;

function pickNext(current: number, total: number): number {
  if (total <= 1) return 0;
  let next = Math.floor(Math.random() * total);
  if (next === current) next = (next + 1) % total;
  return next;
}

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getNextScatterImage(images: string[], currentSrc: string | null, queue: string[]): string | null {
  if (queue.length === 0) {
    const candidates = currentSrc ? images.filter((src) => src !== currentSrc) : [...images];
    queue.push(...shuffleArray(candidates));
  }
  return queue.shift() ?? null;
}

function measureScatterSize(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const maxSide = Math.min(window.innerWidth * 0.22, 260);
      const iw = img.naturalWidth || 400;
      const ih = img.naturalHeight || 300;
      const largest = Math.max(iw, ih);
      const sizeScale = Math.min(1, maxSide / largest);
      resolve({
        width: Math.round(iw * sizeScale),
        height: Math.round(ih * sizeScale),
      });
    };
    img.onerror = () => resolve({ width: 220, height: 220 });
    img.src = src;
  });
}

type ScatterItem = {
  id: number;
  src: string;
  top: number; // %
  left: number; // %
  rotate: number; // deg
  scale: number;
  width: number;
  height: number;
  z: number;
};

function makeScatter(id: number, src: string, z: number, size: { width: number; height: number }): ScatterItem {
  return {
    id,
    src,
    top: 10 + Math.random() * 60,
    left: 10 + Math.random() * 60,
    rotate: (Math.random() - 0.5) * 24,
    scale: 0.75 + Math.random() * 0.4,
    width: size.width,
    height: size.height,
    z,
  };
}

type Props = {
  images: string[];
  emptyHint?: string;
  playEnabled?: boolean;
};

export function Slideshow({ images, emptyHint, playEnabled = true }: Props) {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [scatter, setScatter] = useState(false);
  const [items, setItems] = useState<ScatterItem[]>([]);
  const [homeResetToken, setHomeResetToken] = useState(0);
  const total = images.length;
  const targetScatterItemCount = Math.min(total, 10);
  const timerRef = useRef<number | null>(null);
  const nextId = useRef(0);
  const zRef = useRef(1);
  const scatterQueueRef = useRef<string[]>([]);
  const scatterStartedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    id: number;
    pointerId: number;
    offsetX: number; // px from item center
    offsetY: number;
    moved: boolean;
  } | null>(null);
  const rotateRef = useRef<{
    id: number;
    pointerId: number;
    startAngle: number;
    startRotate: number;
  } | null>(null);


  // Preload the next image so the swap is instant.
  useEffect(() => {
    if (total <= 1) return;
    const nextIdx = pickNext(index, total);
    const img = new Image();
    img.src = images[nextIdx];
  }, [index, total, images]);

  useEffect(() => {
    const resetHome = () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setScatter(false);
      setItems([]);
      setLoaded(false);
      setIndex(0);
      setHomeResetToken((value) => value + 1);
      scatterQueueRef.current = [];
      nextId.current = 0;
      zRef.current = 1;
      scatterStartedRef.current = false;
    };

    window.addEventListener("portfolio:leave-home", resetHome);
    return () => window.removeEventListener("portfolio:leave-home", resetHome);
  }, []);

  useEffect(() => {
    if (total <= 1) return;
    if (!playEnabled) return; // wait until allowed (darkroom sequence)

    // Stop adding more scatter images once we've reached the scatter target count.
    if (scatter && items.length >= targetScatterItemCount) {
      console.debug("[scatter] stop-interval", {
        reason: "target-count-reached",
        itemsCount: items.length,
        targetScatterItemCount,
      });
      if (timerRef.current) window.clearInterval(timerRef.current);
      return;
    }

    timerRef.current = window.setInterval(() => {
      setIndex((i) => {
        const n = pickNext(i, total);
        if (scatter) {
          setItems((prev) => {
            if (prev.length >= targetScatterItemCount) {
              console.debug("[scatter] stop-add", {
                reason: "target-count-reached",
                itemsCount: prev.length,
                targetScatterItemCount,
              });
              return prev;
            }

            const nextSrc = scatterQueueRef.current.shift();
            if (!nextSrc) {
              console.debug("[scatter] stop-add", {
                reason: "queue-exhausted",
                itemsCount: prev.length,
                targetScatterItemCount,
              });
              if (timerRef.current) {
                window.clearInterval(timerRef.current);
                timerRef.current = null;
              }
              return prev;
            }

            const id = nextId.current++;
            const z = zRef.current++;

            void measureScatterSize(nextSrc).then(({ width, height }) => {
              const item = {
                ...makeScatter(id, nextSrc, z, { width, height }),
              };
              setItems((current) => [...current, item]);
            });

            console.debug("[scatter] add-item", {
              id,
              src: nextSrc,
              itemsCount: prev.length + 1,
              targetScatterItemCount,
              remainingQueue: scatterQueueRef.current.length,
            });

            return prev;
          });
        } else {
          setLoaded(false);
        }
        return n;
      });
    }, INTERVAL_MS);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [total, scatter, images, items.length, playEnabled, targetScatterItemCount]);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh] p-8">
        <p className="text-sm opacity-70 max-w-md text-center">
          {emptyHint ??
            "Drop your photos in src/assets/photos/ and they'll appear here automatically."}
        </p>
      </div>
    );
  }

  // If playEnabled is false (e.g. during darkroom warm/dark phases), don't show images yet
  if (!playEnabled && !scatter) {
    return <div className="relative w-full min-h-[70vh] md:min-h-screen" />;
  }

  const enterScatter = () => {
    if (scatter) return;
    const currentSrc = images[index];
    const otherImages = images.filter((src) => src !== currentSrc);
    const maxScatterImages = Math.min(9, otherImages.length);
    const randomOthers = shuffleArray(otherImages).slice(0, maxScatterImages);
    scatterQueueRef.current = randomOthers;
    scatterStartedRef.current = true;

    const initialId = nextId.current++;
    console.debug("[scatter] enter", {
      currentSrc,
      totalImages: images.length,
      otherImagesCount: otherImages.length,
      queuedImagesCount: randomOthers.length,
      targetScatterItemCount,
    });

    void measureScatterSize(currentSrc).then(({ width, height }) => {
      const initialItem = makeScatter(initialId, currentSrc, zRef.current++, { width, height });
      setItems([initialItem]);
      setScatter(true);
    });
  };

  const onItemPointerDown = (e: React.PointerEvent<HTMLImageElement>, id: number) => {
    e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const item = items.find((it) => it.id === id);
    if (!item) return;
    const itemCenterX = rect.left + (item.left / 100) * rect.width;
    const itemCenterY = rect.top + (item.top / 100) * rect.height;
    dragRef.current = {
      id,
      pointerId: e.pointerId,
      offsetX: e.clientX - itemCenterX,
      offsetY: e.clientY - itemCenterY,
      moved: false,
    };
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    // Bring to front immediately
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, z: zRef.current++ } : it)),
    );
  };

  const onItemPointerMove = (e: React.PointerEvent<HTMLImageElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - drag.offsetX - rect.left;
    const y = e.clientY - drag.offsetY - rect.top;
    const left = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const top = Math.max(0, Math.min(100, (y / rect.height) * 100));
    drag.moved = true;
    setItems((prev) => prev.map((it) => (it.id === drag.id ? { ...it, top, left } : it)));
  };

  const onItemPointerUp = (e: React.PointerEvent<HTMLImageElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch {}
    dragRef.current = null;
  };

  const onRotateStart = (e: React.PointerEvent<HTMLDivElement>, id: number) => {
    e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;
    const item = items.find((it) => it.id === id);
    if (!item) return;
    const rect = container.getBoundingClientRect();
    const cx = rect.left + (item.left / 100) * rect.width;
    const cy = rect.top + (item.top / 100) * rect.height;
    const angle = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI;
    rotateRef.current = {
      id,
      pointerId: e.pointerId,
      startAngle: angle,
      startRotate: item.rotate,
    };
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, z: zRef.current++ } : it)),
    );
  };

  const onRotateMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = rotateRef.current;
    if (!r || r.pointerId !== e.pointerId) return;
    const container = containerRef.current;
    if (!container) return;
    const item = items.find((it) => it.id === r.id);
    if (!item) return;
    const rect = container.getBoundingClientRect();
    const cx = rect.left + (item.left / 100) * rect.width;
    const cy = rect.top + (item.top / 100) * rect.height;
    const angle = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI;
    const rotate = r.startRotate + (angle - r.startAngle);
    setItems((prev) => prev.map((it) => (it.id === r.id ? { ...it, rotate } : it)));
  };

  const onRotateEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = rotateRef.current;
    if (!r || r.pointerId !== e.pointerId) return;
    try {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    } catch {}
    rotateRef.current = null;
  };


  if (scatter) {
    return (
      <div
        ref={containerRef}
        className="fixed inset-0 w-screen h-screen overflow-hidden select-none z-40 pointer-events-none"
      >
        {items.map((it) => (
          <div
            key={it.id}
            className="absolute pointer-events-auto animate-fade-in"
            style={{
              top: `${it.top}%`,
              left: `${it.left}%`,
              zIndex: it.z,
              transform: `translate(-50%, -50%) rotate(${it.rotate}deg)`,
              width: it.width ? `${it.width}px` : undefined,
              height: it.height ? `${it.height}px` : undefined,
            }}
          >
            <img
              src={it.src}
              alt=""
              decoding="async"
              loading="lazy"
              draggable={false}
              onPointerDown={(e) => onItemPointerDown(e, it.id)}
              onPointerMove={onItemPointerMove}
              onPointerUp={onItemPointerUp}
              onPointerCancel={onItemPointerUp}
              style={{ width: it.width ? `${it.width}px` : 'auto', height: it.height ? `${it.height}px` : 'auto' }}
              className="block object-contain shadow-2xl cursor-grab active:cursor-grabbing touch-none select-none"
            />
            {(["tl", "tr", "bl", "br"] as const).map((pos) => (
              <div
                key={pos}
                onPointerDown={(e) => onRotateStart(e, it.id)}
                onPointerMove={onRotateMove}
                onPointerUp={onRotateEnd}
                onPointerCancel={onRotateEnd}
                className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 touch-none cursor-alias"
                style={{
                  top: pos.startsWith("t") ? 0 : "100%",
                  left: pos.endsWith("l") ? 0 : "100%",
                }}
                title="Trascina per ruotare"
              />
            ))}
          </div>
        ))}

      </div>
    );
  }


  return (
    <div className="relative w-full min-h-[70vh] md:min-h-screen overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center p-4 md:p-12">
        <img
          key={`${index}-${homeResetToken}`}
          src={images[index]}
          alt=""
          onLoad={() => setLoaded(true)}
          onClick={enterScatter}
          decoding="async"
          loading={index === 0 ? "eager" : "lazy"}
          fetchPriority={index === 0 ? "high" : "auto"}
          className={`max-w-[70%] max-h-[55vh] w-auto h-auto object-contain cursor-pointer transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>
    </div>
  );
}
