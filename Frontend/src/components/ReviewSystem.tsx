import { CheckCircle, Filter, Plus, Star, ThumbsUp, X } from "lucide-react";
import React, { useState } from "react";
import { api, errorText } from "../api";
import { Accommodation, Attraction, Review } from "../types";

interface ReviewSystemProps {
  reviews: Review[];
  attractions: Attraction[];
  accommodations: Accommodation[];
  isDarkMode: boolean;
  onUpdateReview: (review: Review) => void;
  onAddReview: (review: Review) => Promise<Review>;
  preSelectedTargetId?: string | null;
}

const RATING_LABELS: Record<number, { score: string; label: string }> = {
  5: { score: "5.0", label: "Excellent" },
  4: { score: "4.0", label: "Very Good" },
  3: { score: "3.0", label: "Average" },
  2: { score: "2.0", label: "Poor" },
  1: { score: "1.0", label: "Terrible" },
};

export const ReviewSystem: React.FC<ReviewSystemProps> = ({
  reviews,
  attractions,
  accommodations,
  isDarkMode,
  onAddReview,
  onUpdateReview,
  preSelectedTargetId,
}) => {
  const reviewsList = reviews;
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [filterRating, setFilterRating] = useState<number>(0);
  const [showWriteModal, setShowWriteModal] = useState(false);

  // Form
  const [targetId, setTargetId] = useState(
    preSelectedTargetId || attractions[0]?.id || "beach-bachawan",
  );
  const [authorName, setAuthorName] = useState("");
  const [starRating, setStarRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [selectedTag, setSelectedTag] = useState("Crystal Waters");

  const allTargets = [
    ...attractions.map((a) => ({ id: a.id, name: `Attraction: ${a.name}` })),
    ...accommodations.map((s) => ({ id: s.id, name: `Stay: ${s.name}` })),
  ];

  const handleHelpfulClick = async (reviewId: string) => {
    try {
      const updated = await api<Review>(`/api/reviews/${reviewId}/helpful`, {});
      onUpdateReview(updated);
      setError(null);
    } catch (error) {
      setError(errorText(error));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    setError(null);

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      targetId: allTargets.some((target) => target.id === targetId)
        ? targetId
        : allTargets[0]?.id || "",
      author: authorName || "Island Visitor",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      rating: starRating,
      date: new Date().toISOString().split("T")[0],
      comment: commentText,
      helpfulCount: 0,
      tags: [selectedTag],
    };

    try {
      await onAddReview(newReview);
      setCommentText("");
      setHoverRating(null);
      setShowWriteModal(false);
    } catch (error) {
      setError(errorText(error));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReviews = reviewsList.filter((r) => {
    if (filterRating === 0) return true;
    return r.rating === filterRating;
  });

  return (
    <div className="space-y-6">
      {error && (
        <p role="alert" className="p-3 rounded-xl bg-rose-100 text-rose-900">
          {error}
        </p>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/40 backdrop-blur-md">
              <Star className="w-5 h-5 fill-teal-500 text-teal-600 dark:fill-teal-400 dark:text-teal-400" />
            </span>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Traveler Reviews & Community Ratings
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 font-medium">
            Real feedback from visitors who explored Bachawan Beach, Spanish
            Watchtower, and local homestays.
          </p>
        </div>

        <button
          onClick={() => setShowWriteModal(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs shadow-[0_0_15px_rgba(46,196,182,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all">
          <Plus className="w-4 h-4" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 pb-2">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />{" "}
          Filter Rating:
        </span>
        {[0, 5, 4, 3, 2, 1].map((stars) => (
          <button
            key={stars}
            onClick={() => setFilterRating(stars)}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer backdrop-blur-md ${
              filterRating === stars
                ? "bg-teal-500 text-slate-950 shadow-[0_0_15px_rgba(46,196,182,0.4)]"
                : "bg-slate-200/80 hover:bg-slate-300/80 text-slate-800 border border-slate-300 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border-white/15"
            }`}>
            {stars === 0 ? "All Reviews" : `${stars} ★ Stars`}
          </button>
        ))}
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredReviews.map((rev) => {
          const targetObj = allTargets.find((t) => t.id === rev.targetId);
          return (
            <div
              key={rev.id}
              className="p-6 rounded-3xl border border-slate-200/90 dark:border-white/15 bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl text-slate-900 dark:text-white flex flex-col justify-between space-y-4 hover:border-teal-500/60 transition-all hover:shadow-xl shadow-sm">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.avatar}
                      alt={rev.author}
                      className="w-10 h-10 rounded-full object-cover border-2 border-teal-500"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {rev.author}
                      </h4>
                      <p className="text-[11px] text-teal-800 dark:text-teal-300 font-semibold">
                        {targetObj ? targetObj.name : "Concepcion Destination"}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {rev.date}
                  </span>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < rev.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300 dark:text-slate-600"
                      }`}
                    />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed italic">
                  "{rev.comment}"
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {rev.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-teal-500/15 text-teal-950 dark:text-teal-200 border border-teal-500/30 backdrop-blur-md">
                      ✓ {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Helpful count */}
              <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-teal-600 dark:text-teal-300" />{" "}
                  Verified Visitor
                </span>

                <button
                  onClick={() => handleHelpfulClick(rev.id)}
                  className="flex items-center gap-1 text-slate-600 hover:text-teal-700 dark:text-slate-300 dark:hover:text-teal-300 transition-colors cursor-pointer">
                  <ThumbsUp className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Helpful ({rev.helpfulCount})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Write Review Modal */}
      {showWriteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl overflow-y-auto">
          <div
            className={`relative w-full max-w-lg rounded-3xl border shadow-2xl p-6 space-y-4 backdrop-blur-2xl ${
              isDarkMode
                ? "bg-[#061e2c]/90 border-white/20 text-slate-100"
                : "bg-white/95 border-slate-200 text-slate-800"
            }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                Write a Review for Concepcion
              </h3>
              <button
                onClick={() => setShowWriteModal(false)}
                className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {error && (
                <p role="alert" className="text-rose-600">
                  {error}
                </p>
              )}
              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                  Target Destination / Stay *
                </label>
                <select
                  value={
                    allTargets.some((target) => target.id === targetId)
                      ? targetId
                      : allTargets[0]?.id || ""
                  }
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-white focus:outline-none focus:border-teal-500 text-xs">
                  {allTargets.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
                <div>
                  <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                    Name (optional; account name is used)
                  </label>
                  <input
                    type="text"
                    placeholder="Your signed-in name is shown publicly"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 text-slate-900 placeholder:text-slate-400 dark:bg-white/10 dark:text-white focus:outline-none focus:border-teal-500 text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-800 dark:text-slate-200">
                      Star Rating *
                    </label>
                    <div className="flex items-center gap-1 text-[11px]">
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                        {RATING_LABELS[hoverRating ?? starRating]?.score ||
                          `${hoverRating ?? starRating}.0`}
                      </span>
                      <span className="text-slate-400 dark:text-slate-500">
                        •
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {RATING_LABELS[hoverRating ?? starRating]?.label ||
                          "Good"}
                      </span>
                    </div>
                  </div>

                  <div
                    className="flex items-center justify-between px-3 py-1.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-slate-900/80 transition-colors"
                    onMouseLeave={() => setHoverRating(null)}
                    role="radiogroup"
                    aria-label="Star rating selection">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const activeValue = hoverRating ?? starRating;
                      const isFilled = star <= activeValue;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setStarRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onFocus={() => setHoverRating(star)}
                          onBlur={() => setHoverRating(null)}
                          className="p-1 rounded-lg transition-transform duration-150 transform hover:scale-125 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 cursor-pointer group"
                          aria-label={`Rate ${star} of 5 stars - ${RATING_LABELS[star]?.label}`}
                          role="radio"
                          aria-checked={starRating === star}>
                          <Star
                            className={`w-5 h-5 transition-all duration-150 ${
                              isFilled
                                ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.45)]"
                                : "text-slate-300 dark:text-slate-600 group-hover:text-amber-300/70"
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                  Your Review Comment *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Tell future travelers about your experience..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 text-slate-900 placeholder:text-slate-400 dark:bg-white/10 dark:text-white focus:outline-none focus:border-teal-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                  Highlight Tag
                </label>
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-white focus:outline-none focus:border-teal-500 text-xs">
                  <option value="Crystal Waters">Crystal Waters</option>
                  <option value="Historical Heritage">
                    Historical Heritage
                  </option>
                  <option value="Warm Local Hosts">Warm Local Hosts</option>
                  <option value="Fresh Seafood">Fresh Seafood</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWriteModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-bold cursor-pointer">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold shadow-[0_0_15px_rgba(46,196,182,0.4)] cursor-pointer transition-all">
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
