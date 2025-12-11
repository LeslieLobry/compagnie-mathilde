import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { deleteFromS3, uploadToS3 } from "@/lib/s3";

export const runtime = "nodejs";

/**
 * PUT /api/admin/medias/[id]
 * Met à jour un média (titre, légende, ordre, image optionnelle)
 */
export async function PUT(req, { params }) {
  try {
    const id = Number(params.id);
    if (!id) {
      return NextResponse.json(
        { error: "ID invalide" },
        { status: 400 }
      );
    }

    const existing = await prisma.mediaItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Média introuvable" },
        { status: 404 }
      );
    }

    const formData = await req.formData();
    const title = formData.get("title") || "";
    const legend = formData.get("legend") || "";
    const orderRaw = formData.get("order");
    const order = orderRaw ? Number(orderRaw) : existing.order ?? 0;

    // Même clé que dans le formulaire : "image"
    const file = formData.get("image");

    const dataToUpdate = {
      title: title || null,
      legend: legend || null,
      order: Number.isNaN(order) ? 0 : order,
    };

    // Si une nouvelle image a été envoyée, on remplace
    if (file && typeof file !== "string") {
      const { key, url } = await uploadToS3({
        file,
        folder: "medias",
      });

      // On supprime l’ancienne du bucket si elle existe
      if (existing.storageKey) {
        await deleteFromS3(existing.storageKey);
      }

      dataToUpdate.imagePath = url;
      dataToUpdate.storageKey = key;
    }

    const updated = await prisma.mediaItem.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("[PUT /api/admin/medias/[id]]", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du média" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/medias/[id]
 * Supprime un média + le fichier S3
 */
export async function DELETE(req, { params }) {
  try {
    const id = Number(params.id);
    if (!id) {
      return NextResponse.json(
        { error: "ID invalide" },
        { status: 400 }
      );
    }

    const item = await prisma.mediaItem.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Média introuvable" },
        { status: 404 }
      );
    }

    if (item.storageKey) {
      await deleteFromS3(item.storageKey);
    }

    await prisma.mediaItem.delete({ where: { id } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[DELETE /api/admin/medias/[id]]", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
