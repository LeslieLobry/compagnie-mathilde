// app/api/admin/spectacles/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function PUT(req, { params }) {
  const id = Number(params.id);
  if (!id) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  const body = await req.json();
  const { title, subtitle, description, texte, mes, distribution, autresInfos } =
    body;

  if (!title) {
    return NextResponse.json(
      { error: "Titre obligatoire" },
      { status: 400 }
    );
  }

  const spectacle = await prisma.spectacle.update({
    where: { id },
    data: {
      title,
      subtitle: subtitle || null,
      description: description || null,
      texte: texte || null,
      mes: mes || null,
      distribution: distribution || null,
      autresInfos: autresInfos || null,
    },
  });

  return NextResponse.json(spectacle);
}

export async function DELETE(req, { params }) {
  const id = Number(params.id);
  if (!id) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  await prisma.spectacle.delete({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
