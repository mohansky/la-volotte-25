// src/pages/api/r2-files/[...path].ts
import type { APIRoute, APIContext } from "astro";

// Define types for R2 objects
interface R2Object {
  key: string;
  size: number;
  uploaded: Date;
}

interface R2ListResult {
  objects: R2Object[];
}

interface R2Bucket {
  list(options: { prefix: string; limit: number }): Promise<R2ListResult>;
}

interface CloudflareRuntime {
  env: {
    R2_BUCKET?: R2Bucket;
  };
}

interface ExtendedLocals {
  runtime?: CloudflareRuntime;
}

interface FileInfo {
  key: string;
  filename: string;
  size: number;
  lastModified: Date;
  isImage: boolean;
  url: string;
}

export const GET: APIRoute = async ({ params, locals }: APIContext): Promise<Response> => {
  console.log(`🛤️ Path parameter API called`);
  console.log(`📁 Received params:`, params);
  
  const pathParam = params.path;
  console.log(`📁 Path parameter:`, pathParam);
  console.log(`📁 Path parameter type:`, typeof pathParam);
  
  if (!pathParam || (typeof pathParam === 'string' && pathParam.trim() === '')) {
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

  // Handle the path parameter - it should be a string in Astro's [...path] format
  let prefix: string;
  if (typeof pathParam === 'string') {
    prefix = pathParam.endsWith('/') ? pathParam : pathParam + '/';
  } else {
    // This shouldn't happen with [...path] but let's handle it just in case
    prefix = String(pathParam) + '/';
  }
  
  console.log(`📁 Final prefix: "${prefix}"`);

  try {
    // Access the R2 bucket through Cloudflare's runtime
    const extendedLocals = locals as ExtendedLocals;
    const bucket = extendedLocals.runtime?.env?.R2_BUCKET;
    
    if (!bucket) {
      // Fallback to REST API if binding is not available
      return await fetchViaRestAPI(prefix);
    }

    // Use native R2 binding
    const objects = await bucket.list({ prefix, limit: 1000 });
    
    const files: FileInfo[] = objects.objects.map((item: R2Object) => {
      const filename = item.key.split('/').pop() || '';
      const isImageFile = /\.(jpg|jpeg|png|webp)$/i.test(filename);
      
      return {
        key: item.key,
        filename: filename,
        size: item.size,
        lastModified: item.uploaded,
        isImage: isImageFile,
        url: `https://pub-11cf4ccbbccc4a3db1a72d128484c712.r2.dev/${item.key}`
      };
    });

    const imageFiles = files.filter((file: FileInfo) => file.isImage);
    
    console.log(`🖼️ Found ${imageFiles.length} image files`);
    
    return new Response(JSON.stringify({ 
      success: true,
      method: 'GET_PATH_NATIVE',
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
      method: 'GET_PATH_NATIVE',
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

// Fallback function using REST API
async function fetchViaRestAPI(prefix: string): Promise<Response> {
  const accountId = import.meta.env.R2_ACCOUNT_ID;
  const accessKeyId = import.meta.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = import.meta.env.R2_SECRET_ACCESS_KEY;
  const bucketName = import.meta.env.R2_BUCKET_NAME;

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
    return new Response(JSON.stringify({
      error: 'Missing R2 credentials',
      details: 'R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME must be set'
    }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }

  // For now, return an error indicating that REST API is not implemented
  // You would need to implement AWS signature v4 here for a complete solution
  return new Response(JSON.stringify({
    error: 'R2 binding not available and REST API fallback not implemented',
    details: 'Please configure R2 bindings in wrangler.toml',
    suggestion: 'Add R2_BUCKET binding to your Cloudflare Pages environment'
  }), {
    status: 503,
    headers: { 
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
}