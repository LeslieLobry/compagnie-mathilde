// app/api/admin/spectacles/[id]/photos/[photoId]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { s3 } from "@/lib/s3";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = process.env.AWS_S3_BUCKET;
const REGION = process.env.AWS_REGION;

function sanitizeFilename(name = "") {
  const base = path.basename(name); // bloque ../
  return base
    .replace(/[^\w.\-()]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function resolveParams(ctx) {
  const p = ctx?.params;
  return p && typeof p.then === "function" ? await p : p;
}

async function safeDeleteS3(key) {
  if (!key || !BUCKET) return;
  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key,
      })
    );
  } catch (e) {
    console.warn("Suppression S3 impossible:", key, e);
  }
}

// --------- PUT : mise à jour légende / ordre / image ---------
export async function PUT(req, ctx) {
  try {
    if (!BUCKET || !REGION) {
      return NextResponse.json(
        { error: "AWS_S3_BUCKET ou AWS_REGION manquant (Vercel env vars)" },
        { status: 500 }
      );
    }

    const params = await resolveParams(ctx);
    const spectacleId = Number(params?.id);
    const photoIdNum = Number(params?.photoId);

    if (!spectacleId || Number.isNaN(spectacleId) || !photoIdNum || Number.isNaN(photoIdNum)) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    const existing = await prisma.spectaclePhoto.findFirst({
      where: { id: photoIdNum, spectacleId },
    });

    if (!existing) {
      return NextResponse.json({ error: "Photo introuvable" }, { status: 404 });
    }

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "FormData (multipart/form-data) requis", receivedContentType: contentType },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const image = formData.get("image"); // peut être null si on ne change pas l'image

    const legend = (formData.get("legend") ?? existing.legend ?? "").toString();

    const orderRaw = formData.get("order");
    const order =
      orderRaw !== null && orderRaw !== undefined && orderRaw !== ""
        ? Number(orderRaw)
        : existing.order;

    let imagePath = existing.imagePath;
    let storageKey = existing.storageKey;

    // ✅ Remplacement image (S3)
    if (image && typeof image !== "string" && image.name) {
      const mime = image.type || "";
      if (!mime.startsWith("image/")) {
        return NextResponse.json(
          { error: "Le fichier doit être une image.", receivedType: mime },
          { status: 400 }
        );
      }

      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // ✅ limite taille (évite crash)
      const max = 8 * 1024 * 1024; // 8MB
      if (buffer.length > max) {
        return NextResponse.json(
          { error: "Image trop lourde (max 8MB)." },
          { status: 400 }
        );
      }

      const safeName = sanitizeFilename(image.name);
      const newKey = `spectacles/${spectacleId}/photos/${Date.now()}-${crypto.randomUUID()}-${safeName}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: newKey,
          Body: buffer,
          ContentType: mime,
        })
      );

      // ✅ URL publique (si tes objets sont lisibles en public)
      const newUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${newKey}`;

      // On met à jour les champs
      imagePath = newUrl;
      storageKey = newKey;

      // ✅ supprime l’ancienne image S3 après succès
      if (existing.storageKey && existing.storageKey !== newKey) {
        await safeDeleteS3(existing.storageKey);
      }
    }

    const updated = await prisma.spectaclePhoto.update({
      where: { id: photoIdNum },
      data: {
        legend,
        order: Number.isNaN(order) ? existing.order : order,
        imagePath,
        storageKey, // ✅ important
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("[PUT /api/admin/spectacles/[id]/photos/[photoId]]", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la photo", details: String(error) },
      { status: 500 }
    );
  }
}

// --------- DELETE : suppression d'une photo ---------
export async function DELETE(req, ctx) {
  try {
    const params = await resolveParams(ctx);
    const spectacleId = Number(params?.id);
    const photoIdNum = Number(params?.photoId);

    if (!spectacleId || Number.isNaN(spectacleId) || !photoIdNum || Number.isNaN(photoIdNum)) {
      return NextResponse.json(
        { error: "ID de photo ou de spectacle invalide" },
        { status: 400 }
      );
    }

    const photo = await prisma.spectaclePhoto.findFirst({
      where: { id: photoIdNum, spectacleId },
    });

    if (!photo) {
      return NextResponse.json({ error: "Photo introuvable" }, { status: 404 });
    }

    // ✅ supprime S3 d'abord (ou après, comme tu veux)
    if (photo.storageKey) {
      await safeDeleteS3(photo.storageKey);
    }

    await prisma.spectaclePhoto.delete({ where: { id: photoIdNum } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[DELETE /api/admin/spectacles/[id]/photos/[photoId]]", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la photo", details: String(error) },
      { status: 500 }
    );
  }
}
