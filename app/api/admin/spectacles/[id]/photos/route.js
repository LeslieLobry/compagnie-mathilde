// app/api/admin/spectacles/[id]/photos/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  try {
    // ✅ Next 15 : params est une Promise
    const { id } = await params;
    const spectacleId = Number(id);

    if (Number.isNaN(spectacleId)) {
      return NextResponse.json(
        { error: "ID de spectacle invalide" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const image = formData.get("image"); // ⬅️ on aligne avec le front
    const legend = formData.get("legend") || "";
    const orderRaw = formData.get("order");
    const order =
      orderRaw !== null && orderRaw !== undefined && orderRaw !== ""
        ? Number(orderRaw)
        : null;

    if (!image || typeof image === "string") {
      return NextResponse.json(
        { error: "Fichier image manquant" },
        { status: 400 }
      );
    }

    // -------- Sauvegarde locale dans /public/uploads/spectacles/<id>/ --------
    const buffer = Buffer.from(await image.arrayBuffer());

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "spectacles",
      String(spectacleId)
    );
    await fs.mkdir(uploadDir, { recursive: true });

    const safeName = image.name.replace(/\s+/g, "-");
    const filename = `${Date.now()}-${safeName}`;
    const fullPath = path.join(uploadDir, filename);

    await fs.writeFile(fullPath, buffer);

    const publicPath = `/uploads/spectacles/${spectacleId}/${filename}`;

    // -------- Calcul de l'ordre --------
    let finalOrder = 0;
    if (order !== null && !Number.isNaN(order)) {
      finalOrder = order;
    } else {
      const maxOrder = await prisma.spectaclePhoto.aggregate({
        where: { spectacleId },
        _max: { order: true },
      });
      finalOrder = (maxOrder._max.order || 0) + 1;
    }

    const photo = await prisma.spectaclePhoto.create({
      data: {
        spectacleId,
        imagePath: publicPath,
        legend,
        order: finalOrder,
        storageKey: null, // si tu passes à S3 plus tard
      },
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/spectacles/[id]/photos]", error);
    return NextResponse.json(
      { error: "Erreur interne lors de l'upload" },
      { status: 500 }
    );
  }
}
