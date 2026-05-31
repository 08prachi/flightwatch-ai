"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const prisma_1 = require("../config/prisma");
const crypto_1 = require("crypto");
class UserRepository {
    async findByEmail(email) {
        return prisma_1.prisma.user.findUnique({
            where: {
                email,
            },
        });
    }
    async create(data) {
        return prisma_1.prisma.user.create({
            data: {
                id: (0, crypto_1.randomUUID)(),
                ...data,
            },
        });
    }
    async findById(id) {
        return prisma_1.prisma.user.findUnique({
            where: { id },
        });
    }
    async update(id, data) {
        return prisma_1.prisma.user.update({
            where: { id },
            data,
        });
    }
}
exports.UserRepository = UserRepository;
