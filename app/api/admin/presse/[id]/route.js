// app/api/admin/presse/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function PUT(req, { params }) {
  const id = Number(params.id);
  if (!id) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  const body = await req.json();
  const { title, mediaName, url, quote, imageUrl, date, order } = body;

  if (!title || !mediaName) {
    return NextResponse.json(
      { error: "Titre et nom du média sont obligatoires." },
      { status: 400 }
    );
  }

  let parsedDate = null;
  if (date) {
    const d = new Date(date);
    if (!Number.isNaN(d.getTime())) {
      parsedDate = d;
    }
  }

  const item = await prisma.pressItem.update({
    where: { id },
    data: {
      title: title.trim(),
      mediaName: mediaName.trim(),
      url: url || null,
      quote: quote || null,
      imageUrl: imageUrl || null,
      date: parsedDate,
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

  await prisma.pressItem.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
