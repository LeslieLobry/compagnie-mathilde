// app/api/admin/agenda/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const items = await prisma.agendaItem.findMany({
      orderBy: [
        { order: "asc" },
        { id: "asc" },
      ],
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("Erreur GET /api/admin/agenda :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req) {
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

    const item = await prisma.agendaItem.create({
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

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("Erreur POST /api/admin/agenda :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
