import cloudinary from "@/lib/cloudinary";

export interface MediaAsset {
  publicId: string;
  secureUrl: string;
  resourceType: "image" | "video" | "raw";
  folder: string;
  width?: number;
  height?: number;
}

/**
 * Uploads a file buffer to Cloudinary and returns the identifiers we
 * persist on the owning document (Product, Category, BlogPost, etc).
 * Storing publicId + resourceType is what makes reliable deletion
 * possible later — never store just the URL.
 */
export async function uploadMedia(
  fileBuffer: Buffer,
  folder: string
): Promise<MediaAsset> {
  const result = await new Promise<import("cloudinary").UploadApiResponse>(
    (resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: "image" },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve(result);
        }
      );
      stream.end(fileBuffer);
    }
  );

  return {
    publicId: result.public_id,
    secureUrl: result.secure_url,
    resourceType: result.resource_type as MediaAsset["resourceType"],
    folder,
    width: result.width,
    height: result.height,
  };
}

/**
 * Deletes an asset from Cloudinary. Callers (product service, category
 * service, etc.) MUST call this whenever they remove a MongoDB reference
 * to an image — never delete the DB record alone.
 */
export async function deleteMedia(
  publicId: string,
  resourceType: MediaAsset["resourceType"] = "image"
): Promise<void> {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

/**
 * Deletes multiple assets in parallel — used when removing an entire
 * product (all its variant/gallery images) in one operation.
 */
export async function deleteManyMedia(assets: MediaAsset[]): Promise<void> {
  await Promise.all(
    assets.map((asset) => deleteMedia(asset.publicId, asset.resourceType))
  );
}
