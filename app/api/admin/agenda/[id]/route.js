// app/api/admin/agenda/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

function getId(req, params) {
  // 1) essai via params
  if (params?.id != null) {
    const idFromParams = Number(params.id);
    if (!Number.isNaN(idFromParams) && idFromParams > 0) {
      return idFromParams;
    }
  }

  // 2) fallback : on découpe l'URL /api/admin/agenda/1
  const url = new URL(req.url);
  const segments = url.pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1]; // "1" normalement
  const idFromPath = Number(last);

  if (!Number.isNaN(idFromPath) && idFromPath > 0) {
    return idFromPath;
  }

  return null;
}

export async function PUT(req, { params }) {
  console.log("[PUT agenda] URL    =", req.url);
  console.log("[PUT agenda] params =", params);

  const id = getId(req, params);
  console.log("[PUT agenda] id résolu =", id);

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

  try {
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
  } catch (err) {
    console.error("[PUT agenda] erreur Prisma", err);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  console.log("[DELETE agenda] URL    =", req.url);
  console.log("[DELETE agenda] params =", params);

  const id = getId(req, params);
  console.log("[DELETE agenda] id résolu =", id);

  if (!id) {
    return NextResponse.json({ error: "ID invalide" }, { status: 400 });
  }

  try {
    await prisma.agendaItem.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE agenda] erreur Prisma", err);

    if (err.code === "P2025") {
      return NextResponse.json(
        { error: "Élément introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
