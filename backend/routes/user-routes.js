import express from "express";
import {
  registerValidation,
  loginValidation,
  handleValidationErrors,
} from "../validations/validation.js";
import checkAuths from "../utils/checkAuths.js";
import * as UserController from "../controllers/user-controller.js";

// Создаем роутер
const router = express.Router();

// registration
router.post(
  "/auth/register",
  registerValidation,
  handleValidationErrors,
  UserController.register
);
// login
router.post(
  "/auth/login",
  loginValidation,
  handleValidationErrors,
  UserController.login
);
// получение юзера
router.get("/auth/me", checkAuths, UserController.auth);

export default router;
