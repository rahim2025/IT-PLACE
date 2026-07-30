const MAX_DIMENSION = 1920;
const TARGET_MAX_BYTES = 2 * 1024 * 1024; // stay well under the backend's 5MB per-image limit
const MIN_QUALITY = 0.5;

function canvasToBlob(canvas, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

// Downscales and re-encodes large photos in the browser before upload, so a
// full-resolution phone photo (often 8-12MB) doesn't trip the backend's 5MB
// limit. Animated GIFs are left untouched to preserve the animation, and any
// file that's already small enough is passed through as-is.
export async function compressImage(file) {
  if (file.type === "image/gif" || file.size <= TARGET_MAX_BYTES) return file;

  try {
    const bitmap = await createImageBitmap(file);
    let { width, height } = bitmap;
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const scale = MAX_DIMENSION / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    let quality = 0.82;
    let blob = await canvasToBlob(canvas, quality);
    while (blob && blob.size > TARGET_MAX_BYTES && quality > MIN_QUALITY) {
      quality -= 0.1;
      blob = await canvasToBlob(canvas, quality);
    }

    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    return file;
  }
}
