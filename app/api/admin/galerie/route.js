// app/api/admin/galerie/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const runtime = "nodejs";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET;

export async function GET() {
  try {
    const photos = await prisma.galleryImage.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(photos);
  } catch (err) {
    console.error("[GET /api/admin/galerie]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const formData = await req.formData();

    const file = formData.get("file");
    const title = formData.get("title") || null;
    const alt = formData.get("alt") || null;

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Aucun fichier reçu" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const ext = file.name?.split(".").pop() || "jpg";
    const key = `galerie/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET, // compagnie-mathilde-images
        Key: key,
        Body: buffer,
        ContentType: file.type || "image/jpeg",
      })
    );

    const imageUrl = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    const photo = await prisma.galleryImage.create({
      data: {
        imageUrl,
        storageKey: key,
        title,
        alt,
      },
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/galerie]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
