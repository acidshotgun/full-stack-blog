import express from "express";
import * as PostContoller from "../controllers/post-controller.js";
import checkAuths from "../utils/checkAuths.js";
import { postCreateValidation } from "../validations/validation.js";

const router = express.Router();

router.get("/posts", PostContoller.getAll);
router.get("/posts/:id", PostContoller.getOne);
router.post("/posts", checkAuths, postCreateValidation, PostContoller.create);
router.delete("/posts/:id", checkAuths, PostContoller.remove);
router.patch("/posts/:id", checkAuths, PostContoller.update);

export default router;
