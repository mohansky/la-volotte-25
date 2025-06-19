// src/pages/api/r2-files/[...path].ts
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import type { APIRoute } from "astro";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${import.meta.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: import.meta.env.R2_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.R2_SECRET_ACCESS_KEY,
  },
});

export const GET: APIRoute = async ({ params }) => {
  console.log(`🛤️ Path parameter API called`);
  console.log(`📁 Received params:`, params);
  
  const pathParam = params.path; // This is a string, not an array
  console.log(`📁 Path parameter:`, pathParam);
  console.log(`📁 Path parameter type:`, typeof pathParam);
  
  if (!pathParam || pathParam.trim() === '') {
    return new Response(JSON.stringify({ 
      error: "Path parameter required",
      example: "/api/r2-files/products/schoppel/albmerino/farben",
      received: pathParam,
      type: typeof pathParam
    }), {
      status: 400,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }

  // Handle the path parameter (it's a string, not an array)
  let prefix: string;
  
  if (typeof pathParam === 'string') {
    // pathParam is already the joined path segments
    prefix = pathParam.endsWith('/') ? pathParam : pathParam + '/';
  } else {
    // Fallback in case it somehow becomes an array
    const pathArray = Array.isArray(pathParam) ? pathParam : [pathParam];
    prefix = pathArray.join('/') + '/';
  }
  
  console.log(`📁 Final prefix: "${prefix}"`);

  try {
    const command = new ListObjectsV2Command({
      Bucket: import.meta.env.R2_BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: 1000,
    });

    const response = await s3Client.send(command);
    
    console.log(`📁 R2 Response: Found ${response.Contents?.length || 0} objects`);

    const files = response.Contents?.map(item => {
      const filename = item.Key?.split('/').pop() || '';
      const isImageFile = /\.(jpg|jpeg|png|webp)$/i.test(filename);
      
      return {
        key: item.Key,
        filename: filename,
        size: item.Size,
        lastModified: item.LastModified,
        isImage: isImageFile,
        url: `https://pub-11cf4ccbbccc4a3db1a72d128484c712.r2.dev/${item.Key}`
      };
    }) || [];

    // Filter only image files
    const imageFiles = files.filter(file => file.isImage);
    
    console.log(`🖼️ Found ${imageFiles.length} image files`);
    
    return new Response(JSON.stringify({ 
      success: true,
      method: 'GET_PATH',
      pathParam,
      prefix,
      totalFiles: files.length,
      imageFiles: imageFiles.length,
      files: imageFiles
    }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    console.error("❌ R2 API Error:", error);
    
    return new Response(JSON.stringify({ 
      error: "Failed to fetch files from R2",
      details: error instanceof Error ? error.message : "Unknown error",
      method: 'GET_PATH',
      pathParam,
      prefix
    }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
};