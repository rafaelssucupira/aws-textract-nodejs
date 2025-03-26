import 'dotenv/config'
import { TextractClient  } from "@aws-sdk/client-textract";
import { DynamoDBClient } from"@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { SQSClient } from "@aws-sdk/client-sqs"

import Handler  from "./handler.js"

const  sqsSvc = new SQSClient({})
const dynamoSvc = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const textSvc = new TextractClient({ region: "us-east-1" })
const handler  = new Handler({
    dynamoSvc,
    textSvc,
    sqsSvc
})

export const Main = handler.main.bind(handler)