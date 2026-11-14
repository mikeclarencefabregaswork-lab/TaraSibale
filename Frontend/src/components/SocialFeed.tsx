import { SurfacePresence } from "./SurfacePresence";
import { Heart, MapPin, MessageCircle, Palmtree, Plus } from "lucide-react";
import React, { useState } from "react";
import { api, errorText } from "../api";
import { SocialPost, SocialPostDraft } from "../types";
import { CommunityPostComposer } from "./CommunityPostComposer";

interface SocialFeedProps {
  posts: SocialPost[];
  isDarkMode: boolean;
  onUpdatePost: (post: SocialPost) => void;
  onAddPost: (post: SocialPostDraft) => Promise<SocialPost>;
}

export const SocialFeed: React.FC<SocialFeedProps> = ({
  posts,
  isDarkMode,
  onAddPost,
  onUpdatePost,
}) => {
  const feedPosts = posts;

  const [showAddPostModal, setShowAddPostModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
            {post.image && <div className="relative max-h-96 overflow-hidden bg-slate-950">
              <img
                src={post.image}
                loading="lazy"
                decoding="async"
                alt={`Photo shared by ${post.author}`}
                className="w-full h-full object-cover"
              />
            </div>}

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
      <SurfacePresence>
        {showAddPostModal && <CommunityPostComposer
          isDarkMode={isDarkMode}
          onAddPost={onAddPost}
          onClose={() => setShowAddPostModal(false)}
        />}
      </SurfacePresence>
    </div>
  );
};
