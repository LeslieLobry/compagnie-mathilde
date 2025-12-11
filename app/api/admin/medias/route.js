// app/api/admin/medias/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadToS3 } from "@/lib/s3";

export const runtime = "nodejs";

export async function GET() {
  try {
    const items = await prisma.mediaItem.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error("[GET /api/admin/medias]", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des médias" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("image");
    const title = formData.get("title") || "";
    const legend = formData.get("legend") || "";
    const orderRaw = formData.get("order");
    const order = orderRaw ? Number(orderRaw) : 0;

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { error: "Aucun fichier envoyé" },
        { status: 400 }
      );
    }

    const { key, url } = await uploadToS3({
      file,
      folder: "medias",
    });

    const item = await prisma.mediaItem.create({
      data: {
        title: title || null,
        legend: legend || null,
        imagePath: url,
        storageKey: key,
        order,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/medias]", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload du média" },
      { status: 500 }
    );
  }
}
