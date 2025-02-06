import { RekognitionClient } from "@aws-sdk/client-rekognition"
import { S3Client }  from "@aws-sdk/client-s3"
import { DynamoDBClient } from"@aws-sdk/client-dynamodb"
import Handler  from "./handler.js"
 
const rekoSvc = new RekognitionClient({ region: "us-east-1" });
const s3Svc = new S3Client({ region: "us-east-1" });
const dynamoSvc = new DynamoDBClient({ region: "us-east-1" });
const handler  = new Handler({
    rekoSvc,
    s3Svc,
    dynamoSvc
})

export const Main = handler.main.bind(handler)