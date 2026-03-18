"use client";
import { useSession } from "next-auth/react";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">
        {role === "SUPER_ADMIN" ? "SUPER ADMIN" : "ADMIN"} Dashboard
      </h1>

      <p>
        Welcome to the {role === "SUPER_ADMIN" ? "SUPER ADMIN" : "ADMIN"} panel.
      </p>
    </div>
  );
}
