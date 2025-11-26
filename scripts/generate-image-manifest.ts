// scripts/generate-image-manifest.ts
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import fs from 'fs/promises';
import path from 'path';
import { config } from 'dotenv';

// Load environment variables from .env files
// This will load .env, .env.local, etc.
// config({ path: '.env' });
config({ path: '.env.local', override: false }); // Don't override if already set

// Type definitions
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
  features: Record<string, ImageFile[]>; // Add features type
}

// Read environment variables directly from process.env
// These should match your astro.config.mjs schema
const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const PUBLIC_R2_BUCKET_URL = process.env.PUBLIC_R2_BUCKET_URL;

Object.keys(process.env)
  .filter(key => key.startsWith('R2_') || key.startsWith('PUBLIC_R2_'))
  .forEach(key => {
    const value = process.env[key];
    // console.log(`  ${key}: ${value ? `${value.substring(0, 20)}${value.length > 20 ? '...' : ''}` : 'undefined'}`);
  });
// console.log('');

// Check if any are missing and log which ones specifically
const missing: string[] = [];
if (!R2_ENDPOINT) missing.push('R2_ENDPOINT');
if (!R2_ACCESS_KEY_ID) missing.push('R2_ACCESS_KEY_ID');
if (!R2_SECRET_ACCESS_KEY) missing.push('R2_SECRET_ACCESS_KEY');
if (!R2_BUCKET_NAME) missing.push('R2_BUCKET_NAME');
if (!PUBLIC_R2_BUCKET_URL) missing.push('PUBLIC_R2_BUCKET_URL');

// Validate required environment variables (remove duplicate check)
if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  console.error(`Missing: ${missing.join(', ')}`);
  console.error('Required: R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, PUBLIC_R2_BUCKET_URL');
  console.error('');
  console.error('💡 Make sure these are set in your environment or .env file:');
  console.error('   - R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com');
  console.error('   - R2_ACCESS_KEY_ID=your_access_key_id');
  console.error('   - R2_SECRET_ACCESS_KEY=your_secret_access_key');
  console.error('   - R2_BUCKET_NAME=your-bucket-name');
  console.error('   - PUBLIC_R2_BUCKET_URL=https://your-bucket.r2.dev');
  console.error('');
  console.error('🔧 You can create a .env file in your project root with these values.');
  process.exit(1);
}

