// app/api/admin/spectacles/[id]/photos/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

// POST : ajout photo
export async function POST(req, { params }) {
  const spectacleId = Number(params.id);
  if (!spectacleId) {
    return NextResponse.json(
      { error: "ID spectacle invalide" },
      { status: 400 }
    );
  }

  const formData = await req.formData();
  const legend = formData.get("legend") || "";
  const orderRaw = formData.get("order");
  const file = formData.get("image");

  if (!file || typeof file !== "object") {
    return NextResponse.json(
      { error: "Image obligatoire" },
      { status: 400 }
    );
  }

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

  const safeName = (file.name || "photo.jpg").replace(/\s+/g, "-");
  const fileName = `sp-${spectacleId}-${Date.now()}-${safeName}`;
  const fullPath = path.join(uploadDir, fileName);

  await fs.writeFile(fullPath, buffer);

  const imagePath = `/uploads/spectacles/${spectacleId}/${fileName}`;
  const order = Number(orderRaw || 0) || 0;

  const photo = await prisma.spectaclePhoto.create({
    data: {
      spectacleId,
      legend,
      order,
      imagePath,
    },
  });

  return NextResponse.json(photo, { status: 201 });
}
