import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),

  description: z.string().min(5, "Description too short"),

  price: z.coerce.number().positive("Price must be positive and non zero"),

  status: z.enum(["ACTIVE", "INACTIVE"]),
  imageUrl: z.string().optional(),
});
