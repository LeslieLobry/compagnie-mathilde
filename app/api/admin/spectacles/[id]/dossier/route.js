// app/api/admin/spectacles/[id]/dossier/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sanitizeFilename(name = "") {
  const base = path.basename(name); // bloque ../
  return base
    .replace(/[^\w.\-()]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req, ctx) {
  try {
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

    // ✅ accepte plusieurs noms de champ (au cas où)
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

    const uploadDir = path.join(process.cwd(), "public", "uploads", "dossiers");
    await fs.mkdir(uploadDir, { recursive: true });

    const finalName = `spectacle-${spectacleId}-${Date.now()}-${filename}`;
    const fullPath = path.join(uploadDir, finalName);

    await fs.writeFile(fullPath, buffer);

    const dossierPath = `/uploads/dossiers/${finalName}`;

    const spectacle = await prisma.spectacle.update({
      where: { id: spectacleId },
      data: { dossierPath },
    });

    return NextResponse.json({ ok: true, spectacle });
  } catch (err) {
    console.error("Erreur upload dossier spectacle:", err);
    return NextResponse.json(
      { error: "Erreur serveur", details: String(err) },
      { status: 500 }
    );
  }
}
