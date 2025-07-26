import { uploadOnCloudinary } from './src/utils/cloudinary.js';

const run = async () => {
  const result = await uploadOnCloudinary('./public/temp/MyDp.jpeg'); // adjust path
  console.log("🚀 Upload Result:", result);
};

run();