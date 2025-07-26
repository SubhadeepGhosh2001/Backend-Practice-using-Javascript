import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllVideos } from "../controllers/video.controller.js";
import { addComment, deleteComment, updateComment } from "../controllers/comment.controller.js";

const router=Router();

router.use(verifyJWT);

router.route("/:videoId").get(getAllVideos).post(addComment);

router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default router;