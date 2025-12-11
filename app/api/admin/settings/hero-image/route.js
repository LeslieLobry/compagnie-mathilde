// app/api/admin/settings/hero-image/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadToS3, deleteFromS3 } from "@/lib/s3";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Aucun fichier envoyé" },
        { status: 400 }
      );
    }

    // on récupère les settings actuels
    const existing = await prisma.siteSettings.findUnique({
      where: { id: 1 },
    });

    // upload sur S3
    const { key, url } = await uploadToS3({
      file,
      folder: "hero",
    });

    // si une image existait déjà, on la supprime
    if (existing?.heroImageKey) {
      await deleteFromS3(existing.heroImageKey);
    }

    const updated = await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: {
        heroImage: url,
        heroImageKey: key,
      },
      create: {
        id: 1,
        heroTitle: existing?.heroTitle || "Titre par défaut",
        heroSubtitle: existing?.heroSubtitle || "",
        heroText: existing?.heroText || "",
        heroImage: url,
        heroImageKey: key,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("[POST /api/admin/settings/hero-image]", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'image hero" },
      { status: 500 }
    );
  }
}
