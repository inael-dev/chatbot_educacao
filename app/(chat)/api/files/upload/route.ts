import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/app/(auth)/auth";

const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "File size should be less than 5MB",
    })
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "application/pdf"].includes(file.type),
      { message: "File type should be JPEG, PNG or PDF" }
    ),
});

const r2Client = new S3Client({
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  region: "auto",
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (request.body === null) {
    return new Response("Request body is empty", { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as Blob;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const validatedFile = FileSchema.safeParse({ file });

    if (!validatedFile.success) {
      const errorMessage = validatedFile.error.issues
        .map((error) => error.message)
        .join(", ");

      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const filename = (formData.get("file") as File).name;
    const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const pathname = `${nanoid()}-${safeName}`;
    // O nome viaja no corpo de /api/chat, cujo schema limita a 100 chars. O
    // pathname já gasta 22 desses com o nanoid, então nome de arquivo longo
    // estourava o teto e o envio morria com 400 sem mensagem nenhuma.
    const displayName = (filename || safeName).slice(0, 100);
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    try {
      await r2Client.send(
        new PutObjectCommand({
          Body: fileBuffer,
          Bucket: process.env.R2_BUCKET_NAME,
          ContentType: file.type,
          Key: pathname,
        })
      );

      return NextResponse.json({
        contentType: file.type,
        name: displayName,
        pathname,
        url: `${process.env.R2_PUBLIC_URL}/${pathname}`,
      });
    } catch {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
