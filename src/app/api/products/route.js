import { productController } from "@/modules/product/product.controller";
import { successResponse, errorResponse } from "@/utils/apiResponse";
import { getServerSession } from "next-auth";
import { rateLimiter } from "@/utils/rateLimiter";
import { auditService } from "@/modules/audit/audit.service";
import { authOptions } from "@/lib/auth";
import { logger } from "@/lib/logger.js";
import { productQueue } from "@/queues/product.queue";
import { requireRole } from "@/lib/permissions";

export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return errorResponse("Unauthorized", 401);
  }

  const ip = req.headers.get("x-forwarded-for") || "unknown";

  if (!rateLimiter(ip)) {
    return errorResponse("Too many requests", 429);
  }

  logger.info(`Fetching products by ${session.user.role}`);

  try {
    const products = await productController.getAll(req);

    return successResponse(products);
  } catch (error) {
    logger.error(error, "Failed to fetch products");
    return errorResponse(error.message);
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return errorResponse("Unauthorized", 401);
    }

    requireRole(session, ["SUPER_ADMIN", "ADMIN"]);

    const product = await productController.create(req);

    if (global.io) {
      global.io.emit("productCreated", product);
    }

    logger.info(`Product created: ${product.id} by ${session.user.role}`);

    await productQueue.add("product-created", {
      productId: product.id,
      name: product.name,
    });

    await auditService.logAction("CREATE_PRODUCT", session.user.id);

    return successResponse(product);
  } catch (error) {
    return errorResponse(error.message);
  }
}
