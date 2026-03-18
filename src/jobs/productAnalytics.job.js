export async function productAnalyticsJob(product) {
  console.log("Processing analytics for product:", product.id);

  await new Promise((resolve) => setTimeout(resolve, 2000));

  console.log("Analytics recorded");
}
