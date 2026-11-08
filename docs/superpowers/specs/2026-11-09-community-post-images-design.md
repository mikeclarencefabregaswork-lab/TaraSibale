# Community post image attachment

## Intent and current behavior

The user wants to include an image when using Community Feed → Share Your Island Moment. The existing form only offers stock-photo presets; the API accepts an HTTP image URL and stores post data in PostgreSQL JSONB. Portfolio mode blocks publishing, as required by AGENTS.md.

## Proposed behavior

- Replace the stock-photo picker with an optional single-image attachment from the user's device. Support JPEG, PNG and WebP, with a preview and replace/remove controls. Allow caption-only posts when no image is selected; never silently attach a stock photo.
- Reject source files over 5 MiB with a clear inline error. Decode and resize locally to a maximum 1600px longest edge, re-encode to strip original metadata, and enforce a 1 MiB final encoded-image byte limit. Explain supported formats/limits beside the control.
- Save the resulting image with the post through the existing API/database so it survives reloads. Retain support for previously stored HTTP image URLs. No new external storage service or credentials are needed for this bounded local app.
- Validate image format, base64 and decoded size on the backend; reject unsupported or invalid attachment data. Show success only after the server saves the post. Preserve draft text/image on submission failure, prevent submission during processing, and clear attachments after a successful post.
- Display attached images in the feed; caption-only posts omit the image area. Reset the attachment when the draft is discarded and avoid stale asynchronous image processing replacing a newer selection.
- Keep default portfolio publishing restrictions and authentication checks. An image can be selected and previewed in the portfolio interface, but publication remains blocked there. Persistence is verified using the isolated full-app integration suite.

## Approach and alternatives

Recommended: device upload and local processing, using the existing JSON post storage. This satisfies the usual photo-sharing flow without setting up another service. An image-URL input is smaller to build but requires users to host the image elsewhere. Dedicated object storage is appropriate for a future public launch, outside this local feature's scope.

## Scope and verification

Touch only the community composer/feed, image processing helper, post validation, focused tests and documentation. Preserve unrelated Header changes and all other app behavior. Check successful attachments and caption-only posts, invalid/oversized files, preview removal/replacement, submission failure, persisted image reload, and portfolio rejection. Run root checks and browser verification. The user approved this design.
