import { Heart, MapPin, MessageCircle, Palmtree, Plus, X } from "lucide-react";
import React, { useState } from "react";
import { api, errorText } from "../api";
import { SocialPost } from "../types";

interface SocialFeedProps {
  posts: SocialPost[];
  isDarkMode: boolean;
  onUpdatePost: (post: SocialPost) => void;
  onAddPost: (post: SocialPost) => Promise<SocialPost>;
}

export const SocialFeed: React.FC<SocialFeedProps> = ({
  posts,
  isDarkMode,
  onAddPost,
  onUpdatePost,
}) => {
  const feedPosts = posts;

  const [showAddPostModal, setShowAddPostModal] = useState(false);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("Bachawan Beach, Concepcion");
  const [imageUrl, setImageUrl] = useState(
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
  );

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const toggleLike = async (postId: string) => {
    try {
      const updated = await api<SocialPost>(
        `/api/social-posts/${postId}/like`,
        {},
      );
      onUpdatePost(updated);
      setError(null);
    } catch (error) {
      setError(errorText(error));
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    const newPost: SocialPost = {
      id: `post-${Date.now()}`,
      author: "You (Island Traveler)",
      handle: "@island_explorer",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      image: imageUrl,
      caption,
      likes: 1,
      commentsCount: 0,
      location,
      timestamp: "Just now",
      userLiked: true,
    };
    try {
      await onAddPost(newPost);
      setCaption("");
      setShowAddPostModal(false);
    } catch (error) {
      setError(errorText(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-6xl mx-auto">
      {error && (
        <p role="alert" className="p-3 bg-rose-100 text-rose-900 rounded-xl">
          {error}
        </p>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/40 backdrop-blur-md">
              <Palmtree className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </span>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Community Traveler Stream
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 font-medium">
            Real photos and stories tagged #ExploreConcepcion from fellow
            travelers and locals.
          </p>
        </div>

        <button
          onClick={() => setShowAddPostModal(true)}
          className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs shadow-[0_0_15px_rgba(46,196,182,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all">
          <Plus className="w-4 h-4" />
          <span>Share Your Island Moment</span>
        </button>
      </div>

      {/* Posts Stream */}
      <div className="space-y-6">
        {feedPosts.map((post) => (
          <div
            key={post.id}
            className="rounded-3xl border border-slate-200/90 dark:border-white/15 bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl overflow-hidden text-slate-900 dark:text-white transition-all hover:border-teal-500/60 hover:shadow-xl shadow-sm">
            {/* Post Header */}
            <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-3">
                <img
                  src={post.avatar}
                  alt={post.author}
                  className="w-10 h-10 rounded-full object-cover border-2 border-teal-500"
                />
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {post.author}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300/80">
                    <span>{post.handle}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-teal-700 dark:text-teal-300 font-semibold">
                      <MapPin className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                      {post.location}
                    </span>
                  </div>
                </div>
              </div>

              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {post.timestamp}
              </span>
            </div>

            {/* Post Image */}
            <div className="relative max-h-96 overflow-hidden bg-slate-950">
              <img
                src={post.image}
                alt="Post moment"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Post Footer & Actions */}
            <div className="p-5 space-y-3">
              <div className="flex items-center gap-4 text-xs font-bold">
                <button
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
                    post.userLiked
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400"
                  }`}>
                  <Heart
                    className={`w-5 h-5 ${post.userLiked ? "fill-rose-500 text-rose-500" : ""}`}
                  />
                  <span>{post.likes} Likes</span>
                </button>

                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <MessageCircle className="w-5 h-5" />
                  <span>{post.commentsCount} Comments</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                <strong className="mr-1 text-teal-800 dark:text-teal-300">
                  {post.author}:
                </strong>
                {post.caption}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Post Modal */}
      {showAddPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl overflow-y-auto">
          <div
            className={`relative w-full max-w-lg rounded-3xl border shadow-2xl p-6 space-y-4 backdrop-blur-2xl ${
              isDarkMode
                ? "bg-[#061e2c]/90 border-white/20 text-slate-100"
                : "bg-white/95 border-slate-200 text-slate-800"
            }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                Share Your Concepcion Experience
              </h3>
              <button
                onClick={() => setShowAddPostModal(false)}
                className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPost} className="space-y-4 text-xs">
              {error && (
                <p role="alert" className="text-rose-600">
                  {error}
                </p>
              )}
              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                  Caption / Story *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Share what you loved about Bachawan beach, local fresh seafood, or watchtower views..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 text-slate-900 placeholder:text-slate-400 dark:bg-white/10 dark:text-white focus:outline-none focus:border-teal-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                  Location Tag
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 text-slate-900 dark:bg-white/10 dark:text-white focus:outline-none focus:border-teal-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-800 dark:text-slate-200">
                  Photo Preset
                </label>
                <select
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-white focus:outline-none focus:border-teal-500 text-xs">
                  <option value="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80">
                    Bachawan White Sands
                  </option>
                  <option value="https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop&q=80">
                    Spanish Watchtower Ruins
                  </option>
                  <option value="https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?w=800&auto=format&fit=crop&q=80">
                    Dampali Cove Lagoon
                  </option>
                  <option value="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop&q=80">
                    Masaguisi Coral Reef
                  </option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPostModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white font-bold cursor-pointer">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold shadow-[0_0_15px_rgba(46,196,182,0.4)] cursor-pointer transition-all">
                  Post to Community Stream
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
