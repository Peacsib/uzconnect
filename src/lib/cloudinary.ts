export function getCloudinaryUrl(publicId: string, options?: { width?: number; quality?: string }) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dqbairwkx";
  const w = options?.width ? `w_${options.width},` : "";
  const q = options?.quality ? `q_${options.quality},` : "q_auto,";
  return `https://res.cloudinary.com/${cloudName}/image/upload/${w}${q}f_auto/${publicId}`;
}
