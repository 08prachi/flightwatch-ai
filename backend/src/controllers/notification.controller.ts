import { Request, Response } from "express";
import { NotificationService } from "../services/notification.service";

const notificationService =
  new NotificationService();

export class NotificationController {
  async getNotifications(
    req: any,
    res: Response
  ) {
    try {
      const notifications =
        await notificationService.getUserNotifications(
          req.userId
        );

      return res.json(
        notifications
      );
    } catch (error) {
      return res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong",
      });
    }
  }
}