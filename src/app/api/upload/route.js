import { uploadImage } from "@/modules/upload/upload.service";
import { productQueue } from "@/queues/product.queue";

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("file");

  const buffer = Buffer.from(await file.arrayBuffer());

  const imageUrl = await uploadImage(buffer);

  await productQueue.add("product-image", {
    imageUrl: imageUrl,
  });

  return Response.json({
    success: true,
    url: imageUrl,
  });
}
