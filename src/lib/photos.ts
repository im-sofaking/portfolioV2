// Vite glob: returns a map of file paths -> hashed URLs.
// Add new photos by dropping files into the folders below — they are
// picked up automatically at build time.

const homeModules = import.meta.glob(
  "../assets/photos/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}",
  { eager: true, query: "?url", import: "default" },
) as Record<string, string>;

const darkroomModules = import.meta.glob(
  "../assets/darkroom/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}",
  { eager: true, query: "?url", import: "default" },
) as Record<string, string>;

export const photos: string[] = Object.values(homeModules);
export const darkroomPhotos: string[] = Object.values(darkroomModules);
