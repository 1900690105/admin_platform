import prisma from "@/lib/prisma";

export const productRepository = {
  async create(data) {
    return prisma.product.create({
      data,
    });
  },

  async findAll() {
    return prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id) {
    return prisma.product.findUnique({
      where: { id },
    });
  },

  async update(id, data) {
    return prisma.product.update({
      where: { id },
      data,
    });
  },

  async delete(id) {
    return prisma.product.delete({
      where: { id },
    });
  },
};
