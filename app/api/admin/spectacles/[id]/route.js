// app/api/admin/spectacles/[id]/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // dans CE projet tu utilises bien un default

export const runtime = "nodejs";

function extraireId(req, params) {
  // 1) tentative via params
  if (params?.id) {
    const idFromParams = Number(params.id);
    if (!Number.isNaN(idFromParams) && idFromParams > 0) {
      return idFromParams;
    }
  }

  // 2) fallback : on découpe l’URL
  const url = new URL(req.url);
  const segments = url.pathname.split("/").filter(Boolean); // ["api","admin","spectacles","1"]
  const last = segments[segments.length - 1];
  const idFromPath = Number(last);

  if (!Number.isNaN(idFromPath) && idFromPath > 0) {
    return idFromPath;
  }

  return null;
}

export async function PUT(req, { params }) {
  try {
    const id = extraireId(req, params);
    if (!id) {
      return NextResponse.json(
        { error: "ID invalide" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      title,
      subtitle,
      description,
      texte,
      mes,
      distribution,
      autresInfos,
    } = body;

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
  } catch (err) {
    console.error("[PUT spectacle] error", err);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    console.log("[DELETE spectacle] URL     =", req.url);
    console.log("[DELETE spectacle] params  =", params);

    const id = extraireId(req, params);
    console.log("[DELETE spectacle] id résolu =", id);

    if (!id) {
      return NextResponse.json(
        { error: "ID invalide" },
        { status: 400 }
      );
    }

    const spectacle = await prisma.spectacle.delete({
      where: { id },
    });

    console.log("[DELETE spectacle] supprimé =", spectacle.id);

    return NextResponse.json({ ok: true, spectacle });
  } catch (err) {
    console.error("[DELETE spectacle] error", err);

    // ex : enregistrement non trouvé
    if (err.code === "P2025") {
      return NextResponse.json(
        { error: "Spectacle introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
