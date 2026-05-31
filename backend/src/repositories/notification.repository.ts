import { prisma } from "../config/prisma";

export class NotificationRepository {
  async create(data: {
    userId: string;
    title: string;
    message: string;
  }) {
    return prisma.notification.create({
      data,
    });
  }

  async findByUserId(userId: string) {
    return prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}