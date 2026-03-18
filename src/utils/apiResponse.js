import { applySecurityHeaders } from "./securityHeaders";

export function successResponse(data) {
  const res = Response.json({
    success: true,
    data,
  });

  return applySecurityHeaders(res);
}

export function errorResponse(message, status = 400) {
  const res = Response.json(
    {
      success: false,
      message,
    },
    { status },
  );

  return applySecurityHeaders(res);
}
