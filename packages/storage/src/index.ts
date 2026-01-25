import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  type PutObjectCommandInput,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const globalForS3 = globalThis as unknown as {
  s3: S3Client | undefined
}

function createS3Client(): S3Client {
  return new S3Client({
    endpoint: process.env.MINIO_ENDPOINT || "http://192.168.110.246:9000",
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.MINIO_ACCESS_KEY || "crmall0125",
      secretAccessKey: process.env.MINIO_SECRET_KEY || "crmall0125",
    },
    forcePathStyle: true,
  })
}

export const s3 = globalForS3.s3 ?? createS3Client()

if (process.env.NODE_ENV !== "production") {
  globalForS3.s3 = s3
}

const BUCKET = process.env.MINIO_BUCKET || "crmall0125"

export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType?: string
): Promise<string> {
  const input: PutObjectCommandInput = {
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  }

  await s3.send(new PutObjectCommand(input))
  return key
}

export async function getFileUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  })

  return getSignedUrl(s3, command, { expiresIn })
}

export async function deleteFile(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  )
}

export { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand }
