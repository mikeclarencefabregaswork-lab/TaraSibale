# Community post images

Open **Community Feed → Share Your Island Moment**. Choose one optional JPEG, PNG or WebP file, check the preview, and add a caption and location. Choose another file to replace the photo or use **Remove image**. Caption-only posts are also supported. Cancelling discards the draft; failed submissions retain the caption and selected photo for retry.

## Limits and processing

The selected file must be nonempty, no larger than 5 MiB and no larger than 40 megapixels. The browser decodes it, preserves its aspect ratio, limits its longest edge to 1600px without enlarging smaller images, and redraws/re-encodes it as WebP (or PNG if the browser cannot encode WebP). Original file metadata is not copied. The processed image must fit within 1 MiB of decoded bytes; if it cannot, the form asks for a smaller file. The original file name is shown locally but is not sent with the post.

The composer prevents submission during processing and ignores an earlier selection's result after replacement, removal, cancellation or unmount. A successful save clears the attachment; choosing a photo alone never publishes it.

## Storage and access

The existing `/api/social-posts` route saves the processed data URL in the post's JSONB data. No migration, storage account, AI API key, or new dependency is required. The backend checks the image's allowed MIME type, canonical base64 encoding, decoded byte limit and matching raster file headers. This is envelope/header validation, not a complete server-side image decoder. Existing HTTP image URLs remain compatible. Authentication, server-assigned authorship and publishing limits are unchanged.

**Portfolio mode still blocks posting.** Device images can be selected and previewed, but publishing remains rejected and the draft stays visible. Persistence is checked in the isolated full-app integration suite; no real public posts are created for verification. A public launch would need a separate storage/moderation/operating design; this feature does not enable that launch.
