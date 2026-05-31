"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const notification_repository_1 = require("../repositories/notification.repository");
class NotificationService {
    notificationRepository = new notification_repository_1.NotificationRepository();
    async getUserNotifications(userId) {
        return this.notificationRepository.findByUserId(userId);
    }
}
exports.NotificationService = NotificationService;
