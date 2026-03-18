import prisma from "@/lib/prisma";

export const auditRepository = {
  async createLog({ action, adminId }) {
    return prisma.auditLog.create({
      data: {
        action,
        adminId,
      },
    });
  },
};
