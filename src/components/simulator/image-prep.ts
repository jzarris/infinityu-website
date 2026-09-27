/**
 * Client-side photo preparation: fix EXIF orientation, downscale to a working
 * size, and re-encode as JPEG. Re-encoding through a canvas drops all metadata
 * (including GPS) before the photo leaves the device.
 */

export const MAX_SIDE = 1600;

export async function prepareImage(file: File): Promise<Blob> {
  let width: number;
  let height: number;
  let source: CanvasImageSource;

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    width = bitmap.width;
    height = bitmap.height;
    source = bitmap;
  } catch {
    const img = await loadImageElement(file);
    width = img.naturalWidth;
    height = img.naturalHeight;
    source = img;
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas unavailable');
  ctx.drawImage(source, 0, 0, w, h);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('encode failed'))), 'image/jpeg', 0.9);
  });
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('image decode failed'));
    };
    img.src = url;
  });
}
