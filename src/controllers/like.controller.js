import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  const userId = req.user._id;
  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: userId,
  });
  if (existingLike) {
    await existingLike.deleteOne();
    return res.status(200).json(new ApiResponse(200, null, "Video unliked"));
  }

  const newLike = await Like.create({ video: videoId, likedBy: userId });

  return res.status(201).json(new ApiResponse(201, newLike, "Video liked"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid Comment ID");
  }
  const userId = req.user._id;
  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });
  if (existingLike) {
    await existingLike.deleteOne();
    return res.status(200).json(new ApiResponse(200, null, "Comment unliked"));
  }

  const newLike = await Like.create({ comment: commentId, likedBy: userId });

  return res.status(201).json(new ApiResponse(201, newLike, "Comment liked"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid Tweet ID");
  }
  const userId = req.user._id;
  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: userId,
  });
  if (existingLike) {
    await existingLike.deleteOne();
    return res.status(200).json(new ApiResponse(200, null, "Tweet unliked"));
  }

  const newLike = await Like.create({ tweet: tweetId, likedBy: userId });

  return res.status(201).json(new ApiResponse(201, newLike, "Tweet liked"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const likedVideos = await Like.find({
    likedBy: userId,
    video: { $ne: null },
  }).populate("video");
  if (likedVideos.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No liked videos found"));
  }
  return res
    .status(200)
    .json(new ApiResponse(200, likedVideos, "Fetched liked videos"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
