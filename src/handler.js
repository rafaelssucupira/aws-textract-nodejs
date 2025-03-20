import { DetectDocumentTextCommand  } from "@aws-sdk/client-textract";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb"
import Patterns from"./patterns.js"
import { validate } from "./validator.js"
// import {writeFile} from "node:fs/promises"

export default class Handler {
    constructor( { s3Svc, dynamoSvc, textSvc } ) 
        {
            this.s3Svc      = s3Svc
            this.dynamoSvc  = dynamoSvc
            this.textSvc  = textSvc
        }

    debitOrCredit(dataValues)  
        {
            return dataValues.reduce( (acc, cur) => {

                const field = cur.box_de
                            .toLowerCase()
                            .includes(process.env.ACCOUNT_OWNER) === true ? "DEBITO" : "CREDITO"
                
                const valor = parseFloat(cur.box_valor.replace("R$", "").replace(".", "").replace(",", "."));
                acc[ field ] += valor;

                return acc;
            }, { "CREDITO": 0, "DEBITO": 0 });
        }  
    
    normalizeResult(Blocks) 
        {
            return Blocks
                    .filter( data => data.BlockType === "LINE" && data.Confidence > 90)
                    .map( data => data.Text )
        }    

    async saveItems(data) 
        {
            const valid = validate(data)
            if (!valid) throw validate.errors
            
            const result = await this.dynamoSvc.send(new PutCommand({
                TableName : "boxzap",
                Item : {
                    "box_id"    : data.id,
                    "box_data"  : data.datetime,
                    "box_valor" : data.value,
                    "box_de"    : data.of,
                    "box_para"  : data.to,
                    "box_pix"   : data.keypix,
                    "box_text"  : data.text 
                }
            }) )
            
            if(result.$metadata.httpStatusCode !== 200) {
                throw "Não foi possivel salvar dados no dynamoDB."
            } 

        }    

    async readItems( number ) 
        {
            const result = await this.dynamoSvc.send(new QueryCommand({
                TableName : "boxzap",
                ExpressionAttributeValues :  {
                    ":id": number,
                },
                ProjectionExpression : "box_valor,box_data,box_de,box_para",
                KeyConditionExpression : "box_id = :id",
            }) )

            
            if(result.$metadata.httpStatusCode !== 200) throw "Não foi possivel salvar dados no dynamoDB."
            return this.debitOrCredit(result.Items)
            
        }        

    async textDetect({ number, buffer } ) 
        {
                
            const { Blocks }  = await this.textSvc.send(new DetectDocumentTextCommand({
                Document : {
                    Bytes : buffer
                }
            }))
            
            
            const rekoResult = this.normalizeResult(Blocks);
            const rekoResultFormatted = rekoResult.join("\n")
            const pattern = new Map([
                [ "ouvidoria@nubank.com.br",                        (rekoResult) => Patterns.getNubank(rekoResult) ], 
                [ "SISBB - SISTEMA DE INFORMACOES BANCO DO BRASIL", (rekoResult) => Patterns.getBB(rekoResult) ], 
                [ "0800 688 4365",                                  (rekoResult) => Patterns.getMercadoPago(rekoResult) ],
                [ "bradesco",                                       (rekoResult) => Patterns.getBradesco(rekoResult) ]
            ]);

            let resultPattern ;
            for(const data of pattern) {
                if(rekoResultFormatted.includes( data[0] ) ) {
                    resultPattern = pattern.get(data[0]) (rekoResultFormatted);
                    break;
                }
            }

            const validOwner = `${resultPattern.of.toLowerCase()}@${resultPattern.to.toLowerCase()}`
            if(validOwner.includes(process.env.ACCOUNT_OWNER) === false) {
                throw `Aceitamos pix somente de : ${process.env.ACCOUNT_OWNER}`
            }

            await this.saveItems( { 
                id : number, 
                text : rekoResultFormatted,
                ...resultPattern 
            } );

            const listResult = await this.readItems(number)
            
            return {
                statusCode : 200,
                rekoResult : resultPattern,
                listResult
            }
        }  

    async main(routine, params) 
        {    
            try 
                {
                    if(routine === "allNotes") {
                        return this.readItems(params.number)
                    } else {
                        return this.textDetect(params)
                    }
                }
            catch(e) 
                {
                    console.log(e);
                    return {
                        statusCode : 500,
                        result : e?.message || "Internal server error!"
                    }
                }

        }

}