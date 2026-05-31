"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatchlistRepository = void 0;
const prisma_1 = require("../config/prisma");
class WatchlistRepository {
    async findByUserId(userId) {
        return prisma_1.prisma.watchlist.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
    }
    async findById(id) {
        return prisma_1.prisma.watchlist.findUnique({
            where: {
                id,
            },
            include: {
                user: true,
            },
        });
    }
    async create(data) {
        const createData = {
            origin: data.origin,
            destination: data.destination,
            departureDate: new Date(data.departureDate),
            returnDate: data.returnDate ? new Date(data.returnDate) : null,
            budget: data.budget,
            passengers: data.passengers,
            flightType: data.flightType,
            cabinClass: data.cabinClass,
            active: data.active,
            userId: data.userId,
        };
        return prisma_1.prisma.watchlist.create({
            data: createData,
        });
    }
    async update(id, data) {
        return prisma_1.prisma.watchlist.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return prisma_1.prisma.watchlist.delete({
            where: { id },
        });
    }
}
exports.WatchlistRepository = WatchlistRepository;
