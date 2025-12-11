// app/api/admin/spectacles/[id]/photos/[photoId]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";
import { deleteFromS3 } from "@/lib/s3"; // si tu ne l'utilises pas ici, tu peux enlever

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// --------- PUT : mise à jour légende / ordre / image ---------
export async function PUT(req, { params }) {
  try {
    const { id, photoId } = await params;
    const spectacleId = Number(id);
    const photoIdNum = Number(photoId);

    if (Number.isNaN(spectacleId) || Number.isNaN(photoIdNum)) {
      return NextResponse.json(
        { error: "ID invalide" },
        { status: 400 }
      );
    }

    const existing = await prisma.spectaclePhoto.findFirst({
      where: { id: photoIdNum, spectacleId },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Photo introuvable" },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const image = formData.get("image"); // peut être null si on ne change pas l'image
    const legend = formData.get("legend") ?? existing.legend ?? "";
    const orderRaw = formData.get("order");
    const order =
      orderRaw !== null && orderRaw !== undefined && orderRaw !== ""
        ? Number(orderRaw)
        : existing.order;

    let imagePath = existing.imagePath;

    if (image && typeof image !== "string") {
      // nouvelle image → on la remplace
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

      imagePath = `/uploads/spectacles/${spectacleId}/${filename}`;
      // si tu avais un ancien fichier local, tu pourrais le supprimer ici
    }

    const updated = await prisma.spectaclePhoto.update({
      where: { id: photoIdNum },
      data: {
        legend,
        order,
        imagePath,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error(
      "[PUT /api/admin/spectacles/[id]/photos/[photoId]]",
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la photo" },
      { status: 500 }
    );
  }
}

// --------- DELETE : suppression d'une photo ---------
export async function DELETE(req, { params }) {
  try {
    const { id, photoId } = await params;
    const spectacleId = Number(id);
    const photoIdNum = Number(photoId);

    if (Number.isNaN(photoIdNum) || Number.isNaN(spectacleId)) {
      return NextResponse.json(
        { error: "ID de photo ou de spectacle invalide" },
        { status: 400 }
      );
    }

    const photo = await prisma.spectaclePhoto.findFirst({
      where: { id: photoIdNum, spectacleId },
    });

    if (!photo) {
      return NextResponse.json(
        { error: "Photo introuvable" },
        { status: 404 }
      );
    }

    // Si un jour tu utilises S3, tu auras storageKey ici
    if (photo.storageKey) {
      await deleteFromS3(photo.storageKey);
    }

    await prisma.spectaclePhoto.delete({ where: { id: photoIdNum } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(
      "[DELETE /api/admin/spectacles/[id]/photos/[photoId]]",
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la photo" },
      { status: 500 }
    );
  }
}
