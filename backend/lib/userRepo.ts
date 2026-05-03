//backend/lib/userRepo.ts
import { dynamo } from "./dynamodb.js";
import {
  PutCommand,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const TABLE = "Users";

/* ---------- CREATE USER ---------- */
export async function createUser(user: any) {
  await dynamo.send(
    new PutCommand({
      TableName: TABLE,
      Item: user,
      ConditionExpression: "attribute_not_exists(email)",
    })
  );
}

/* ---------- FIND USER ---------- */
export async function findUserByEmail(email: string) {
  const res = await dynamo.send(
    new GetCommand({
      TableName: TABLE,
      Key: { email },
    })
  );
  return res.Item;
}

/* ---------- UPDATE USER ---------- */
export async function updateUser(email: string, updates: any) {
  const updateExpression =
    "set " +
    Object.keys(updates)
      .map((k) => `#${k} = :${k}`)
      .join(", ");

  const ExpressionAttributeNames: any = {};
  const ExpressionAttributeValues: any = {};

  for (const key in updates) {
    ExpressionAttributeNames[`#${key}`] = key;
    ExpressionAttributeValues[`:${key}`] = updates[key];
  }

  await dynamo.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { email },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
    })
  );
}