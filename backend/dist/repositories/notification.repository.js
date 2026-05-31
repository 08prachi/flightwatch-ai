"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const prisma_1 = require("../config/prisma");
class NotificationRepository {
    async create(data) {
        return prisma_1.prisma.notification.create({
            data,
        });
    }
    async findByUserId(userId) {
        return prisma_1.prisma.notification.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
}
exports.NotificationRepository = NotificationRepository;
