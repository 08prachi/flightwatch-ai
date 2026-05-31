import { Router } from "express";

import { authMiddleware } from "../middleware/auth.middleware";
import { NotificationController } from "../controllers/notification.controller";

const router = Router();

const controller =
  new NotificationController();

router.get(
  "/",
  authMiddleware,
  controller.getNotifications
);

export default router;