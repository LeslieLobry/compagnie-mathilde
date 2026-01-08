// app/api/admin/presse/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getIdFromContextOrUrl(req, ctx) {
  // 1) via params (normal)
  const raw = ctx?.params?.id;

  const id1 = Array.isArray(raw) ? raw[0] : raw;
  const parsed1 = parseInt(String(id1 ?? ""), 10);
  if (Number.isFinite(parsed1) && parsed1 > 0) return parsed1;

  // 2) fallback via URL (ultra fiable)
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1]; // .../presse/123
    const parsed2 = parseInt(String(last ?? ""), 10);
    if (Number.isFinite(parsed2) && parsed2 > 0) return parsed2;
  } catch {}

  return null;
}

export async function PUT(req, ctx) {
  try {
    const id = getIdFromContextOrUrl(req, ctx);
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
      if (!Number.isNaN(d.getTime())) parsedDate = d;
    }

    const item = await prisma.pressItem.update({
      where: { id },
      data: {
        title: title.trim(),
        mediaName: mediaName.trim(),
        url: url ? String(url).trim() : null,
        quote: quote ? String(quote).trim() : null,
        imageUrl: imageUrl ? String(imageUrl).trim() : null,
        date: parsedDate,
        order: typeof order === "number" ? order : 0,
      },
    });

    return NextResponse.json(item);
  } catch (e) {
    console.error("[PUT /api/admin/presse/[id]]", e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req, ctx) {
  try {
    const id = getIdFromContextOrUrl(req, ctx);
    if (!id) {
      return NextResponse.json({ error: "ID invalide" }, { status: 400 });
    }

    await prisma.pressItem.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[DELETE /api/admin/presse/[id]]", e);

    // Optionnel : si l’item n’existe pas
    if (String(e?.code || "").includes("P2025")) {
      return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    }

    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
