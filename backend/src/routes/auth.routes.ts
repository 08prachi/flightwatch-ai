import { Router } from "express";

import { AuthController } from "../controllers/auth.controller";

const router = Router();

const controller =
  new AuthController();

router.post(
  "/signup",
  controller.register
);

router.post(
  "/login",
  controller.login
);

router.post(
  "/logout",
  controller.logout
);

router.post(
  "/change-password",
  controller.changePassword
);

export default router;