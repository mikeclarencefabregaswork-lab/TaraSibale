const MAX_SOURCE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_BYTES = 1024 * 1024;
const TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function postImageDimensions(width: number, height: number) {
  if (![width, height].every(value => Number.isFinite(value) && value > 0)) throw new Error("This image has invalid dimensions.");
  const scale = Math.min(1, 1600 / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

/** Decode and redraw locally: original metadata and file names are not uploaded. */
export async function preparePostImage(file: File): Promise<string> {
  if (!TYPES.has(file.type)) throw new Error("Choose a JPEG, PNG or WebP image.");
  if (!file.size) throw new Error("This image file is empty.");
  if (file.size > MAX_SOURCE_BYTES) throw new Error("Choose an image no larger than 5 MiB.");
  let bitmap: ImageBitmap;
  try { bitmap = await createImageBitmap(file, { imageOrientation: "from-image" }); }
  catch { throw new Error("This image could not be opened. Choose another JPEG, PNG or WebP file."); }
  const canvas = document.createElement("canvas");
  try {
    if (bitmap.width * bitmap.height > 40_000_000) throw new Error("Choose an image smaller than 40 megapixels.");
    const size = postImageDimensions(bitmap.width, bitmap.height);
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image processing is unavailable in this browser.");
    context.drawImage(bitmap, 0, 0, size.width, size.height);
    for (const quality of [0.85, 0.7, 0.55, 0.4, 0.25]) {
      const data = canvas.toDataURL("image/webp", quality);
      const encoded = data.slice(data.indexOf(",") + 1);
      const bytes = encoded.length * 3 / 4 - (encoded.endsWith("==") ? 2 : encoded.endsWith("=") ? 1 : 0);
      if (/^data:image\/(webp|png);base64,/.test(data) && bytes > 0 && bytes <= MAX_IMAGE_BYTES) return data;
    }
    throw new Error("This image could not be reduced below 1 MiB. Choose a smaller image.");
  } finally {
    bitmap.close();
    canvas.width = canvas.height = 0;
  }
}
