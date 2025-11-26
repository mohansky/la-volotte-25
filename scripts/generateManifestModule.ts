// scripts/generateManifestModule.ts
// Run this script AFTER generate-image-manifest.ts to convert JSON to TS module

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

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

function generateManifestModule(): boolean {
  try {
    // Read the JSON manifest created by your existing script
    const manifestPath = join(process.cwd(), 'public', 'image-manifest.json');
    
    // Check if the manifest exists
    try {
      const manifestContent = readFileSync(manifestPath, 'utf-8');
      const manifestData: ImageManifest = JSON.parse(manifestContent);

      // Generate TypeScript module content that matches your existing interfaces
      const moduleContent = `// This file is auto-generated. Do not edit manually.
// Generated from image-manifest.json at: ${new Date().toISOString()}

export interface ImageFile {
  filename: string;
  url: string;
  size: number;
  lastModified: string;
  colorInfo: string;
}

export interface ImageManifest {
  generated: string;
  products: Record<string, ImageFile[]>;
  features: Record<string, ImageFile[]>;
}

export const imageManifest: ImageManifest = ${JSON.stringify(manifestData, null, 2)};

export function findFeatureImages(subDirectory: string): ImageFile[] {
  if (!subDirectory) {
    return [];
  }

  // Clean the path - remove leading slash
  const cleanPath = subDirectory.startsWith("/") ? subDirectory.slice(1) : subDirectory;
  
  // Look for exact match first in features
  let featureImages: ImageFile[] = imageManifest.features[cleanPath] || [];
  
  // Try partial matches if no exact match
  if (featureImages.length === 0) {
    const availableFeatures = Object.keys(imageManifest.features);
    
    const partialMatch = availableFeatures.find(
      (cat: string) => cat.includes(cleanPath) || cleanPath.includes(cat)
    );
    
    if (partialMatch) {
      featureImages = imageManifest.features[partialMatch] || [];
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

// Debug helper functions
export function getAvailableFeaturePaths(): string[] {
  return Object.keys(imageManifest.features);
}

export function getAvailableProductPaths(): string[] {
  return Object.keys(imageManifest.products);
}
`;

      // Ensure the directory exists
      const outputPath = join(process.cwd(), 'src', 'data', 'imageManifest.ts');
      mkdirSync(dirname(outputPath), { recursive: true });
      
      // Write the TypeScript module
      writeFileSync(outputPath, moduleContent, 'utf-8');
      
      console.log('✅ Generated imageManifest.ts module');
      console.log(`   📁 ${Object.keys(manifestData.features).length} feature categories`);
      console.log(`   📦 ${Object.keys(manifestData.products).length} product categories`);
      return true;
    } catch (readError) {
      console.error('❌ Could not read image-manifest.json');
      console.error('   Make sure to run generate-image-manifest.ts first');
      console.error('   Expected file:', manifestPath);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to generate manifest module:', error);
    return false;
  }
}

// Run the function directly (since this script is meant to be executed)
generateManifestModule();

export { generateManifestModule };