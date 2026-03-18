import { productRepository } from "./product.repository";
import { getCache, setCache, cacheStore } from "@/utils/cache";
import { addJob } from "@/utils/jobQueue";
import { productAnalyticsJob } from "@/jobs/productAnalytics.job";

const CACHE_TTL = 60 * 1000;

export const productService = {
  async createProduct(data) {
    const product = await productRepository.create(data);

    // invalidate cache only
    cacheStore.deleteByPrefix("products");

    addJob(async () => {
      try {
        await productAnalyticsJob(product);
      } catch (err) {
        console.error("Job failed:", err);
      }
    });

    return product;
  },

  async getProducts(query) {
    const cacheKey = `products:${JSON.stringify({
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
      search: query.search || "",
      status: query.status || "",
    })}`;

    const cached = getCache(cacheKey);
    if (cached) return cached;

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = query.search || undefined;
    const status = query.status || undefined;

    const [products, total] = await Promise.all([
      productRepository.findAll({ skip, take: limit, search, status }),
      productRepository.count({ search, status }),
    ]);

    const result = {
      products,
      pagination: { page, limit, total },
    };

    setCache(cacheKey, result, CACHE_TTL);

    return result;
  },

  async getProductById(id) {
    return productRepository.findById(id);
  },

  async updateProduct(id, data) {
    const product = await productRepository.findById(id);

    if (!product) {
      throw new Error("Product not found");
    }

    cacheStore.deleteByPrefix("products");

    return productRepository.update(id, data);
  },

  async deleteProduct(id) {
    const product = await productRepository.findById(id);

    if (!product) {
      throw new Error("Product not found");
    }

    cacheStore.deleteByPrefix("products");

    return productRepository.softDelete(id);
  },
};

// import { productRepository } from "./product.repository";
// import { getCache, setCache } from "@/utils/cache";
// import { cacheStore } from "@/utils/cache";
// import { addJob } from "@/utils/jobQueue";
// import { productAnalyticsJob } from "@/jobs/productAnalytics.job";

// export const productService = {
//   async createProduct(data) {
//     const product = await productRepository.create(data);

//     setCache(`products:${cacheKey}`, data);
//     cacheStore.deleteByPrefix("products");
//     addJob(async () => {
//       try {
//         await productAnalyticsJob(product);
//       } catch (err) {
//         console.error("Job failed:", err);
//       }
//     });

//     return product;
//   },

//   async getProducts(query) {
//     const cacheKey = JSON.stringify({
//       page: Number(query.page) || 1,
//       limit: Number(query.limit) || 10,
//       search: query.search || "",
//       status: query.status || "",
//     });

//     const cached = getCache(cacheKey);

//     if (cached) {
//       return cached;
//     }

//     const page = Number(query.page) || 1;
//     const limit = Number(query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const search = query.search || undefined;
//     const status = query.status || undefined;

//     const [products, total] = await Promise.all([
//       productRepository.findAll({
//         skip,
//         take: limit,
//         search,
//         status,
//       }),
//       productRepository.count({
//         search,
//         status,
//       }),
//     ]);

//     const result = {
//       products,
//       pagination: { page, limit, total },
//     };
//     const CACHE_TTL = 60 * 1000;
//     setCache(cacheKey, result, CACHE_TTL);

//     return result;
//   },

//   async getProductById(id) {
//     return productRepository.findById(id);
//   },

//   async updateProduct(id, data) {
//     const product = await productRepository.findById(id);

//     if (!product) {
//       throw new Error("Product not found");
//     }
//     setCache(`products:${cacheKey}`, data);
//     cacheStore.deleteByPrefix("products");
//     return productRepository.update(id, data);
//   },

//   async deleteProduct(id) {
//     const product = await productRepository.findById(id);

//     if (!product) {
//       throw new Error("Product not found");
//     }
//     setCache(`products:${cacheKey}`, data);
//     cacheStore.deleteByPrefix("products");
//     return productRepository.softDelete(id);
//   },
// };
