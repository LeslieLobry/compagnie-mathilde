// app/api/admin/settings/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { uploadToS3 } from "@/lib/s3";

export const runtime = "nodejs";

// GET : récupérer les settings existants
export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 1 },
    });
    return NextResponse.json(settings || {}, { status: 200 });
  } catch (error) {
    console.error("[GET /api/admin/settings]", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des settings" },
      { status: 500 }
    );
  }
}

async function readPayloadAndMaybeUpload(req) {
  const contentType = req.headers.get("content-type") || "";

  let heroKicker = "";
  let heroTitle = "";
  let heroSubtitle = "";
  let heroText = "";
  let aboutText = "";
  let newHeroImageUrl = null;

  if (contentType.includes("multipart/form-data")) {
    // ✅ cas formulaire avec fichier (FormData)
    const formData = await req.formData();

    heroKicker = (formData.get("heroKicker") || "").toString();
    heroTitle = (formData.get("heroTitle") || "").toString();
    heroSubtitle = (formData.get("heroSubtitle") || "").toString();
    heroText = (formData.get("heroText") || "").toString();
    aboutText = (formData.get("aboutText") || "").toString();

    const file = formData.get("heroImage");
    if (file && typeof file !== "string") {
      const { url } = await uploadToS3({
        file,
        folder: "hero",
      });
      newHeroImageUrl = url;
    }
  } else if (contentType.includes("application/json")) {
    // ✅ cas JSON classique
    const body = await req.json();

    heroKicker = body.heroKicker ?? "";
    heroTitle = body.heroTitle ?? "";
    heroSubtitle = body.heroSubtitle ?? "";
    heroText = body.heroText ?? "";
    aboutText = body.aboutText ?? "";

    // si tu veux mettre heroImage via JSON un jour:
    if (body.heroImage) {
      newHeroImageUrl = body.heroImage;
    }
  } else {
    // ❌ autre type non supporté
    throw new Error(`Type de contenu non supporté : ${contentType}`);
  }

  return {
    heroKicker,
    heroTitle,
    heroSubtitle,
    heroText,
    aboutText,
    newHeroImageUrl,
  };
}

// PUT : mise à jour des textes (+ image si envoyée)
export async function PUT(req) {
  try {
    const {
      heroKicker,
      heroTitle,
      heroSubtitle,
      heroText,
      aboutText,
      newHeroImageUrl,
    } = await readPayloadAndMaybeUpload(req);

    const baseData = {
      heroKicker: heroKicker.trim() || null, // ✅ nullable
      heroTitle: heroTitle.toString(),
      heroSubtitle: heroSubtitle.toString(),
      heroText: heroText.toString(),
      aboutText: aboutText.trim() || null, // ✅ nullable
    };

    const updateData = newHeroImageUrl
      ? { ...baseData, heroImage: newHeroImageUrl }
      : baseData;

    const createData = {
      id: 1,
      ...baseData,
      heroImage: newHeroImageUrl || "",
    };

    const settings = await prisma.siteSettings.upsert({
      where: { id: 1 },
      update: updateData,
      create: createData,
    });

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error("[PUT /api/admin/settings]", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour des settings" },
      { status: 500 }
    );
  }
}

// POST : alias de PUT (ton formulaire utilise POST)
export async function POST(req) {
  return PUT(req);
}
