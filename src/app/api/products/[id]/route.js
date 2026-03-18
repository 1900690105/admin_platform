import { authOptions } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { requireRole } from "@/lib/permissions";
import { auditService } from "@/modules/audit/audit.service";
import { productController } from "@/modules/product/product.controller";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import { getServerSession } from "next-auth";

export async function PUT(req, context) {
  try {
    const session = await getServerSession(authOptions);
    requireRole(session, ["SUPER_ADMIN", "ADMIN"]);

    const params = await context.params;
    const product = await productController.update(req, params.id);

    logger.info(
      { productId: params.id },
      `update products by ${session.user.role}`,
    );

    await auditService.logAction("UPDATE_PRODUCT", session.user.id);

    return successResponse(product);
  } catch (error) {
    return errorResponse(error.message);
  }
}

export async function DELETE(req, { params }) {
  const { id } = await params;

  const session = await getServerSession(authOptions);

  requireRole(session, ["SUPER_ADMIN"]);

  const result = await productController.delete(id);

  logger.info({ productId: id }, `Deleting product by ${session.user.role}`);

  await auditService.logAction("DELETE_PRODUCT", session.user.id);

  return successResponse(result);
}
