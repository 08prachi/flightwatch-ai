import { NotificationRepository } from "../repositories/notification.repository";

export class NotificationService {
  private notificationRepository =
    new NotificationRepository();

  async getUserNotifications(
    userId: string
  ) {
    return this.notificationRepository.findByUserId(
      userId
    );
  }
}