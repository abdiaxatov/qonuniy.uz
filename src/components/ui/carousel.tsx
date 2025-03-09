"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  autoPlay?: boolean;
  interval?: number;
  showControls?: boolean;
  showIndicators?: boolean;
}

interface CarouselContextProps {
  api: {
    canScrollPrev: boolean;
    canScrollNext: boolean;
    scrollPrev: () => void;
    scrollNext: () => void;
    setActiveIndex: (index: number) => void;
    activeIndex: number;
    itemCount: number;
  };
}

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

export function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }
  return context;
}

export function Carousel({
  children,
  autoPlay = false,
  interval = 5000,
  showControls = true,
  showIndicators = true,
  className,
  ...props
}: CarouselProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const itemsRef = React.useRef<HTMLDivElement[]>([]);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [itemCount, setItemCount] = React.useState(0);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(true);
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

  const updateScrollButtons = React.useCallback(() => {
    if (activeIndex === 0) {
      setCanScrollPrev(false);
    } else {
      setCanScrollPrev(true);
    }

    if (activeIndex === itemCount - 1) {
      setCanScrollNext(false);
    } else {
      setCanScrollNext(true);
    }
  }, [activeIndex, itemCount]);

  const scrollPrev = React.useCallback(() => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  }, [activeIndex]);

  const scrollNext = React.useCallback(() => {
    if (activeIndex < itemCount - 1) {
      setActiveIndex(activeIndex + 1);
    }
  }, [activeIndex, itemCount]);

  // Handle touch events for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && canScrollNext) {
      scrollNext();
    } else if (isRightSwipe && canScrollPrev) {
      scrollPrev();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Auto play functionality
  React.useEffect(() => {
    if (autoPlay) {
      const timer = setInterval(() => {
        if (activeIndex < itemCount - 1) {
          setActiveIndex(activeIndex + 1);
        } else {
          setActiveIndex(0);
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [autoPlay, interval, activeIndex, itemCount]);

  // Update scroll buttons when active index changes
  React.useEffect(() => {
    updateScrollButtons();
  }, [activeIndex, updateScrollButtons]);

  // Count items and set up refs
  React.useEffect(() => {
    if (containerRef.current) {
      const items = containerRef.current.querySelectorAll('[data-carousel-item]');
      setItemCount(items.length);
      itemsRef.current = Array.from(items) as HTMLDivElement[];
    }
  }, [children]);

  const api = React.useMemo(
    () => ({
      canScrollPrev,
      canScrollNext,
      scrollPrev,
      scrollNext,
      activeIndex,
      setActiveIndex,
      itemCount,
    }),
    [canScrollPrev, canScrollNext, scrollPrev, scrollNext, activeIndex, itemCount]
  );

  return (
    <CarouselContext.Provider value={{ api }}>
      <div
        ref={containerRef}
        className={cn("relative", className)}
        {...props}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="overflow-hidden">
          {children}
        </div>
        
        {showControls && (
          <>
            <CarouselPrevious />
            <CarouselNext />
          </>
        )}
        
        {showIndicators && <CarouselIndicators />}
      </div>
    </CarouselContext.Provider>
  );
}

export function CarouselContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { api } = useCarousel();
  
  return (
    <div
      className={cn("flex transition-transform duration-300 ease-in-out", className)}
      style={{ transform: `translateX(-${api.activeIndex * 100}%)` }}
      {...props}
    />
  );
}

export function CarouselItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-carousel-item
      className={cn("min-w-0 flex-shrink-0 flex-grow-0 basis-full", className)}
      {...props}
    />
  );
}

export function CarouselPrevious({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { api } = useCarousel();
  
  return (
    <button
      className={cn(
        "absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 shadow-md hover:bg-background disabled:opacity-50",
        className
      )}
      disabled={!api.canScrollPrev}
      onClick={api.scrollPrev}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </button>
  );
}

export function CarouselNext({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { api } = useCarousel();
  
  return (
    <button
      className={cn(
        "absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 shadow-md hover:bg-background disabled:opacity-50",
        className
      )}
      disabled={!api.canScrollNext}
      onClick={api.scrollNext}
      {...props}
    >
      <ChevronRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </button>
  );
}

export function CarouselIndicators({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { api } = useCarousel();
  
  return (
    <div
      className={cn(
        "absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1",
        className
      )}
      {...props}
    >
      {Array.from({ length: api.itemCount }).map((_, index) => (
        <button
          key={index}
          className={cn(
            "h-2 w-2 rounded-full bg-background/50 transition-colors",
            api.activeIndex === index && "bg-background"
          )}
          onClick={() => api.setActiveIndex(index)}
        >
          <span className="sr-only">{`Go to slide ${index + 1}`}</span>
        </button>
      ))}
    </div>
  );
}
