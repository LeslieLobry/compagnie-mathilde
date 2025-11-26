// app/api/admin/medias/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

// GET : liste (optionnel)
export async function GET() {
  const items = await prisma.mediaItem.findMany({
    orderBy: { order: "asc" },
  });
  return NextResponse.json(items);
}

// POST : création
export async function POST(req) {
  const formData = await req.formData();
  const title = formData.get("title") || "";
  const legend = formData.get("legend") || "";
  const orderRaw = formData.get("order");
  const file = formData.get("image");

  if (!file || typeof file !== "object" || !file.name) {
    return NextResponse.json(
      { error: "Image obligatoire" },
      { status: 400 }
    );
  }

  // Enregistrement du fichier dans /public/uploads/medias
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public", "uploads", "medias");
  await fs.mkdir(uploadDir, { recursive: true });

  const safeName = file.name.replace(/\s+/g, "-");
  const fileName = `media-${Date.now()}-${safeName}`;
  const fullPath = path.join(uploadDir, fileName);

  await fs.writeFile(fullPath, buffer);

  const imagePath = `/uploads/medias/${fileName}`;
  const order = Number(orderRaw || 0) || 0;

  const item = await prisma.mediaItem.create({
    data: {
      title: title || "",
      legend: legend || "",
      order,
      imagePath,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
