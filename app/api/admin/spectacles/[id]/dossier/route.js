// app/api/admin/spectacles/[id]/dossier/route.js
import { NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";
import { s3 } from "../../../../../../lib/s3";
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

export async function POST(req, ctx) {
  try {
    if (!BUCKET || !REGION) {
      return NextResponse.json(
        { error: "AWS_S3_BUCKET ou AWS_REGION manquant (Vercel env vars)" },
        { status: 500 }
      );
    }

    // ✅ Next 15: params peut être une Promise
    const p =
      ctx?.params && typeof ctx.params?.then === "function"
        ? await ctx.params
        : ctx?.params;

    const spectacleId = Number(p?.id);
    if (!spectacleId || Number.isNaN(spectacleId)) {
      return NextResponse.json(
        { error: "ID spectacle invalide", receivedParams: p },
        { status: 400 }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        {
          error:
            "Upload attendu en multipart/form-data (FormData). Ne mets pas Content-Type à la main côté front.",
          receivedContentType: contentType,
        },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("dossier") || formData.get("file");

    if (!file || typeof file === "string" || !file.name) {
      return NextResponse.json(
        {
          error: "Fichier PDF obligatoire (champ 'dossier' ou 'file').",
          receivedKeys: Array.from(formData.keys()),
        },
        { status: 400 }
      );
    }

    const filename = sanitizeFilename(file.name);
    const mime = file.type || "";
    const isPdf =
      mime === "application/pdf" || filename.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return NextResponse.json(
        { error: "Le fichier doit être un PDF.", received: { filename, mime } },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ✅ limite taille (option) — ajuste
    const max = 15 * 1024 * 1024; // 15MB
    if (buffer.length > max) {
      return NextResponse.json(
        { error: "PDF trop lourd (max 15MB)." },
        { status: 400 }
      );
    }

    // Récupère l’ancienne clé pour pouvoir supprimer après remplacement
    const existing = await prisma.spectacle.findUnique({
      where: { id: spectacleId },
      select: { dossierKey: true },
    });

    // ✅ upload S3
    const key = `spectacles/${spectacleId}/dossier/${Date.now()}-${crypto.randomUUID()}-${filename}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: "application/pdf",
      })
    );

    // ✅ lien stable côté site (recommandé si bucket privé)
    const dossierPath = `/api/spectacles/${spectacleId}/dossier`;

    const spectacle = await prisma.spectacle.update({
      where: { id: spectacleId },
      data: { dossierKey: key, dossierPath },
    });

    // ✅ supprime l'ancien PDF si remplacement
    if (existing?.dossierKey && existing.dossierKey !== key) {
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: BUCKET,
            Key: existing.dossierKey,
          })
        );
      } catch (e) {
        console.warn("Suppression ancien dossier S3 impossible:", e);
      }
    }

    return NextResponse.json({ ok: true, spectacle });
  } catch (err) {
    console.error("Erreur upload dossier spectacle (S3):", err);
    return NextResponse.json(
      { error: "Erreur serveur", details: String(err) },
      { status: 500 }
    );
  }
}
