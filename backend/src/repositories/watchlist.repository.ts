import { prisma } from "../config/prisma";
import { Watchlist } from "@prisma/client";

export class WatchlistRepository {
  async findByUserId(userId: string): Promise<Watchlist[]> {
    return prisma.watchlist.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findById(id: string) {
    return prisma.watchlist.findUnique({
      where: {
        id,
      },
      include: {
        user: true,
      },
    });
  }

  async create(data: {
    origin: string;
    destination: string;
    departureDate: Date | string;
    returnDate?: Date | string | null;
    budget: number;
    passengers: number;
    flightType: string;
    cabinClass: string;
    active: boolean;
    userId: string;
  }): Promise<Watchlist> {
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

    return prisma.watchlist.create({
      data: createData,
    });
  }

  async update(
    id: string,
    data: Partial<{
      origin: string;
      destination: string;
      budget?: number | null;
      flightType: string;
      active: boolean;
      cabinClass: string;
    }>
  ): Promise<Watchlist> {
    return prisma.watchlist.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Watchlist> {
    return prisma.watchlist.delete({
      where: { id },
    });
  }
}