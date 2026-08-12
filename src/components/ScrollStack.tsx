'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import Lenis from 'lenis';
import './ScrollStack.css';

export interface ScrollStackItemProps {
  itemClassName?: string;
  children: ReactNode;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({ children, itemClassName = '' }) => (
  <div
    className={`scroll-stack-card-wrapper w-full ${itemClassName}`.trim()}
  >
    <div
      className="scroll-stack-card relative w-full rounded-[32px] box-border origin-top will-change-transform"
      style={{
        backfaceVisibility: 'hidden',
        transformStyle: 'preserve-3d'
      }}
    >
      {children}
    </div>
  </div>
);

interface ScrollStackProps {
  className?: string;
  children: ReactNode;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  scaleDuration?: number;
  rotationAmount?: number;
  blurAmount?: number;
  useWindowScroll?: boolean;
  onStackComplete?: () => void;
}

const ScrollStack: React.FC<ScrollStackProps> = ({
  children,
  className = '',
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = '20%',
  scaleEndPosition = '10%',
  baseScale = 0.85,
  scaleDuration = 0.5,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = false,
  onStackComplete
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stackCompletedRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const lastTransformsRef = useRef(new Map<number, { translateY: number; scale: number; blur: number; rotate: number }>());
  const isUpdatingRef = useRef(false);

  const calculateProgress = useCallback((scrollTop: number, start: number, end: number) => {
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    return (scrollTop - start) / (end - start);
  }, []);

  const parsePercentage = useCallback((value: string | number, containerHeight: number) => {
    if (typeof value === 'string' && value.includes('%')) {
      return (parseFloat(value) / 100) * containerHeight;
    }
    return parseFloat(value as string);
  }, []);

  const getScrollData = useCallback(() => {
    if (useWindowScroll) {
      return {
        scrollTop: window.scrollY,
        containerHeight: window.innerHeight,
        scrollContainer: document.documentElement
      };
    } else {
      const scroller = scrollerRef.current;
      return {
        scrollTop: scroller ? scroller.scrollTop : 0,
        containerHeight: scroller ? scroller.clientHeight : 0,
        scrollContainer: scroller
      };
    }
  }, [useWindowScroll]);

  const getElementOffset = useCallback(
    (element: HTMLElement) => {
      if (useWindowScroll) {
        const rect = element.getBoundingClientRect();
        return rect.top + window.scrollY;
      } else {
        const scroller = scrollerRef.current;
        if (!scroller) return 0;
        let offset = 0;
        let curr: HTMLElement | null = element;
        while (curr && curr !== scroller) {
          offset += curr.offsetTop;
          curr = curr.offsetParent as HTMLElement | null;
        }
        return offset;
      }
    },
    [useWindowScroll]
  );

  const updateCardTransforms = useCallback(() => {
    const { scrollTop, containerHeight } = getScrollData();
    const cards = Array.from(scrollerRef.current?.querySelectorAll('.scroll-stack-card') || []) as HTMLElement[];
    if (cards.length === 0) return;

    const pinThreshold = parsePercentage(stackPosition, containerHeight);
    let allStacked = true;

    cards.forEach((card, i) => {
      const cardTop = getElementOffset(card);
      const triggerStart = cardTop - pinThreshold + i * itemStackDistance;
      const diff = scrollTop - triggerStart;

      let translateY = 0;
      let scale = 1;
      let blur = 0;
      let rotate = 0;

      if (diff > 0) {
        // Pinned state
        translateY = diff;
        
        // Progress of scrolling past the trigger
        const progress = calculateProgress(scrollTop, triggerStart, triggerStart + itemDistance);
        
        // Scale down cards as they get stacked on
        scale = 1 - (progress * itemScale * (cards.length - 1 - i));
        scale = Math.max(baseScale, scale);
        
        // Apply blur
        if (blurAmount > 0) {
          blur = progress * blurAmount;
        }
        
        // Apply rotation
        if (rotationAmount > 0) {
          rotate = (i % 2 === 0 ? 1 : -1) * (1 - progress) * rotationAmount;
        }
      } else {
        allStacked = false;
      }

      // Check if we need to apply updates (optimize performance)
      const lastTransform = lastTransformsRef.current.get(i);
      if (
        !lastTransform ||
        lastTransform.translateY !== translateY ||
        lastTransform.scale !== scale ||
        lastTransform.blur !== blur ||
        lastTransform.rotate !== rotate
      ) {
        card.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale}) rotate(${rotate}deg)`;
        if (blurAmount > 0) {
          card.style.filter = blur > 0 ? `blur(${blur}px)` : 'none';
        }
        lastTransformsRef.current.set(i, { translateY, scale, blur, rotate });
      }
    });

    if (allStacked && !stackCompletedRef.current) {
      stackCompletedRef.current = true;
      if (onStackComplete) onStackComplete();
    } else if (!allStacked) {
      stackCompletedRef.current = false;
    }
  }, [
    getScrollData,
    parsePercentage,
    getElementOffset,
    calculateProgress,
    itemDistance,
    itemScale,
    itemStackDistance,
    stackPosition,
    baseScale,
    blurAmount,
    rotationAmount,
    onStackComplete
  ]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    // Set up Lenis smooth scroll
    const lenis = new Lenis({
      wrapper: useWindowScroll ? window : scroller,
      content: useWindowScroll ? document.documentElement : scroller.firstElementChild as HTMLElement || undefined,
      lerp: 0.1,
      duration: 1.2,
      smoothWheel: true,
      syncTouch: true
    });

    lenisRef.current = lenis;

    // Wheel and touch events release handling at boundaries to avoid trapping parent scroll
    let touchStartY = 0;

    const handleWheelBoundary = (e: WheelEvent) => {
      const isAtTop = scroller.scrollTop <= 0;
      const maxScroll = scroller.scrollHeight - scroller.clientHeight;
      const isAtBottom = scroller.scrollTop >= maxScroll - 2;

      const scrollingUp = e.deltaY < 0;
      const scrollingDown = e.deltaY > 0;

      if ((isAtTop && scrollingUp) || (isAtBottom && scrollingDown)) {
        // Stop propagation in the capture phase so Lenis does not prevent this scroll event
        e.stopPropagation();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;

      const touchCurrentY = e.touches[0].clientY;
      const deltaY = touchStartY - touchCurrentY; // positive = swipe up (scrolling down), negative = swipe down (scrolling up)

      const isAtTop = scroller.scrollTop <= 0;
      const maxScroll = scroller.scrollHeight - scroller.clientHeight;
      const isAtBottom = scroller.scrollTop >= maxScroll - 2;

      const scrollingUp = deltaY < 0;
      const scrollingDown = deltaY > 0;

      if ((isAtTop && scrollingUp) || (isAtBottom && scrollingDown)) {
        // Stop propagation in the capture phase so Lenis does not prevent this touch scroll
        e.stopPropagation();
      }
    };

    scroller.addEventListener('wheel', handleWheelBoundary, { capture: true, passive: true });
    scroller.addEventListener('touchstart', handleTouchStart, { capture: true, passive: true });
    scroller.addEventListener('touchmove', handleTouchMove, { capture: true, passive: true });

    const onScroll = () => {
      if (isUpdatingRef.current) return;
      isUpdatingRef.current = true;
      animationFrameRef.current = requestAnimationFrame(() => {
        updateCardTransforms();
        isUpdatingRef.current = false;
      });
    };

    lenis.on('scroll', onScroll);

    // RAF loop for Lenis
    const rafLoop = (time: number) => {
      lenis.raf(time);
      animationFrameRef.current = requestAnimationFrame(rafLoop);
    };
    animationFrameRef.current = requestAnimationFrame(rafLoop);

    // Initial transform update
    updateCardTransforms();

    // Handle resize
    const handleResize = () => {
      updateCardTransforms();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      lenis.destroy();
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      scroller.removeEventListener('wheel', handleWheelBoundary, { capture: true });
      scroller.removeEventListener('touchstart', handleTouchStart, { capture: true });
      scroller.removeEventListener('touchmove', handleTouchMove, { capture: true });
    };
  }, [useWindowScroll, updateCardTransforms]);

  return (
    <div className={`scroll-stack-scroller ${className}`.trim()} ref={scrollerRef}>
      <div className="scroll-stack-inner">
        {children}
        {/* Spacer so the last pin can release cleanly */}
        <div className="scroll-stack-end" />
      </div>
    </div>
  );
};

export default ScrollStack;