async function generateImageManifest(): Promise<void> {
  // console.log('🔍 Generating image manifest...');
  
  // Create S3 client after validation
  const s3Client = new S3Client({
    region: "auto",
    endpoint: R2_ENDPOINT!,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID!,
      secretAccessKey: R2_SECRET_ACCESS_KEY!,
    },
  });
  
  const manifest: ImageManifest = {
    generated: new Date().toISOString(),
    products: {},
    features: {} // Add features section for feature images
  };

  let totalFiles = 0;
  let processedFiles = 0;

  try {
    const command = new ListObjectsV2Command({
      Bucket: R2_BUCKET_NAME!,
      Prefix: 'products/',
    });

    let continuationToken: string | undefined = undefined;
    
    do {
      if (continuationToken) {
        command.input.ContinuationToken = continuationToken;
      }

      const response = await s3Client.send(command);
      
      if (response.Contents) {
        totalFiles += response.Contents.length;
      }
      
      // Process files
      if (response.Contents) {
        for (const object of response.Contents) {
          const key = object.Key;
          if (!key || key.endsWith('/')) continue; // Skip directories and undefined keys
          
          const pathParts = key.split('/');
          if (pathParts.length >= 3) { // products/category/file.jpg
            const category = pathParts[1];
            const filename = pathParts[pathParts.length - 1];
            
            // Skip non-image files
            if (!isImageFile(filename)) continue;
            
            // Determine if this is a feature image or color variant
            const isFeatureImage = pathParts.includes('feature');
            const targetManifest = isFeatureImage ? manifest.features : manifest.products;
            
            // For feature images, use the full path as key (e.g., "atelier-zitron/echt/feature")
            // For color variants, use just the main category (e.g., "schoppel")
            const manifestKey = isFeatureImage ? 
              pathParts.slice(1, -1).join('/') : // Remove 'products' and filename
              category;
            
            if (!targetManifest[manifestKey]) {
              targetManifest[manifestKey] = [];
              // console.log(`📁 New ${isFeatureImage ? 'feature' : 'color'} category: ${manifestKey}`);
            }
            
            const imageFile: ImageFile = {
              filename,
              url: `${PUBLIC_R2_BUCKET_URL!}/${key}`,
              size: object.Size || 0,
              lastModified: object.LastModified?.toISOString() || new Date().toISOString(),
              colorInfo: extractColorInfo(filename)
            };
            
            targetManifest[manifestKey].push(imageFile);
            processedFiles++;
            
            if (processedFiles % 50 === 0) {
              // console.log(`✅ Processed ${processedFiles} images...`);
            }
          }
        }
      }
      
      continuationToken = response.NextContinuationToken;
    } while (continuationToken);

    // Sort products and features by filename for consistent ordering
    Object.keys(manifest.products).forEach(category => {
      manifest.products[category].sort((a, b) => a.filename.localeCompare(b.filename));
    });
    
    Object.keys(manifest.features).forEach(category => {
      manifest.features[category].sort((a, b) => a.filename.localeCompare(b.filename));
    });

    // Write manifest to public directory
    const manifestPath = path.join(process.cwd(), 'public', 'image-manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    
    // console.log(`✅ Manifest generated with ${Object.keys(manifest.products).length} product categories and ${Object.keys(manifest.features).length} feature categories`);
    // console.log(`📁 Product categories: ${Object.keys(manifest.products).join(', ')}`);
    // console.log(`🖼️  Feature categories: ${Object.keys(manifest.features).join(', ')}`);
    
    // Generate summary
    const totalProductImages = Object.values(manifest.products).reduce((sum, images) => sum + images.length, 0);
    const totalFeatureImages = Object.values(manifest.features).reduce((sum, images) => sum + images.length, 0);
    // console.log(`🖼️  Total product images: ${totalProductImages}`);
    // console.log(`🖼️  Total feature images: ${totalFeatureImages}`);
    // console.log(`🖼️  Grand total: ${totalProductImages + totalFeatureImages} out of ${totalFiles} total files`);
    // console.log(`📝 Manifest saved to: ${manifestPath}`);
    
    // Generate per-category summary
    // console.log(`\n📂 Product Categories:`);
    Object.entries(manifest.products).forEach(([category, images]) => {
      // console.log(`  📂 ${category}: ${images.length} images`);
    });
    
    // console.log(`\n🖼️  Feature Categories:`);
    Object.entries(manifest.features).forEach(([category, images]) => {
      // console.log(`  🖼️  ${category}: ${images.length} images`);
    });
    
  } catch (error) {
    console.error('❌ Error generating manifest:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

function isImageFile(filename: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];
  const ext = path.extname(filename).toLowerCase();
  return imageExtensions.includes(ext);
}

function extractColorInfo(filename: string): string {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  
  // Pattern for "albmerino 7353M Beige-Meliert" type filenames
  const colorMatch = nameWithoutExt.match(/(\w+)\s+(\d+[A-Z]?)\s+(.+)$/);
  if (colorMatch) {
    const [, product, colorCode, colorName] = colorMatch;
    return `${colorCode} ${colorName.replace(/-/g, ' ')}`;
  }
  
  // Pattern for "Echt_8073_01_1" type filenames
  const structuredMatch = nameWithoutExt.match(/(\w+)_(\d+)_(\d+)_(\d+)/);
  if (structuredMatch) {
    const [, productName, colorCode, colorNum] = structuredMatch;
    return `${productName} ${colorCode}-${colorNum}`;
  }
  
  // Fallback to cleaned filename
  return nameWithoutExt.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Call the function directly
// console.log('🚀 Starting manifest generation...');
generateImageManifest().catch(error => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});

export { generateImageManifest };