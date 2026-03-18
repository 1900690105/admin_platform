import { auditRepository } from "./audit.repository";

export const auditService = {
  async logAction(action, adminId) {
    return auditRepository.createLog({
      action,
      adminId,
    });
  },
};
