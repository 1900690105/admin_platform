"use client";

import Image from "next/image";
import { useState } from "react";

export default function ImageUpload({ onUpload }) {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.url) {
        onUpload(data.url);
      }
    } catch (error) {
      console.error("Upload failed");
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-600">Product Image</label>

      {preview && (
        <Image
          src={preview}
          alt="preview"
          width={150}
          height={150}
          className="w-32 h-32 object-cover rounded border"
        />
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="text-sm border p-2 mb-2"
      />

      {loading && <span className="text-xs text-gray-500">Uploading...</span>}
    </div>
  );
}
