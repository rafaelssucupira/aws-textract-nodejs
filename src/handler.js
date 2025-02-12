import { DetectDocumentTextCommand  } from "@aws-sdk/client-textract";
import { PutItemCommand } from "@aws-sdk/client-dynamodb"
import { writeFile } from "fs/promises"
import { randomUUID } from"node:crypto"
import Patterns from"./patterns.js"
import { validate } from "./validator.js"


export default class Handler {
    constructor( { s3Svc, dynamoSvc, textSvc } ) 
        {
            this.s3Svc      = s3Svc
            this.dynamoSvc  = dynamoSvc
            this.textSvc  = textSvc
        }

    async saveDb(data) {
        const valid = validate(data)
        if (!valid) throw validate.errors
        
        const result = await this.dynamoSvc.send(new PutItemCommand({
            TableName : "box",
            Item : {
                "box_id" : { "S" : data.id },
                "box_data" : { "S" : data.datetime },
                "box_valor" : { "S" : data.value },
                "box_de" : { "S" : data.of },
                "box_para" : { "S" : data.to },
                "box_pix" : { "S" : data.keypix },
                "box_text" : { "S" : data.text }
            }
        }) )
        
        return result.$metadata.httpStatusCode 
    
    }       

    normalizeResult(Blocks) 
        {
            return Blocks
                        .filter( data => data.BlockType === "LINE" && data.Confidence > 90)
                        .map( data => data.Text )
        }

    async textDetect(buffer) 
        {
                
            const { Blocks }  = await this.textSvc.send(new DetectDocumentTextCommand({
                Document : {
                    Bytes : buffer
                }
            }))

            const rekoResult = this.normalizeResult(Blocks);
            const rekoResultFormatted = rekoResult.join("\n")
            // await writeFile("textDetections.txt", JSON.stringify(rekoResult, null, 2))
            const pattern = new Map([
                [ "ouvidoria@nubank.com.br (Atendimento das 8h às", (rekoResult) => Patterns.getNubank(rekoResult) ], 
                [ "SISBB - SISTEMA DE INFORMACOES BANCO DO BRASIL", (rekoResult) => Patterns.getBB(rekoResult) ], 
                [ "0800 688 4365", (rekoResult) => Patterns.getMercadoPago(rekoResult)  ],
                [ "bradesco", (rekoResult) => Patterns.getBradesco(rekoResult) ]
            ]);

            let resultPattern ;
            for(const data of pattern) {
                if(rekoResult.includes( data[0] ) ) {
                    resultPattern = pattern.get(data[0]) (rekoResultFormatted);
                    break;
                }
            }

            const resultDb      = await this.saveDb( { 
                id : randomUUID(), 
                text : rekoResultFormatted,
                ...resultPattern 
            } );
            if(resultDb !== 200) throw "Não foi possivel salvar dados no dynamoDB."

            return {
                statusCode : resultDb,
                result : resultPattern
            }
        }     

    async main(buffer) {
        
        try {
            return await this.textDetect(buffer)
        }
        catch(e) {
            console.log(e.message);
            return {
                statusCode : 500,
                body : "Internal server error!"
            }
        }

    }

}