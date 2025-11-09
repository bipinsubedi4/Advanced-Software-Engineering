import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { prisma } from "./prisma";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { VerificationStatus } from "@prisma/client";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const s3Bucket = process.env.AWS_S3_BUCKET;
const s3Region = process.env.AWS_REGION;
const s3Configured = s3Bucket && s3Region && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;

const s3Client = s3Configured
  ? new S3Client({
      region: s3Region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  : null;

const uploadSchema = z.object({
  cleanerId: z.coerce.number(),
});

router.post("/cleaners/upload-verification", upload.single("document"), async (req, res) => {
  try {
    const payload = uploadSchema.parse(req.body);

    if (!req.file) {
      return res.status(400).json({ error: "Missing document file" });
    }

    const providerProfile = await prisma.providerProfile.findUnique({
      where: { userId: payload.cleanerId },
    });

    if (!providerProfile) {
      return res.status(404).json({ error: "Provider profile not found" });
    }

    let documentUrl = `local://${req.file.originalname}`;

    if (s3Client && s3Bucket) {
      const objectKey = `verification/${payload.cleanerId}/${Date.now()}-${req.file.originalname}`;
      await s3Client.send(
        new PutObjectCommand({
          Bucket: s3Bucket,
          Key: objectKey,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        })
      );
      documentUrl = `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${objectKey}`;
    } else {
      console.warn("S3 is not configured; storing placeholder verification URL");
    }

    await prisma.providerProfile.update({
      where: { id: providerProfile.id },
      data: {
        verificationDocumentUrl: documentUrl,
        verificationStatus: VerificationStatus.PENDING_REVIEW,
        verificationSubmittedAt: new Date(),
      },
    });

    res.json({ success: true, documentUrl });
  } catch (error) {
    console.error("Verification upload failed", error);
    res.status(400).json({ error: "Failed to upload verification document" });
  }
});

export default router;
