import { productService } from "./product.service";
import { createProductSchema } from "./product.validation";

export const productController = {
  async create(req) {
    const body = await req.json();
    const validated = createProductSchema.parse(body);
    return productService.createProduct(validated);
  },

  async getAll(req) {
    const { searchParams } = new URL(req.url);

    const query = {
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      search: searchParams.get("search"),
      status: searchParams.get("status"),
    };

    return productService.getProducts(query);
  },

  async update(req, id) {
    const body = await req.json();

    return productService.updateProduct(id, body);
  },

  async delete(id) {
    return productService.deleteProduct(id);
  },
};
