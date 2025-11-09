"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const zod_1 = require("zod");
const prisma_1 = require("./prisma");
const client_s3_1 = require("@aws-sdk/client-s3");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const s3Bucket = process.env.AWS_S3_BUCKET;
const s3Region = process.env.AWS_REGION;
const s3Configured = s3Bucket && s3Region && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;
const s3Client = s3Configured
    ? new client_s3_1.S3Client({
        region: s3Region,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    })
    : null;
const uploadSchema = zod_1.z.object({
    cleanerId: zod_1.z.coerce.number(),
});
router.post("/cleaners/upload-verification", upload.single("document"), async (req, res) => {
    try {
        const payload = uploadSchema.parse(req.body);
        if (!req.file) {
            return res.status(400).json({ error: "Missing document file" });
        }
        const providerProfile = await prisma_1.prisma.providerProfile.findUnique({
            where: { userId: payload.cleanerId },
        });
        if (!providerProfile) {
            return res.status(404).json({ error: "Provider profile not found" });
        }
        let documentUrl = `local://${req.file.originalname}`;
        if (s3Client && s3Bucket) {
            const objectKey = `verification/${payload.cleanerId}/${Date.now()}-${req.file.originalname}`;
            await s3Client.send(new client_s3_1.PutObjectCommand({
                Bucket: s3Bucket,
                Key: objectKey,
                Body: req.file.buffer,
                ContentType: req.file.mimetype,
            }));
            documentUrl = `https://${s3Bucket}.s3.${s3Region}.amazonaws.com/${objectKey}`;
        }
        else {
            console.warn("S3 is not configured; storing placeholder verification URL");
        }
        await prisma_1.prisma.providerProfile.update({
            where: { id: providerProfile.id },
            data: {
                verificationDocumentUrl: documentUrl,
                verificationStatus: client_1.VerificationStatus.PENDING_REVIEW,
                verificationSubmittedAt: new Date(),
            },
        });
        res.json({ success: true, documentUrl });
    }
    catch (error) {
        console.error("Verification upload failed", error);
        res.status(400).json({ error: "Failed to upload verification document" });
    }
});
exports.default = router;
//# sourceMappingURL=verification.js.map