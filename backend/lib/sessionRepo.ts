import { dynamo } from "./dynamodb.js"
import { PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb"
import type { AnswerEntry } from "../types/interview.js";

type Role = "DEVOPS" | "CLOUD" | "SRE"
const TABLE = "InterviewSessions"

export async function createSession(
  userId: string,
  role: Role
): Promise<string> {
  const sessionId = Date.now().toString()

  await dynamo.send(
    new PutCommand({
      TableName: TABLE,
      Item: {
      userId,
      sessionId,
      role,
      questions: [],
      totalScore: 0,
      questionCount: 0,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      completedAt: null
    },
    })
  )

  return sessionId // ✅ REQUIRED
}


export async function addAnswer(
  userId: string,
  sessionId: string,
  entry: AnswerEntry
) {
  await dynamo.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { userId, sessionId },
      UpdateExpression: `
        SET 
          questions = list_append(if_not_exists(questions, :empty), :q),
          totalScore = if_not_exists(totalScore, :zero) + :s,
          questionCount = if_not_exists(questionCount, :zero) + :one,
          updatedAt = :now
      `,
      ExpressionAttributeValues: {
        ":q": [entry],
        ":s": entry.score,
        ":zero": 0,
        ":one": 1,
        ":now": new Date().toISOString(),
        ":empty": []
      }
    })
  )
}

import { GetCommand } from "@aws-sdk/lib-dynamodb"

export async function getSession(userId: string, sessionId: string) {
  const res = await dynamo.send(
    new GetCommand({
      TableName: TABLE,
      Key: { userId, sessionId }
    })
  )

  return res.Item
}

export async function completeSession(userId:string, sessionId:string) {
  await dynamo.send(new UpdateCommand({
    TableName: TABLE,
    Key: { userId, sessionId },
    UpdateExpression:
      "SET #status = :s, completedAt = :t",
    ExpressionAttributeNames: {
      "#status": "status"
    },
    ExpressionAttributeValues: {
      ":s": "COMPLETED",
      ":t": new Date().toISOString()
    }
  }))
}

export async function updateTopicStats(
  userId: string,
  sessionId: string,
  topic: string,
  score: number
) {
  await dynamo.send(
    new UpdateCommand({
      TableName: TABLE,
      Key: { userId, sessionId },
      UpdateExpression: `
        SET 
          weakTopics.#t.#c = if_not_exists(weakTopics.#t.#c, :zero) + :one,
          weakTopics.#t.totalScore = if_not_exists(weakTopics.#t.totalScore, :zero) + :score
      `,
      ExpressionAttributeNames: {
        "#t": topic,
        "#c": "count"
      },
      ExpressionAttributeValues: {
        ":zero": 0,
        ":one": 1,
        ":score": score
      }
    })
  )
}