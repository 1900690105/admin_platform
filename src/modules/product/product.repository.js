import prisma from "@/lib/prisma";
import redis from "@/lib/redis";

export const productRepository = {
  async clearProductsCache() {
    const keys = await redis.keys("products:*");
    if (keys.length) await redis.del(keys);
  },

  async create(data) {
    const product = await prisma.product.create({ data });

    await this.clearProductsCache();

    return product;
  },

  async findAll({ skip, take, search, status }) {
    const cacheKey = `products:${skip}:${take}:${search || ""}:${status || ""}`;

    const cached = await redis.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const products = await prisma.product.findMany({
      where: {
        deletedAt: null,
        ...(status && { status }),
        ...(search && {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }),
      },

      orderBy: {
        createdAt: "desc",
      },

      skip,
      take,
    });

    await redis.set(cacheKey, JSON.stringify(products), "EX", 60);

    return products;
  },

  async count({ search, status }) {
    return prisma.product.count({
      where: {
        ...(status && { status }),
        ...(search && {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }),
      },
    });
  },

  async findById(id) {
    return prisma.product.findUnique({
      where: { id },
    });
  },

  async update(id, data) {
    const product = await prisma.product.update({
      where: { id },
      data,
    });

    await this.clearProductsCache();

    return product;
  },

  async delete(id) {
    const product = await prisma.product.delete({
      where: { id },
    });

    await this.clearProductsCache();

    return product;
  },

  async softDelete(id) {
    const product = await prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    await this.clearProductsCache();

    return product;
  },
};
