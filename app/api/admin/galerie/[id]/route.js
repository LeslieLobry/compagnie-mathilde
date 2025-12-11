// app/api/admin/galerie/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

export const runtime = "nodejs";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET;

export async function DELETE(request, context) {
  // ⬇️ ICI la différence : params est un Promise, on doit l'await
  const { params } = context;
  const { id: rawId } = await params; // <-- important

  const id = Number(rawId);
  if (!rawId || Number.isNaN(id)) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  try {
    const photo = await prisma.galleryImage.findUnique({ where: { id } });

    if (!photo) {
      return NextResponse.json(
        { error: "Photo introuvable" },
        { status: 404 },
      );
    }

    // On supprime sur S3 si on a une storageKey
    if (photo.storageKey) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: BUCKET,
            Key: photo.storageKey,
          }),
        );
      } catch (err) {
        console.error("[S3 delete galerie]", err);
        // on log, mais on ne bloque pas la suppression en base
      }
    }

    await prisma.galleryImage.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/admin/galerie/:id]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
