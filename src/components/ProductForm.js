"use client";

import { createProductSchema } from "@/modules/product/product.validation";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import ImageUpload from "./ImageUpload";

export default function ProductForm({ product, onSuccess }) {
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || "");
  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    status: product?.status || "ACTIVE",
  });
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const validate = createProductSchema.safeParse(form);

    if (!validate.success) {
      setError(validate.error.issues?.[0]?.message || "Invalid input");
      return;
    }

    const method = product ? "PUT" : "POST";
    const url = product ? `/api/products/${product.id}` : "/api/products";

    try {
      const result = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...validate.data,
          imageUrl,
        }),
      });

      const data = await result.json();

      if (!result.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      if (product) {
        toast.success("Product updated sucessfully");
      } else {
        toast.success("Product added sucessfully");
      }
      onSuccess();
    } catch {
      setError("Network error. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow rounded mb-6">
      <Toaster position="top-right" />
      <h2 className="text-lg font-bold mb-4">
        {product ? "Edit Product" : "Create Product"}
      </h2>
      <input
        name="name"
        className="border p-2 w-full mb-3"
        placeholder="Name"
        value={form.name}
        onChange={handleChange}
      />
      <ImageUpload onUpload={setImageUrl} />

      <input
        name="description"
        className="border p-2 w-full mb-3"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
      />
      <input
        name="price"
        className="border p-2 w-full mb-3"
        placeholder="Price"
        value={form.price}
        onChange={handleChange}
      />
      <select
        name="status"
        className="border p-2 w-full mb-3"
        value={form.status}
        onChange={handleChange}
      >
        <option value="ACTIVE">ACTIVE</option>
        <option value="INACTIVE">INACTIVE</option>
      </select>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <button className="bg-black text-white px-4 py-2">
        {product ? "Update Product" : "Create Product"}
      </button>
    </form>
  );
}
