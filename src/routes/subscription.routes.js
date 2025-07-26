import { Router } from 'express';
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

// Route to toggle subscription to a channel
router.route("/c/:channelId").post(toggleSubscription);

// Route to get subscribers of a channel
router.route("/c/:channelId/subscribers").get(getUserChannelSubscribers);

// Route to get channels that a user has subscribed to
router.route("/u/:subscriberId/subscriptions").get(getSubscribedChannels);

export default router;