"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notification_service_1 = require("../services/notification.service");
const notificationService = new notification_service_1.NotificationService();
class NotificationController {
    async getNotifications(req, res) {
        try {
            const notifications = await notificationService.getUserNotifications(req.userId);
            return res.json(notifications);
        }
        catch (error) {
            return res.status(500).json({
                message: error instanceof Error
                    ? error.message
                    : "Something went wrong",
            });
        }
    }
}
exports.NotificationController = NotificationController;
