import { CheckCircle2, RotateCw } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  disabled?: boolean;
}

const PULL_THRESHOLD = 65; // px required to trigger refresh
const MAX_PULL = 85; // maximum elastic distance in px

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  disabled = false,
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [hasVibrated, setHasVibrated] = useState<boolean>(false);

  const startY = useRef<number>(0);
  const isPullingRef = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if we are scrolled to the very top of the window / document
  const isScrolledToTop = useCallback(() => {
    return window.scrollY <= 0;
  }, []);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (disabled || isRefreshing) return;

    if (isScrolledToTop()) {
      startY.current = e.touches[0].clientY;
      isPullingRef.current = true;
      setIsPulling(true);
      setHasVibrated(false);
    } else {
      isPullingRef.current = false;
      setIsPulling(false);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isPullingRef.current || disabled || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startY.current;

    // Only respond to downward pulls from the top
    if (diff > 0 && isScrolledToTop()) {
      // Elastic resistance damping formula
      const dampingFactor = 0.42;
      const dampedDistance = Math.min(diff * dampingFactor, MAX_PULL);
      setPullDistance(dampedDistance);

      // Light haptic trigger when crossing threshold
      if (dampedDistance >= PULL_THRESHOLD && !hasVibrated) {
        if (typeof window !== "undefined" && "vibrate" in navigator) {
          try {
            navigator.vibrate(15);
          } catch {
            // ignore if unsupported
          }
        }
        setHasVibrated(true);
      }
    } else {
      setPullDistance(0);
      isPullingRef.current = false;
      setIsPulling(false);
    }
  };

  const handleTouchEnd = async () => {
    if (!isPullingRef.current || disabled || isRefreshing) return;

    isPullingRef.current = false;
    setIsPulling(false);

    if (pullDistance >= PULL_THRESHOLD) {
      // Lock spinner at threshold height while refreshing
      setIsRefreshing(true);
      setPullDistance(PULL_THRESHOLD);

      try {
        await onRefresh();
        setIsSuccess(true);
        // Brief success display before snapping back
        setTimeout(() => {
          setIsSuccess(false);
          setIsRefreshing(false);
          setPullDistance(0);
        }, 500);
      } catch {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      // Snap back if threshold not reached
      setPullDistance(0);
    }
  };

  // Reset pull distance if user scrolls away or cancels
  const handleTouchCancel = () => {
    isPullingRef.current = false;
    setIsPulling(false);
    if (!isRefreshing) {
      setPullDistance(0);
    }
  };

  // Rotation angle calculation based on pull percentage
  const rotationDegrees = Math.min((pullDistance / PULL_THRESHOLD) * 360, 360);
  const isTriggerReady = pullDistance >= PULL_THRESHOLD;

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      className="relative w-full">
      {/* Elastic Circular Indicator Floating Anchor */}
      <div
        className="pointer-events-none fixed left-1/2 -translate-x-1/2 z-40 transition-transform duration-200 ease-out"
        style={{
          top: "72px", // positioned right beneath the sticky mobile header
          transform: `translate(-50%, ${pullDistance}px)`,
          opacity: pullDistance > 8 || isRefreshing ? 1 : 0,
          transition: isPulling
            ? "none"
            : "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s ease-out",
        }}>
        <div className="flex flex-col items-center gap-1.5">
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-2xl backdrop-blur-xl border transition-all duration-200 ${
              isTriggerReady || isRefreshing
                ? "bg-gradient-to-tr from-teal-500 to-emerald-600 text-white border-teal-300/40 shadow-teal-500/30 scale-105"
                : "bg-white/95 dark:bg-slate-800/95 text-teal-600 dark:text-teal-400 border-slate-200 dark:border-white/15"
            }`}>
            {isSuccess ? (
              <CheckCircle2 className="w-5 h-5 text-white animate-bounce" />
            ) : (
              <RotateCw
                className={`w-5 h-5 transition-transform ${
                  isRefreshing ? "animate-spin" : ""
                }`}
                style={{
                  transform: isRefreshing
                    ? undefined
                    : `rotate(${rotationDegrees}deg)`,
                }}
              />
            )}
          </div>

          {/* Micro status badge */}
          {pullDistance > 20 && (
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-900/80 dark:bg-slate-800/90 text-white shadow-md backdrop-blur-md animate-fade-in border border-white/10">
              {isRefreshing
                ? "Refreshing saved island content..."
                : isTriggerReady
                  ? "Release to reload"
                  : "Pull down to refresh"}
            </span>
          )}
        </div>
      </div>

      {/* Main Content Area with Subtle Elastic Downward Shift */}
      <div
        style={{
          transform:
            pullDistance > 0
              ? `translateY(${Math.min(pullDistance * 0.4, 28)}px)`
              : undefined,
          transition: isPulling
            ? "none"
            : "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}>
        {children}
      </div>
    </div>
  );
};
