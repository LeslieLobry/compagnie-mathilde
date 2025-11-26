// app/api/admin/agenda/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function PUT(req, { params }) {
  const id = Number(params.id);
  if (!id) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  const body = await req.json();
  const { period, title, location, description, order } = body;

  if (!period || !title) {
    return NextResponse.json(
      { error: "Période et titre sont obligatoires" },
      { status: 400 }
    );
  }

  const item = await prisma.agendaItem.update({
    where: { id },
    data: {
      period: period.trim(),
      title: title.trim(),
      location: location || "",
      description: description || "",
      order: typeof order === "number" ? order : 0,
    },
  });

  return NextResponse.json(item);
}

export async function DELETE(req, { params }) {
  const id = Number(params.id);
  if (!id) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  await prisma.agendaItem.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
