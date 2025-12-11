// lib/s3.js
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET;

export async function uploadToS3({ file, folder = "uploads" }) {
  if (!file || typeof file === "string") {
    throw new Error("Fichier invalide ou manquant");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const originalName = file.name || "file";
  const ext = originalName.includes(".")
    ? originalName.split(".").pop()
    : "bin";

  const key = `${folder}/${randomUUID()}.${ext}`;

  // ⚠️ IMPORTANT : on enlève ACL car le bucket ne supporte pas les ACL
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type || "application/octet-stream",

    })
  );

  const url = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return { key, url };
}

export async function deleteFromS3(key) {
  if (!key) return;

  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}
