// app/api/admin/spectacles/[id]/dossier/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(req, { params }) {
  try {
    const spectacleId = Number(params.id);
    if (!spectacleId) {
      return NextResponse.json(
        { error: "ID spectacle invalide" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("dossier");

    if (!file || typeof file !== "object" || !file.name) {
      return NextResponse.json(
        { error: "Fichier PDF obligatoire" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "dossiers"
    );
    await fs.mkdir(uploadDir, { recursive: true });

    const safeName = file.name.replace(/\s+/g, "-");
    const fileName = `spectacle-${spectacleId}-${Date.now()}-${safeName}`;
    const fullPath = path.join(uploadDir, fileName);

    await fs.writeFile(fullPath, buffer);

    const dossierPath = `/uploads/dossiers/${fileName}`;

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
