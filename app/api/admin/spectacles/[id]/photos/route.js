// app/api/admin/spectacles/[spectacleId]/photos/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadToS3 } from "@/lib/s3";

export const runtime = "nodejs";

export async function GET(req, { params }) {
  try {
    const spectacleId = Number(params.spectacleId);
    if (!spectacleId) {
      return NextResponse.json(
        { error: "ID de spectacle invalide" },
        { status: 400 }
      );
    }

    const photos = await prisma.spectaclePhoto.findMany({
      where: { spectacleId },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(photos, { status: 200 });
  } catch (error) {
    console.error("[GET /api/admin/spectacles/[spectacleId]/photos]", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des photos" },
      { status: 500 }
    );
  }
}

export async function POST(req, { params }) {
  try {
    const spectacleId = Number(params.spectacleId);
    if (!spectacleId) {
      return NextResponse.json(
        { error: "ID de spectacle invalide" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
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
      folder: `spectacles/${spectacleId}`,
    });

    const photo = await prisma.spectaclePhoto.create({
      data: {
        spectacleId,
        imagePath: url,
        storageKey: key,
        legend: legend || null,
        order,
      },
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/spectacles/[spectacleId]/photos]", error);
    return NextResponse.json(
      { error: "Erreur lors de l'upload de la photo" },
      { status: 500 }
    );
  }
}
