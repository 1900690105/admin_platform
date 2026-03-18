export function requireRole(session, roles) {
  if (!session) {
    throw new Error("Unauthorized");
  }

  if (!roles.includes(session?.user?.role)) {
    throw new Error("Forbidden");
  }
}
