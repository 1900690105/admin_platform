"use client";

import { useEffect, useState, useCallback } from "react";
import ProductForm from "@/components/ProductForm";
import toast, { Toaster } from "react-hot-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { getSocket } from "@/lib/socketClient";

const STATUS_CONFIG = {
  ACTIVE: {
    label: "Active",
    classes: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-500",
  },
  INACTIVE: {
    label: "Inactive",
    classes: "bg-gray-100 text-gray-500 border border-gray-200",
    dot: "bg-gray-400",
  },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status?.toUpperCase()] || STATUS_CONFIG.INACTIVE;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.classes}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

const PAGE_SIZE_OPTIONS = [100, 200, 400, 500];

const SORT_FIELDS = [
  { key: "name", label: "Name" },
  { key: "imageUrl", label: "Image" },
  { key: "price", label: "Price" },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Created" },
];

function SortIcon({ field, sortField, sortDir }) {
  if (sortField !== field)
    return (
      <svg
        className="w-3.5 h-3.5 text-gray-300 ml-1 inline"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
        />
      </svg>
    );
  return sortDir === "asc" ? (
    <svg
      className="w-3.5 h-3.5 text-blue-600 ml-1 inline"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
      />
    </svg>
  ) : (
    <svg
      className="w-3.5 h-3.5 text-blue-600 ml-1 inline"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
      />
    </svg>
  );
}

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(100);
  const [editingProduct, setEditingProduct] = useState(null);
  const [sortField, setSortField] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const role = session?.user?.role;

  function startEdit(product) {
    setEditingProduct(product);
    setOpenForm(true);
  }

  async function deleteProduct(id) {
    if (!confirm("Do you want to delete this product?")) return;

    try {
      const result = await fetch(`/api/products/${id}`, { method: "DELETE" });

      if (result.ok) {
        toast.success("Product deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["products"] });
      } else if (result.status == 500) {
        toast.error("Insufficient Permission.");
      } else {
        toast.error("Something went wrong.");
      }
    } catch {
      toast.error("Something went wrong.");
    }
  }

  const fetchProducts = async ({
    page,
    pageSize,
    search,
    sortField,
    sortDir,
    statusFilter,
  }) => {
    const params = new URLSearchParams({
      page,
      limit: pageSize,
      search,
      sortField,
      sortDir,
      ...(statusFilter !== "ALL" && { status: statusFilter }),
    });

    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch products");
    }

    return data.data;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "products",
      page,
      pageSize,
      search,
      sortField,
      sortDir,
      statusFilter,
    ],

    queryFn: () =>
      fetchProducts({
        page,
        pageSize,
        search,
        sortField,
        sortDir,
        statusFilter,
      }),

    keepPreviousData: true,
  });

  useEffect(() => {
    const socket = getSocket();

    const handleProductCreated = () => {
      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    };

    socket.on("productCreated", handleProductCreated);

    return () => {
      socket.off("productCreated", handleProductCreated);
    };
  }, [queryClient]);

  const products = data?.products || [];
  const pagination = data?.pagination;

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Something went wrong");
    }
  }, [error]);

  function handleSort(field) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
    setPage(1);
  }

  function handleSearch() {
    setSearch(searchInput);
    setPage(1);
  }

  function handleStatusFilter(status) {
    setStatusFilter(status);
    setPage(1);
  }

  function handlePageSize(size) {
    setPageSize(Number(size));
    setPage(1);
  }

  const totalPages = Math.ceil((pagination?.total || 0) / pageSize);

  if (isLoading)
    return (
      <div>
        <p>Loading data...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {pagination?.total ?? "—"} total products
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setOpenForm((v) => !v);
          }}
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
        >
          {openForm ? (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Close Form
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Product
            </>
          )}
        </button>
      </div>

      {/* Product Form */}
      {openForm && (
        <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
          <ProductForm
            key={editingProduct?.id || "create"}
            product={editingProduct}
            onSuccess={() => {
              setEditingProduct(null);
              queryClient.invalidateQueries({ queryKey: ["products"] });
            }}
          />
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-4">
        <div className="p-3 sm:p-4 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex gap-2 flex-1 min-w-0">
            <div className="relative flex-1 min-w-0">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search products..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
            >
              Search
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex gap-1.5 flex-wrap">
            {["ALL", "ACTIVE", "INACTIVE"].map((s) => (
              <button
                key={s}
                onClick={() => handleStatusFilter(s)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Page Size */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 whitespace-nowrap">
              Rows:
            </span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSize(e.target.value)}
              className="border border-gray-200 rounded-lg text-sm px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {PAGE_SIZE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {SORT_FIELDS.map(({ key, label }) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-900 select-none whitespace-nowrap"
                  >
                    {label}
                    <SortIcon
                      field={key}
                      sortField={sortField}
                      sortDir={sortDir}
                    />
                  </th>
                ))}
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-gray-400 text-sm"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                      Loading products...
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-12 text-center text-gray-400 text-sm"
                  >
                    <svg
                      className="w-8 h-8 mx-auto mb-2 text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3 font-medium text-gray-900">
                      <Image
                        src={product.imageUrl || "/teamgcoey.jpg"}
                        alt="image"
                        width={50}
                        height={50}
                      />
                    </td>
                    <td className="p-3 font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="p-3 text-gray-600 tabular-nums">
                      ${Number(product.price).toFixed(2)}
                    </td>
                    <td className="p-3">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="p-3 text-gray-500 text-xs">
                      {product.createdAt
                        ? new Date(product.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )
                        : "—"}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => startEdit(product)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <span className="text-gray-200">|</span>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="sm:hidden divide-y divide-gray-100">
          {isLoading ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              Loading...
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No products found
            </div>
          ) : (
            products.map((product) => (
              <div key={product.id} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="font-medium text-gray-900 text-sm">
                    {product.name}
                  </span>
                  <StatusBadge status={product.status} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-gray-900 font-semibold">
                      ${Number(product.price).toFixed(2)}
                    </span>
                    {product.createdAt && (
                      <span className="text-gray-400 text-xs ml-2">
                        {new Date(product.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => startEdit(product)}
                      className="text-blue-600 text-sm font-medium"
                    >
                      Edit
                    </button>
                    {role === "SUPER_ADMIN" && (
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="text-red-500 text-sm font-medium"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {!isLoading && products.length > 0 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <p className="text-gray-500 text-xs">
            Showing{" "}
            <span className="font-medium text-gray-700">
              {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, pagination.total)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-gray-700">
              {pagination.total}
            </span>{" "}
            results
          </p>

          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage(1)}
              className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="First page"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                      page === pageNum
                        ? "bg-blue-600 text-white"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(totalPages)}
              className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Last page"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
