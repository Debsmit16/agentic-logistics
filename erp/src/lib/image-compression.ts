/**
 * In-browser image compression utility using HTML5 Canvas.
 * Compresses any camera photo or uploaded image to optimized WebP format (~20-30 KB).
 * Ensures zero cloud storage costs and maximum storage efficiency in Neon PostgreSQL.
 */
export async function compressImageToWebP(
  file: File,
  maxDimension = 800,
  quality = 0.75
): Promise<{ dataUrl: string; base64: string; sizeBytes: number; fileName: string }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Selected file is not an image."));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio while bounding within maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Unable to create canvas 2D context"));
          return;
        }

        // High quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP format
        let webpDataUrl = canvas.toDataURL("image/webp", quality);

        // Safari / older browser fallback if WebP is not supported by canvas
        if (!webpDataUrl.startsWith("data:image/webp")) {
          webpDataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        const base64Content = webpDataUrl.split(",")[1] || "";
        const sizeBytes = Math.round((base64Content.length * 3) / 4);
        const fileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";

        resolve({
          dataUrl: webpDataUrl,
          base64: base64Content,
          sizeBytes,
          fileName,
        });
      };

      img.onerror = () => reject(new Error("Failed to process image file."));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}
