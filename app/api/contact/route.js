// app/api/contact/route.js
import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);
const CONTACT_TO = process.env.CONTACT_RECIPIENT_EMAIL;
const CONTACT_FROM =
  process.env.CONTACT_FROM_EMAIL || "Compagnie MATHILDE <onboarding@resend.dev>";

export async function POST(req) {
  try {
    const body = await req.json();
    const { nom, email, message } = body || {};

    if (!nom || !email || !message) {
      return NextResponse.json(
        { error: "Merci de remplir tous les champs." },
        { status: 400 }
      );
    }

    if (!CONTACT_TO) {
      console.error("CONTACT_RECIPIENT_EMAIL manquant dans .env");
      return NextResponse.json(
        { error: "Configuration email incomplète." },
        { status: 500 }
      );
    }

    // Un peu de contexte utile
    const ip = req.headers.get("x-forwarded-for") || "inconnue";
    const userAgent = req.headers.get("user-agent") || "inconnu";

    const { error } = await resend.emails.send({
      from: CONTACT_FROM,
      to: [CONTACT_TO],
      reply_to: email,
      subject: `Nouveau message du site – ${nom}`,
      text: `
Nom : ${nom}
Email : ${email}

Message :
${message}

-------------------------
IP : ${ip}
User-Agent : ${userAgent}
      `.trim(),
    });

    if (error) {
      console.error("[Resend contact] erreur", error);
      return NextResponse.json(
        { error: "Erreur lors de l'envoi du message." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/contact]", err);
    return NextResponse.json(
      { error: "Erreur serveur lors de l'envoi du message." },
      { status: 500 }
    );
  }
}
