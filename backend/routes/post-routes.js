import express from "express";
import * as PostContoller from "../controllers/post-controller.js";
import checkAuths from "../utils/checkAuths.js";
import {
  postCreateValidation,
  handleValidationErrors,
} from "../validations/validation.js";

const router = express.Router();

router.get("/posts", PostContoller.getAll);
router.get("/posts/:id", PostContoller.getOne);
router.post(
  "/posts",
  checkAuths,
  postCreateValidation,
  handleValidationErrors,
  PostContoller.create
);
router.delete("/posts/:id", checkAuths, PostContoller.remove);
router.patch(
  "/posts/:id",
  checkAuths,
  postCreateValidation,
  handleValidationErrors,
  PostContoller.update
);

export default router;
