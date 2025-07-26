import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localfilePath) => {
  try {
    if (!localfilePath) return null;

    const result = await cloudinary.uploader.upload(localfilePath, {
      folder: "youtube-clone",
      resource_type: "auto",
    });

    // Safely delete local file
    if (fs.existsSync(localfilePath)) {
      fs.unlinkSync(localfilePath);
    }
 
    return {
      url: result.secure_url,
      duration: result.duration || null, // this works only for videos
      resource_type: result.resource_type,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    if (fs.existsSync(localfilePath)) {
      fs.unlinkSync(localfilePath);
    }

    console.error("Cloudinary Upload Error:", error);
    throw new Error("Failed to upload file to Cloudinary");
  }
};

export { uploadOnCloudinary };
