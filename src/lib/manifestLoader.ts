// src/lib/manifestLoader.ts
interface ImageFile {
  filename: string;
  url: string;
  size: number;
  lastModified: string;
  colorInfo: string;
}

interface ImageManifest {
  generated: string;
  products: Record<string, ImageFile[]>;
  features: Record<string, ImageFile[]>;
}

let cachedManifest: ImageManifest | null = null;

export async function loadImageManifest(): Promise<ImageManifest | null> {
  // Return cached version if available
  if (cachedManifest) {
    return cachedManifest;
  }

  try {
    // In development and build environments, read from file system
    if (typeof process !== 'undefined') {
      const fs = await import("node:fs/promises");
      const path = await import("node:path");
      
      const manifestPath = path.join(process.cwd(), "public", "image-manifest.json");
      const manifestContent = await fs.readFile(manifestPath, "utf-8");
      cachedManifest = JSON.parse(manifestContent);
      return cachedManifest;
    }
    
    // In browser environments (client-side), fetch the manifest
    const response = await fetch("/image-manifest.json");
    if (!response.ok) {
      throw new Error(`Failed to load manifest: ${response.status}`);
    }
    
    cachedManifest = await response.json();
    return cachedManifest;
    
  } catch (error) {
    console.error("Failed to load image manifest:", error);
    return null;
  }
}

export function findFeatureImages(manifest: ImageManifest, subDirectory: string): ImageFile[] {
  if (!manifest?.features || !subDirectory) {
    return [];
  }

  // Clean the path - remove leading slash
  const cleanPath = subDirectory.startsWith("/") ? subDirectory.slice(1) : subDirectory;
  
  // Look for exact match first
  let featureImages: ImageFile[] = manifest.features[cleanPath] || [];
  
  // Try partial matches if no exact match
  if (featureImages.length === 0) {
    const availableFeatures = Object.keys(manifest.features);
    
    const partialMatch = availableFeatures.find(
      (cat: string) => cat.includes(cleanPath) || cleanPath.includes(cat)
    );
    
    if (partialMatch) {
      featureImages = manifest.features[partialMatch] || [];
    }
  }
  
  return featureImages;
}

export function getPrimaryImageUrl(images: ImageFile[]): string {
  if (images.length === 0) {
    return "";
  }

  // Sort images to prioritize "-1." files and alphabetical order
  const sortedImages = images.sort((a: ImageFile, b: ImageFile) => {
    const aPriority = a.filename.includes("-1.") ? 1 : 2;
    const bPriority = b.filename.includes("-1.") ? 1 : 2;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return a.filename.localeCompare(b.filename);
  });
  
  return sortedImages[0].url;
}