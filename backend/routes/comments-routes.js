import express from "express";
import * as CommentsContoller from "../controllers/comments-controller.js";
import checkAuths from "../utils/checkAuths.js";

const router = express.Router();

// Роут на создание коммента
// :id в данном случае - это _id поста, для которого будет создаваться комментарий
// в :id идет id, который будет поулчаться из url на странице
router.post("/comments/:id", checkAuths, CommentsContoller.create);

export default router;
