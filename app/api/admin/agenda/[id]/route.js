// app/api/admin/agenda/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

// PUT
export async function PUT(req, context) {
  const { params } = context;
  const { id } = await params;
  const numericId = Number(id);

  if (!numericId) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const {
      period,
      title,
      location,
      description,
      order,
      link,
      imageUrl,
    } = body;

    if (!period || !title) {
      return NextResponse.json(
        { error: "Période et titre sont obligatoires" },
        { status: 400 }
      );
    }

    const item = await prisma.agendaItem.update({
      where: { id: numericId },
      data: {
        period: period.trim(),
        title: title.trim(),
        location: location || "",
        description: description || "",
        order: typeof order === "number" ? order : 0,
        link: link?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Erreur PUT /api/admin/agenda/[id] :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE
export async function DELETE(req, context) {
  const { params } = context;
  const { id } = await params;
  const numericId = Number(id);

  if (!numericId) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  try {
    await prisma.agendaItem.delete({
      where: { id: numericId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE /api/admin/agenda/[id] :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
