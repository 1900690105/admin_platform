import { productService } from "./product.service";

export const productController = {
  async create(req) {
    const body = await req.json();
    return productService.createProduct(body);
  },

  async getAll() {
    return productService.getProducts();
  },
};
