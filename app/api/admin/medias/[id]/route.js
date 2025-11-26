// app/api/admin/medias/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

export async function PUT(req, { params }) {
  const id = Number(params.id);
  if (!id) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  const formData = await req.formData();
  const title = formData.get("title") || "";
  const legend = formData.get("legend") || "";
  const orderRaw = formData.get("order");
  const file = formData.get("image");

  const existing = await prisma.mediaItem.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  let imagePath = existing.imagePath;

  // Si un nouveau fichier est fourni, on le remplace
  if (file && typeof file === "object" && file.name) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads", "medias");
    await fs.mkdir(uploadDir, { recursive: true });

    const safeName = file.name.replace(/\s+/g, "-");
    const fileName = `media-${Date.now()}-${safeName}`;
    const fullPath = path.join(uploadDir, fileName);

    await fs.writeFile(fullPath, buffer);
    imagePath = `/uploads/medias/${fileName}`;
  }

  const order = Number(orderRaw || 0) || 0;

  const item = await prisma.mediaItem.update({
    where: { id },
    data: {
      title: title || "",
      legend: legend || "",
      order,
      imagePath,
    },
  });

  return NextResponse.json(item);
}

export async function DELETE(req, { params }) {
  const id = Number(params.id);
  if (!id) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  // Optionnel : on pourrait aussi supprimer le fichier physique
  await prisma.mediaItem.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
