import { PutCommand } from "@aws-sdk/lib-dynamodb"
import { dynamo } from "../lib/dynamodb.js"

async function testInsert() {
  try {
    await dynamo.send(
      new PutCommand({
        TableName: "InterviewSessions",
        Item: {
          userId: "test-user",
          sessionId: Date.now().toString(),
          role: "DEVOPS",
          questions: [],
          totalScore: 0,
          createdAt: new Date().toISOString(),
        },
      })
    )

    console.log("✅ Insert successful")
  } catch (err) {
    console.error("❌ Insert failed:", err)
  }
}

testInsert()