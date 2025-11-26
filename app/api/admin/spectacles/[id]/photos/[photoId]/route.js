// app/api/admin/spectacles/[id]/photos/[photoId]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

export async function PUT(req, { params }) {
  const spectacleId = Number(params.id);
  const photoId = Number(params.photoId);

  if (!spectacleId || !photoId) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  const existing = await prisma.spectaclePhoto.findUnique({
    where: { id: photoId },
  });

  if (!existing) {
    return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  }

  const formData = await req.formData();
  const legend = formData.get("legend") || "";
  const orderRaw = formData.get("order");
  const file = formData.get("image");

  let imagePath = existing.imagePath;

  if (file && typeof file === "object" && file.name) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "spectacles",
      String(spectacleId)
    );
    await fs.mkdir(uploadDir, { recursive: true });

    const safeName = file.name.replace(/\s+/g, "-");
    const fileName = `sp-${spectacleId}-${Date.now()}-${safeName}`;
    const fullPath = path.join(uploadDir, fileName);

    await fs.writeFile(fullPath, buffer);
    imagePath = `/uploads/spectacles/${spectacleId}/${fileName}`;
  }

  const order = Number(orderRaw || 0) || 0;

  const photo = await prisma.spectaclePhoto.update({
    where: { id: photoId },
    data: {
      legend,
      order,
      imagePath,
    },
  });

  return NextResponse.json(photo);
}

export async function DELETE(req, { params }) {
  const photoId = Number(params.photoId);
  if (!photoId) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  await prisma.spectaclePhoto.delete({
    where: { id: photoId },
  });

  return NextResponse.json({ ok: true });
}
