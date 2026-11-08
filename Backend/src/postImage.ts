import { z } from "zod";

const MAX_BYTES = 1024 * 1024;
const MAX_DATA_URL = Math.ceil(MAX_BYTES / 3) * 4 + 32;

/** Validate the bounded raster envelope and file headers; no remote files are fetched. */
function validAttachment(value: string): boolean {
  if (value.length > MAX_DATA_URL) return false;
  const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(value);
  if (!match) return false;
  const bytes = Buffer.from(match[2]!, "base64");
  if (bytes.length > MAX_BYTES || bytes.toString("base64") !== match[2]) return false;
  switch (match[1]) {
    case "png":
      return bytes.length >= 45 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        && bytes.readUInt32BE(8) === 13 && bytes.toString("ascii", 12, 16) === "IHDR"
        && bytes.readUInt32BE(16) > 0 && bytes.readUInt32BE(20) > 0
        && bytes.toString("hex", bytes.length - 12) === "0000000049454e44ae426082";
    case "jpeg":
      return bytes.length >= 4 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
        && bytes[bytes.length - 2] === 255 && bytes[bytes.length - 1] === 217;
    case "webp":
      return bytes.length >= 25 && bytes.toString("ascii", 0, 4) === "RIFF"
        && bytes.readUInt32LE(4) === bytes.length - 8 && bytes.toString("ascii", 8, 12) === "WEBP"
        && ["VP8 ", "VP8L", "VP8X"].includes(bytes.toString("ascii", 12, 16))
        && bytes.readUInt32LE(16) <= bytes.length - 20;
    default: return false;
  }
}

export const postImageData = z.string().max(MAX_DATA_URL).refine(validAttachment,
  "Attach a valid JPEG, PNG or WebP image no larger than 1 MiB.");
