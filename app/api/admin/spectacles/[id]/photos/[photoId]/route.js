// app/api/admin/spectacles/photos/[photoId]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { deleteFromS3 } from "@/lib/s3";

export const runtime = "nodejs";

export async function DELETE(req, { params }) {
  try {
    const photoId = Number(params.photoId);
    if (!photoId) {
      return NextResponse.json(
        { error: "ID de photo invalide" },
        { status: 400 }
      );
    }

    const photo = await prisma.spectaclePhoto.findUnique({
      where: { id: photoId },
    });

    if (!photo) {
      return NextResponse.json(
        { error: "Photo introuvable" },
        { status: 404 }
      );
    }

    if (photo.storageKey) {
      await deleteFromS3(photo.storageKey);
    }

    await prisma.spectaclePhoto.delete({ where: { id: photoId } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[DELETE /api/admin/spectacles/photos/[photoId]]", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la photo" },
      { status: 500 }
    );
  }
}
