import assert from "node:assert/strict";
import { test } from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { SocialFeed } from "../src/components/SocialFeed.tsx";
import type { SocialPost } from "../src/types.ts";
import { CommunityPostComposer } from "../src/components/CommunityPostComposer.tsx";
import { SurfacePresence } from "../src/components/SurfacePresence.tsx";
import { postImageDimensions, preparePostImage } from "../src/postImage.ts";

const textPost: SocialPost = {
  id: "text-post", author: "Island visitor", handle: "@visitor", avatar: "/tarasibale-logo.jpg",
  caption: "A beautiful day", likes: 0, commentsCount: 0, location: "Sibale", timestamp: "Just now",
};

test("caption-only posts do not render an empty photo or broken image", () => {
  const html = renderToStaticMarkup(React.createElement(SocialFeed, {
    posts: [textPost], isDarkMode: false, onAddPost: async () => textPost, onUpdatePost: () => {},
  }));
  assert.match(html, /A beautiful day/);
  assert.equal((html.match(/<img /g) ?? []).length, 1, "Only the author avatar is an image");
});

test("composer offers an optional raster file picker instead of stock-photo presets", () => {
  const html = renderToStaticMarkup(React.createElement(SurfacePresence, null,
    React.createElement(CommunityPostComposer, { isDarkMode: false, onClose: () => {}, onAddPost: async () => textPost })));
  assert.match(html, /role="dialog"/);
  assert.match(html, /Photo \(optional\)/);
  assert.match(html, /type="file" accept="image\/jpeg,image\/png,image\/webp"/);
  assert.match(html, /5 MiB/);
  assert.match(html, /Original photo metadata is removed/);
  assert.doesNotMatch(html, /Photo Preset|<select|images.unsplash.com/);
});

test("image dimensions preserve aspect ratio without upscaling small photos", () => {
  assert.deepEqual(postImageDimensions(4000, 3000), { width: 1600, height: 1200 });
  assert.deepEqual(postImageDimensions(800, 3200), { width: 400, height: 1600 });
  assert.deepEqual(postImageDimensions(800, 600), { width: 800, height: 600 });
  assert.deepEqual(postImageDimensions(10000, 1), { width: 1600, height: 1 });
  assert.throws(() => postImageDimensions(0, 100), /invalid dimensions/);
  assert.throws(() => postImageDimensions(100, Infinity), /invalid dimensions/);
});

test("file processing rejects unsupported, empty and oversized files before decoding", async () => {
  await assert.rejects(preparePostImage(new File(["<svg/>"], "photo.svg", { type: "image/svg+xml" })), /JPEG, PNG or WebP/);
  await assert.rejects(preparePostImage(new File([], "photo.png", { type: "image/png" })), /empty/);
  await assert.rejects(preparePostImage(new File([new Uint8Array(5 * 1024 * 1024 + 1)], "photo.jpg", { type: "image/jpeg" })), /5 MiB/);
});

test("feed retains existing URL images and renders uploaded image data", () => {
  for (const image of ["https://example.test/photo.jpg", "data:image/webp;base64,UklGRg=="]) {
    const html = renderToStaticMarkup(React.createElement(SocialFeed, {
      posts: [{ ...textPost, image }], isDarkMode: true, onAddPost: async () => textPost, onUpdatePost: () => {},
    }));
    assert.match(html, /alt="Photo shared by Island visitor"/);
    assert.ok(html.includes(`src="${image}"`));
  }
});
