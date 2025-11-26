// app/api/admin/spectacles/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

// GET : liste
export async function GET() {
  const spectacles = await prisma.spectacle.findMany({
    orderBy: { id: "asc" },
  });
  return NextResponse.json(spectacles);
}

// POST : création
export async function POST(req) {
  const body = await req.json();
  const { title, subtitle, description, texte, mes, distribution, autresInfos } =
    body;

  if (!title) {
    return NextResponse.json(
      { error: "Titre obligatoire" },
      { status: 400 }
    );
  }

  const spectacle = await prisma.spectacle.create({
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

  return NextResponse.json(spectacle, { status: 201 });
}
