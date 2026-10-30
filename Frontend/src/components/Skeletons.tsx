import React from 'react';

/** Shown only while catalog/account data or a lazy page is actually pending. */
export const PageSkeleton: React.FC<{ tab: string }> = ({ tab }) => (
  <div role="status" aria-label="Loading page" aria-busy="true" className="space-y-6 min-h-[60vh]">
    <span className="sr-only">Loading {tab === 'stay' ? 'accommodations' : tab}…</span>
    <div aria-hidden="true" className="space-y-3">
      <div className="skeleton-shimmer h-8 w-2/3 sm:w-80 rounded-xl bg-slate-200 dark:bg-slate-800" />
      <div className="skeleton-shimmer h-4 w-4/5 sm:w-96 rounded-lg bg-slate-100 dark:bg-slate-800" />
    </div>
    {tab === 'explore' && <div aria-hidden="true" className="skeleton-shimmer h-80 rounded-3xl bg-slate-200 dark:bg-slate-800" />}
    {tab === 'map' ? <div aria-hidden="true" className="skeleton-shimmer h-[60vh] rounded-3xl bg-slate-200 dark:bg-slate-800" /> : tab === 'stay' ? <AccommodationsGridSkeleton count={2} /> : tab === 'explore' ? <AttractionsGridSkeleton count={3} /> : <div aria-hidden="true" className="grid gap-5 md:grid-cols-2">{[0,1,2,3].map(index => <div key={index} className="space-y-4 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900 p-6"><div className="skeleton-shimmer h-6 w-1/2 rounded-lg bg-slate-200 dark:bg-slate-800" />{[0,1,2].map(line => <div key={line} className="skeleton-shimmer h-4 rounded-lg bg-slate-100 dark:bg-slate-800" />)}</div>)}</div>}
  </div>
);

/**
 * Skeleton Card for Attractions (Beaches, Sanctuaries, Landmarks)
 * Matches the layout and dimensions of the actual Attraction card.
 */
export const AttractionSkeletonCard: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl overflow-hidden flex flex-col justify-between shadow-sm animate-pulse"
    >
      <div>
        {/* Image Placeholder */}
        <div className="relative h-52 w-full bg-slate-200/90 dark:bg-slate-800/80 overflow-hidden">
          {/* Top Left Badge Skeleton */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <div className="h-5 w-16 rounded-full bg-slate-300 dark:bg-slate-700/70" />
            <div className="h-5 w-20 rounded-full bg-slate-300/80 dark:bg-slate-700/50 hidden sm:block" />
          </div>

          {/* Top Right Heart Skeleton */}
          <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-slate-300/80 dark:bg-slate-700/60" />

          {/* Bottom Left & Right Pill Overlays */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="h-6 w-24 rounded-full bg-slate-300/90 dark:bg-slate-700/80" />
            <div className="h-6 w-20 rounded-full bg-slate-300/90 dark:bg-slate-700/80" />
          </div>
        </div>

        {/* Card Body Skeleton */}
        <div className="p-5 space-y-3">
          <div>
            {/* Title */}
            <div className="h-5 w-3/4 rounded-lg bg-slate-300 dark:bg-slate-700/80 mb-2" />
            {/* Location */}
            <div className="flex items-center gap-1.5">
              <div className="h-3.5 w-3.5 rounded-full bg-slate-300/70 dark:bg-slate-700/60 shrink-0" />
              <div className="h-3.5 w-1/2 rounded bg-slate-300/70 dark:bg-slate-700/60" />
            </div>
          </div>

          {/* Description Lines */}
          <div className="space-y-1.5 pt-1">
            <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* Highlight Tags Skeleton */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <div className="h-5 w-16 rounded-md bg-slate-200 dark:bg-slate-800/90" />
            <div className="h-5 w-20 rounded-md bg-slate-200 dark:bg-slate-800/90" />
            <div className="h-5 w-14 rounded-md bg-slate-200 dark:bg-slate-800/90" />
          </div>
        </div>
      </div>

      {/* Card Footer Skeleton */}
      <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-white/5 mt-4">
        <div className="h-3.5 w-24 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-6 w-20 rounded-lg bg-slate-200/90 dark:bg-slate-800" />
      </div>
    </div>
  );
};

/**
 * Grid of Attraction Skeletons
 */
export const AttractionsGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div
      role="status"
      aria-label="Loading attractions..."
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <span className="sr-only">Loading attractions and heritage landmarks...</span>
      {Array.from({ length: count }).map((_, index) => (
        <AttractionSkeletonCard key={`attraction-skeleton-${index}`} />
      ))}
    </div>
  );
};

/**
 * Skeleton Card for Accommodations & Homestays
 * Matches the layout and dimensions of the actual Accommodation card.
 */
export const AccommodationSkeletonCard: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl overflow-hidden flex flex-col justify-between shadow-sm animate-pulse"
    >
      <div>
        {/* Image Placeholder */}
        <div className="relative h-60 w-full bg-slate-200/90 dark:bg-slate-800/80 overflow-hidden">
          {/* Top Left Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <div className="h-5 w-20 rounded-full bg-slate-300 dark:bg-slate-700/70" />
            <div className="h-5 w-16 rounded-full bg-slate-300/80 dark:bg-slate-700/50" />
          </div>

          {/* Bottom Right Price Pill */}
          <div className="absolute bottom-3 right-3 h-8 w-28 rounded-full bg-slate-300/90 dark:bg-slate-700/90" />
        </div>

        {/* Card Body Skeleton */}
        <div className="p-6 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="w-2/3">
              {/* Name */}
              <div className="h-5 w-4/5 rounded-lg bg-slate-300 dark:bg-slate-700/80 mb-2" />
              {/* Location */}
              <div className="flex items-center gap-1.5">
                <div className="h-3.5 w-3.5 rounded-full bg-slate-300/70 dark:bg-slate-700/60 shrink-0" />
                <div className="h-3.5 w-1/2 rounded bg-slate-300/70 dark:bg-slate-700/60" />
              </div>
            </div>
            {/* Rating pill */}
            <div className="h-6 w-14 rounded-full bg-slate-300/80 dark:bg-slate-700/70" />
          </div>

          {/* Description Lines */}
          <div className="space-y-1.5 pt-1">
            <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* Amenities Pills Skeleton */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <div className="h-5 w-20 rounded-md bg-slate-200 dark:bg-slate-800/90" />
            <div className="h-5 w-24 rounded-md bg-slate-200 dark:bg-slate-800/90" />
            <div className="h-5 w-16 rounded-md bg-slate-200 dark:bg-slate-800/90" />
            <div className="h-5 w-22 rounded-md bg-slate-200 dark:bg-slate-800/90" />
          </div>
        </div>
      </div>

      {/* Card Footer Skeleton */}
      <div className="p-6 pt-0 border-t border-slate-100 dark:border-white/5 mt-4 flex items-center justify-between">
        <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="h-9 w-32 rounded-xl bg-slate-300 dark:bg-slate-700" />
      </div>
    </div>
  );
};

/**
 * Grid of Accommodation Skeletons
 */
export const AccommodationsGridSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div
      role="status"
      aria-label="Loading accommodations..."
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <span className="sr-only">Loading accommodations and homestays...</span>
      {Array.from({ length: count }).map((_, index) => (
        <AccommodationSkeletonCard key={`accommodation-skeleton-${index}`} />
      ))}
    </div>
  );
};
