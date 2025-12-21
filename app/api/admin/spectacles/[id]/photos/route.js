// app/api/admin/spectacles/[id]/photos/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { s3 } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = process.env.AWS_S3_BUCKET;
const REGION = process.env.AWS_REGION;

function sanitizeFilename(name = "") {
  const base = path.basename(name); // empêche ../
  return base
    .replace(/[^\w.\-()]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req, ctx) {
  try {
    if (!BUCKET || !REGION) {
      return NextResponse.json(
        { error: "AWS_S3_BUCKET ou AWS_REGION manquant (Vercel env vars)" },
        { status: 500 }
      );
    }

    // ✅ Next 15 : params peut être une Promise
    const p =
      ctx?.params && typeof ctx.params?.then === "function"
        ? await ctx.params
        : ctx?.params;

    const spectacleId = Number(p?.id);
    if (!spectacleId || Number.isNaN(spectacleId)) {
      return NextResponse.json(
        { error: "ID de spectacle invalide" },
        { status: 400 }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        {
          error: "Cette route attend un FormData (multipart/form-data).",
          receivedContentType: contentType,
        },
        { status: 400 }
      );
    }

    const formData = await req.formData();

    // ⬅️ aligné avec ton front
    const image = formData.get("image");
    const legend = (formData.get("legend") || "").toString();

    const orderRaw = formData.get("order");
    const order =
      orderRaw !== null && orderRaw !== undefined && orderRaw !== ""
        ? Number(orderRaw)
        : null;

    if (!image || typeof image === "string" || !image.name) {
      return NextResponse.json(
        { error: "Fichier image manquant (champ 'image')." },
        { status: 400 }
      );
    }

    // ✅ Vérif mime (simple)
    const mime = image.type || "";
    if (!mime.startsWith("image/")) {
      return NextResponse.json(
        { error: "Le fichier doit être une image.", receivedType: mime },
        { status: 400 }
      );
    }

    // ✅ Taille max (évite crash serverless) — ajuste si besoin
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const max = 8 * 1024 * 1024; // 8 MB
    if (buffer.length > max) {
      return NextResponse.json(
        { error: "Image trop lourde (max 8MB)." },
        { status: 400 }
      );
    }

    // ✅ Calcul de l'ordre (comme ta version)
    let finalOrder = 0;
    if (order !== null && !Number.isNaN(order)) {
      finalOrder = order;
    } else {
      const maxOrder = await prisma.spectaclePhoto.aggregate({
        where: { spectacleId },
        _max: { order: true },
      });
      finalOrder = (maxOrder._max.order || 0) + 1;
    }

    // ✅ Upload S3
    const safeName = sanitizeFilename(image.name);
    const key = `spectacles/${spectacleId}/photos/${Date.now()}-${crypto.randomUUID()}-${safeName}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: mime,
      })
    );

    // ✅ URL publique S3 (si ton bucket/prefix est lisible en public)
    const imagePath = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;

    const photo = await prisma.spectaclePhoto.create({
      data: {
        spectacleId,
        imagePath,
        legend,
        order: finalOrder,
        storageKey: key, // ✅ important pour delete plus tard
      },
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/spectacles/[id]/photos]", error);
    return NextResponse.json(
      { error: "Erreur interne lors de l'upload", details: String(error) },
      { status: 500 }
    );
  }
}
