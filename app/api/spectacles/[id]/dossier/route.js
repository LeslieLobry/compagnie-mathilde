import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { s3 } from "@/lib/s3";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = process.env.AWS_S3_BUCKET;

function filenameFromKey(key = "") {
  const last = key.split("/").pop() || "dossier.pdf";
  const cleaned = last.replace(/^\d+-[0-9a-f-]+-/, "");
  return cleaned.toLowerCase().endsWith(".pdf") ? cleaned : `${cleaned}.pdf`;
}

export async function GET(req, ctx) {
  try {
    if (!BUCKET) {
      return NextResponse.json({ error: "AWS_S3_BUCKET manquant" }, { status: 500 });
    }

    const p =
      ctx?.params && typeof ctx.params?.then === "function"
        ? await ctx.params
        : ctx?.params;

    const spectacleId = Number(p?.id);
    if (!spectacleId || Number.isNaN(spectacleId)) {
      return NextResponse.json({ error: "ID spectacle invalide" }, { status: 400 });
    }

    const spectacle = await prisma.spectacle.findUnique({
      where: { id: spectacleId },
      select: { dossierKey: true },
    });

    if (!spectacle?.dossierKey) {
      return NextResponse.json({ error: "Aucun dossier" }, { status: 404 });
    }

    const obj = await s3.send(
      new GetObjectCommand({
        Bucket: BUCKET,
        Key: spectacle.dossierKey,
      })
    );

    return new NextResponse(obj.Body, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filenameFromKey(spectacle.dossierKey)}"`,
        "Cache-Control": "private, max-age=0, must-revalidate",
      },
    });
  } catch (err) {
    console.error("Erreur GET dossier:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
