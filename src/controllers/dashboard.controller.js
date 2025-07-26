import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const userId = req.user._id;
  if (isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid User Id");
  }
  const totalVideosPromise = Video.countDocuments({ owner: userId });
  const totalViewsPromise = Video.aggregate([
    { $match: { owner: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, totalViews: { $sum: "$views" } } },
  ]);
  const totalLikesPromise = Like.countDocuments({ likedBy: userId });
  const totalSubscribersPromise = Subscription.countDocuments({
    channel: userId,
  });
  const [totalVideos, totalViewsResult, totalLikes, totalSubscribers] =
    await Promise.all([
      totalVideosPromise,
      totalViewsPromise,
      totalLikesPromise,
      totalSubscribersPromise,
    ]);
  const totalViews = totalViewsResult[0]?.totalViews || 0;
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { totalVideos, totalViews, totalLikes, totalSubscribers },
        "Channel statistics fetched successfully",
      ),
    );
});
const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const userId = req.user._id;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid channel ID");
  }
  const videos = await Video.find({ owner: userId })
    .sort({ created: -1 })
    .populate("owner", "username avatar")
    .exec();

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
