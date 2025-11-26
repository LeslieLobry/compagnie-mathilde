// app/api/admin/spectacles/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

// Liste complète (optionnel pour rafraîchir côté client)
export async function GET() {
  const spectacles = await prisma.spectacle.findMany({
    orderBy: { id: "asc" },
  });
  return NextResponse.json(spectacles);
}

// Création
export async function POST(req) {
  const body = await req.json();
  const { title, subtitle, texte, mes, description } = body;

  if (!title || title.trim() === "") {
    return NextResponse.json(
      { error: "Titre obligatoire" },
      { status: 400 }
    );
  }

  const spectacle = await prisma.spectacle.create({
    data: {
      title: title.trim(),
      subtitle: subtitle || "",
      texte: texte || "",
      mes: mes || "",
      description: description || "",
    },
  });

  return NextResponse.json(spectacle, { status: 201 });
}
