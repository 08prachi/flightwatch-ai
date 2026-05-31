import { prisma } from "../config/prisma";
import { randomUUID } from "crypto";

export class UserRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
    });
  }

  async create(data: {
    name: string;
    email: string;
    password: string;
  }) {
    return prisma.user.create({
      data: {
        id: randomUUID(),
        ...data,
      },
    });
  }

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: { password: string }) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}