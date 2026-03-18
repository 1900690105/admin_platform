"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";

export default function NetworkToast() {
  useEffect(() => {
    function handleOffline() {
      toast.error("⚠️ You are offline");
    }

    function handleOnline() {
      toast.success("✅ Back online");
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return null;
}
