// lib/s3.js
import { S3Client, PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import path from "path";

export const REGION = process.env.AWS_REGION;
export const BUCKET = process.env.AWS_S3_BUCKET;

// ✅ IMPORTANT : on exporte s3 pour pouvoir faire `import { s3 } from "@/lib/s3"`
export const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

function sanitizeFilename(name = "file") {
  const base = path.basename(name); // bloque ../
  return base
    .replace(/[^\w.\-()]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function uploadToS3({ file, folder = "uploads", filename }) {
  if (!BUCKET || !REGION) {
    throw new Error("AWS_S3_BUCKET ou AWS_REGION manquant");
  }

  if (!file || typeof file === "string") {
    throw new Error("Fichier invalide ou manquant");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const safeName = sanitizeFilename(filename || file.name || "file");
  const key = `${folder}/${Date.now()}-${randomUUID()}-${safeName}`;

  // ⚠️ IMPORTANT : pas d’ACL (bucket sans ACL)
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type || "application/octet-stream",
    })
  );

  const url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;
  return { key, url };
}

export async function deleteFromS3(key) {
  if (!key) return;
  if (!BUCKET) throw new Error("AWS_S3_BUCKET manquant");

  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}

// (optionnel) delete multiple (utile quand tu supprimes un spectacle entier)
export async function deleteManyFromS3(keys = []) {
  const cleaned = keys.filter(Boolean);
  if (!cleaned.length) return;
  if (!BUCKET) throw new Error("AWS_S3_BUCKET manquant");

  // max 1000 objets par call
  await s3.send(
    new DeleteObjectsCommand({
      Bucket: BUCKET,
      Delete: { Objects: cleaned.map((Key) => ({ Key })) },
    })
  );
}
