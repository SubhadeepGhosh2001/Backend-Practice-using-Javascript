import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user._id;

  if (!userId) {
    throw new ApiError(404, "No User found");
  }

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  if (channelId.toString() === userId.toString()) {
    throw new ApiError(400, "You cannot subscribe to yourself");
  }

  const existingChannel = await User.findById(channelId);
  if (!existingChannel) {
    throw new ApiError(404, "Channel Not Found");
  }

  const existingSubscription = await Subscription.findOne({
    channel: channelId,
    subscriber: userId,
  });

  if (existingSubscription) {
    await existingSubscription.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Unsubscribed successfully"));
  } else {
    await Subscription.create({
      channel: channelId,
      subscriber: userId,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, null, "Subscribed successfully"));
  }
});

// Controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const subscribers = await Subscription.find({ channel: channelId })
    .populate("subscriber", "username email avatar")
    .exec();

  return res
    .status(200)
    .json(new ApiResponse(200, subscribers, "List of subscribers"));
});

// Controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriber ID");
  }

  const channels = await Subscription.find({ subscriber: subscriberId })
    .populate("channel", "username email avatar")
    .exec();

  return res
    .status(200)
    .json(new ApiResponse(200, channels, "List of subscribed channels"));
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
