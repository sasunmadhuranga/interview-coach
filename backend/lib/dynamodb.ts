// backend/lib/dynamodb.ts

import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"

const isLocal = process.env.NODE_ENV !== "production"

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  endpoint: isLocal ? "http://localhost:8000" : undefined,
  credentials: isLocal
    ? {
        accessKeyId: "local",
        secretAccessKey: "local",
      }
    : undefined,
})

export const dynamo = DynamoDBDocumentClient.from(client)