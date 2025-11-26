// app/api/admin/agenda/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

// GET (optionnel, pour recharger côté client)
export async function GET() {
  const items = await prisma.agendaItem.findMany({
    orderBy: { order: "asc" },
  });
  return NextResponse.json(items);
}

// POST : création
export async function POST(req) {
  const body = await req.json();
  const { period, title, location, description, order } = body;

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
    },
  });

  return NextResponse.json(item, { status: 201 });
}
