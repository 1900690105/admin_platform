import { productRepository } from "./product.repository";

export const productService = {
  async createProduct(data) {
    if (!data.name) {
      throw new Error("Product name required");
    }

    return productRepository.create(data);
  },

  async getProducts() {
    return productRepository.findAll();
  },

  async getProductById(id) {
    return productRepository.findById(id);
  },

  async updateProduct(id, data) {
    return productRepository.update(id, data);
  },

  async deleteProduct(id) {
    return productRepository.delete(id);
  },
};
