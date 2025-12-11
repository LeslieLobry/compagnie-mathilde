// app/api/admin/presse/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  const items = await prisma.pressItem.findMany({
    orderBy: [
      { order: "asc" },
      { date: "desc" },
      { id: "desc" },
    ],
  });

  return NextResponse.json(items);
}

export async function POST(req) {
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

  const item = await prisma.pressItem.create({
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

  return NextResponse.json(item, { status: 201 });
}
