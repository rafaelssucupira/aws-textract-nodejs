import { DetectTextCommand } from"@aws-sdk/client-rekognition"
import { PutItemCommand } from "@aws-sdk/client-dynamodb"
import { PutObjectCommand } from"@aws-sdk/client-s3"
import { writeFile } from"fs/promises"
import { randomUUID } from"node:crypto"
import Patterns from"./patterns.js"
import { validate } from "./validator.js"


export default class Handler {
    constructor( { rekoSvc, s3Svc, dynamoSvc } ) 
        {
            this.rekoSvc    = rekoSvc
            this.s3Svc      = s3Svc
            this.dynamoSvc  = dynamoSvc
        }

    async saveImage(buffer) 
        {
            const id            = randomUUID();
            const result = await this.s3Svc.send( new PutObjectCommand ({
                Bucket : "boxzap",
                Body   : buffer,
                Key    : `${id}.jpg` // caminho do arquivo dentro do bucket
            }))

            return {
                stsS3 : result.$metadata.httpStatusCode,
                uuid : id,
                imgBuffer : buffer 
            }

        }

    async saveDb(data) {
        const valid = validate(data)
        if (!valid) throw validate.errors

        const result = await this.dynamoSvc.send(new PutItemCommand({
            TableName : "box",
            Item : {
                "box_id" : {
                    "S" : data.uuid
                },
                "box_data" : {
                    "S" : data.datetime
                },
                "box_value" : {
                    "S" : data.value
                },
                "box_origin" : {
                    "S" : data.origin
                },
                "box_destination" : {
                    "S" : data.destination
                }
            }
        }) )

        return result.$metadata.httpStatusCode 
    
    }       

    normalizeResult(TextDetections) 
        {
            return TextDetections
                        .filter( data => data.Type === "LINE")
                        .map( data => data.DetectedText )
        }

    async textDetect(buffer) 
        {
            const { stsS3, uuid, imgBuffer } = await this.saveImage(buffer)
            if( stsS3 !== 200 ) throw "Não foi possivel salvar imagem no s3.";
                
            const { TextDetections }  = await this.rekoSvc.send(new DetectTextCommand({
                WordFilter : {
                    MinConfidence : 95
                },
                Image : {
                    Bytes : imgBuffer
                }
            }))

            const rekoResult = this.normalizeResult(TextDetections);
            // await writeFile("textDetectionsBB.txt", JSON.stringify(rekoResult, null, 2))
            const pattern = new Map([
                [ "nu", (rekoResult) => Patterns.getNubank(rekoResult) ], 
                [ "SISBB - SISTEMA DE INFORMACOES BANCO DO BRASIL", (rekoResult) => Patterns.getBB(rekoResult) ], 
            ]);
            const resultPattern = pattern.get(rekoResult[0]) (rekoResult.join("\n"));
            const resultDb      = await this.saveDb({uuid, ...resultPattern});
            if(resultDb !== 200) throw "Não foi possivel salvar dados no dynamoDB."

            return {
                statusCode : resultDb,
                result : resultPattern
            }
        }     

    async main(buffer) {
        
        try {
            return this.textDetect(buffer)
        }
        catch(e) {
            console.log(e);
            return {
                statusCode : 500,
                body : "Internal server error!"
            }
        }

    }

}