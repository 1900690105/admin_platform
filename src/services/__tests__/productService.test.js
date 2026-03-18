import { calculateDiscount } from "../productService";

test("calculates discount correctly", () => {
  const result = calculateDiscount(100, 0.2);
  expect(result).toBe(80);
});
