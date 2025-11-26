// app/api/admin/settings/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs"; // important pour pouvoir utiliser fs

export async function POST(req) {
  try {
    const formData = await req.formData();
    const heroTitle = formData.get("heroTitle") ?? "";
    const heroSubtitle = formData.get("heroSubtitle") ?? "";
    const heroText = formData.get("heroText") ?? "";
    const file = formData.get("heroImage");

    let heroImagePath;

    // Upload de la nouvelle image si un fichier est fourni
    if (file && typeof file === "object" && "arrayBuffer" in file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadDir, { recursive: true });

      const originalName = file.name ?? "hero.jpg";
      const safeName = originalName.replace(/\s+/g, "-");
      const fileName = `hero-${Date.now()}-${safeName}`;
      const fullPath = path.join(uploadDir, fileName);

      await fs.writeFile(fullPath, buffer);
      heroImagePath = `/uploads/${fileName}`;
    }

    // upsert = crée l'entrée si elle n'existe pas encore
    const settings = await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: {
        heroTitle,
        heroSubtitle,
        heroText,
        ...(heroImagePath ? { heroImage: heroImagePath } : {}),
      },
      create: {
        id: 1,
        heroTitle,
        heroSubtitle,
        heroText,
        heroImage: heroImagePath || "/hero-mathilde.jpg",
      },
    });

    return NextResponse.json({ ok: true, settings });
  } catch (err) {
    console.error("Erreur /api/admin/settings :", err);
    return NextResponse.json(
      { error: "Erreur serveur", details: String(err) },
      { status: 500 }
    );
  }
}
