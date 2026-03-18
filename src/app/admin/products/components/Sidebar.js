"use client";
import { useSession } from "next-auth/react";
import React from "react";

function Sidebar() {
  const { data: session } = useSession();

  const role = session?.user?.role;
  return (
    <>
      <aside className="w-64 bg-gray-900 text-white p-6">
        <h2 className="text-xl font-bold mb-6">
          {" "}
          {role === "SUPER_ADMIN" ? "SUPER ADMIN" : "ADMIN"} Panel
        </h2>

        <nav className="space-y-3">
          <a href="/admin" className="block hover:text-gray-300">
            Dashboard
          </a>

          <a href="/admin/products" className="block hover:text-gray-300">
            Products
          </a>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
