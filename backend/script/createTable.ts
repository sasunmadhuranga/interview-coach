import { DynamoDBClient, CreateTableCommand } from "@aws-sdk/client-dynamodb"

const client = new DynamoDBClient({
  region: "us-east-1",
  endpoint: "http://localhost:8000",
  credentials: {
    accessKeyId: "local",
    secretAccessKey: "local",
  },
})

async function createTable() {
  const command = new CreateTableCommand({
    TableName: "InterviewSessions",
    KeySchema: [
      { AttributeName: "userId", KeyType: "HASH" },
      { AttributeName: "sessionId", KeyType: "RANGE" },
    ],
    AttributeDefinitions: [
      { AttributeName: "userId", AttributeType: "S" },
      { AttributeName: "sessionId", AttributeType: "S" },
    ],
    BillingMode: "PAY_PER_REQUEST",
  })

  await client.send(command)
  console.log("✅ Table created successfully")
}

createTable().catch(console.error)