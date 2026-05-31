"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const notification_controller_1 = require("../controllers/notification.controller");
const router = (0, express_1.Router)();
const controller = new notification_controller_1.NotificationController();
router.get("/", auth_middleware_1.authMiddleware, controller.getNotifications);
exports.default = router;
