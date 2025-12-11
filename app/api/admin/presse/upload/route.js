// app/api/admin/presse/upload/route.js
import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const runtime = "nodejs";

const REGION = process.env.AWS_REGION;
const BUCKET = process.env.AWS_S3_BUCKET;

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Aucun fichier reçu." },
        { status: 400 }
      );
    }

    // On transforme en buffer pour S3
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const originalName = file.name || "presse.jpg";
    const ext = originalName.includes(".")
      ? originalName.split(".").pop()
      : "jpg";

    const key = `presse/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type || "image/jpeg",
    });

    await s3.send(command);

    const imageUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;

    return NextResponse.json({ imageUrl, storageKey: key });
  } catch (err) {
    console.error("Erreur upload presse :", err);
    return NextResponse.json(
      { error: "Erreur lors de l’upload de l’image." },
      { status: 500 }
    );
  }
}
