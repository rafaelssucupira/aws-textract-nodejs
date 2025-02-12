import { TextractClient  } from "@aws-sdk/client-textract";
import { DynamoDBClient } from"@aws-sdk/client-dynamodb"
import Handler  from "./handler.js"

const dynamoSvc = new DynamoDBClient({ region: "us-east-1" });
const textSvc = new TextractClient({ region: "us-east-1" })
const handler  = new Handler({
    dynamoSvc,
    textSvc
})

export const Main = handler.main.bind(handler)