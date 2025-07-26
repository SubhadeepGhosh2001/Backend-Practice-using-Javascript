import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "createdAt",
    sortType = "desc",
    userId,
    category,
    minViews,
    maxViews,
    minDuration,
    maxDuration,
    isPublished,
  } = req.query;

  const matchStage = {};

  if (query) {
    matchStage.$or = [
      {
        title: { $regex: query, $options: "i" },
      },
      {
        description: { $regex: query, $options: "i" },
      },
    ];
  }
  if (userId && isValidObjectId(userId)) {
    matchStage.owner = new mongoose.Types.ObjectId(userId);
  }

  if (category) {
    matchStage.category = category;
  }
  if (isPublished !== undefined) {
    matchStage.isPublished = isPublished === "true";
  }
  if (minViews || maxViews) {
    matchStage.views = {};
    if (minViews) matchStage.views.$gte = parseInt(minViews);
    if (maxViews) matchStage.views.$lte = parseInt(maxViews);
  }

  if (minDuration || maxDuration) {
    matchStage.duration = {};
    if (minDuration) matchStage.duration.$gte = parseInt(minDuration);
    if (maxDuration) matchStage.duration.$lte = parseInt(maxDuration);
  }
  const sortStage = {};
  const sortDirection = sortType === "asc" ? 1 : -1;
  sortStage[sortBy] = sortDirection;
  const aggregatePipeline = [
    { $match: matchStage },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "uploader",
      },
    },
    { $unwind: "$uploader" },
    {
      $project: {
        title: 1,
        description: 1,
        videoFile: 1,
        thumbnail: 1,
        category: 1,
        duration: 1,
        views: 1,
        isPublished: 1,
        createdAt: 1,
        uploader: {
          _id: 1,
          username: 1,
          avatar: 1,
        },
      },
    },
    { $sort: sortStage },
  ];

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };

  const result = await Video.aggregatePaginate(
    Video.aggregate(aggregatePipeline),
    options,
  );

  if (!result.docs || result.docs.length === 0) {
    throw new ApiError(404, "No videos found for the given criteria");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description, category } = req.body;
  const videoFile = req.files?.videoFile?.[0];
  const thumbnail = req.files?.thumbnail?.[0];
  if (!videoFile || !thumbnail) {
    throw new ApiError(400, "Video file and thumbnail are required");
  }
  const videoUpload = await uploadOnCloudinary(videoFile);
  const thumbnailUpload = await uploadOnCloudinary(thumbnail);
  if (!videoUpload?.url || !thumbnailUpload?.url) {
    throw new ApiError(500, "Cloudinary upload failed");
  }
  const duration = Math.ceil(videoUpload?.duration || 0); // seconds
  if (!videoUpload?.duration) {
    throw new ApiError(500, "Cloudinary duration error");
  }
  const newVideo = await Video.create({
    title,
    description,
    category,
    duration,
    videoFile: videoUpload.url,
    thumbnail: thumbnailUpload.url,
    owner: req.user._id,
    isPublished: true,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, newVideo, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  const objectId = new mongoose.Types.ObjectId(videoId);

  const result = await Video.aggregate([
    {
      $match: { _id: objectId },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    { $unwind: "$owner" },
    {
      $project: {
        title: 1,
        description: 1,
        videoFile: 1,
        thumbnail: 1,
        category: 1,
        duration: 1,
        views: 1,
        isPublished: 1,
        createdAt: 1,
        updatedAt: 1,
        "owner._id": 1,
        "owner.username": 1,
        "owner.avatar": 1,
      },
    },
  ]);

  if (!result || result.length === 0) {
    throw new ApiError(404, "Video not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, result[0], "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description, category } = req.body;
  const thumbnail = req.files?.thumbnail?.[0];
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  if (!video.owner.equals(req.user._id)) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  if (title) video.title = title;
  if (description) video.description = description;
  if (category) video.category = category;
  if (thumbnail) {
    const uploadThumbNail = await uploadOnCloudinary(thumbnail);
    if (!uploadThumbNail?.url) {
      throw new ApiError(500, "Failed to upload new thumbnail");
    }
    video.thumbnail = uploadThumbNail.url;
  }
  await video.save();
  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  if (!video.owner.equals(req.user._id)) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }
  await deleteFromCloudinary(video.videoFile);
  await deleteFromCloudinary(video.thumbnail);
  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  if (!video.owner.equals(req.user._id)) {
    throw new ApiError(403, "You are not authorized to modify this video");
  }
  video.isPublished = !video.isPublished;
  await video.save();
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isPublished: video.isPublished },
        `Video is now ${video.isPublished ? "published" : "unpublished"}`,
      ),
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
