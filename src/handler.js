import { DetectDocumentTextCommand  } from "@aws-sdk/client-textract";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb"
import Patterns from"./patterns.js"
import { validate } from "./validator.js"

import { SendMessageCommand } from "@aws-sdk/client-sqs"

export default class Handler {
    constructor( { dynamoSvc, textSvc, sqsSvc } ) 
        {
            this.dynamoSvc  = dynamoSvc
            this.textSvc  = textSvc
            this.sqsSvc = sqsSvc
        }
    setLower(txt) 
        {
            return txt.toLowerCase()
        }

    debitOrCredit(dataValues)  
        {
            return dataValues.reduce( (acc, cur) => {

                const field = this.setLower(cur.box_de)
                                  .includes(this.setLower(process.env.ACCOUNT_OWNER)) === true ? "DEBITO" : "CREDITO"
                
                const valor = parseFloat(cur.box_valor.replace("R$", "").replace(".", "").replace(",", "."));
                acc[ field ] += valor;

                return acc;
            }, { "CREDITO": 0, "DEBITO": 0 });
        }  
    
    normalizeResult(Blocks) 
        {
            return Blocks
                    .filter( data => data.BlockType === "LINE" && data.Confidence > process.env.ACCURACY)
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

    async read( number ) 
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

    async detect({ number, buffer } ) 
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
            for(const data of pattern) 
                {
                    if(rekoResultFormatted.includes( data[0] ) ) {
                        try{
                            resultPattern = pattern.get(data[0]) (rekoResultFormatted);
                            break;
                        }
                        catch(e) {
                            return Promise.reject({ 
                                sqs : true,
                                msg : "❌ Não foi possivel identificar o padrão.",
                                pattern : rekoResult,
                                respAWS : Blocks
                            })
                        }
                    }
                }

            const validOwner = `${this.setLower(resultPattern.of)}@${this.setLower(resultPattern.to)}`
            if(validOwner.includes(this.setLower(process.env.ACCOUNT_OWNER)) === false) {
                return Promise.reject({ 
                    sqs : false,
                    msg : `❌ Aceitamos pix somente de : ${process.env.ACCOUNT_OWNER}`
                })
            }

            await this.saveItems({ 
                id : number, 
                text : rekoResultFormatted,
                ...resultPattern 
            });

            return {
                statusCode : 200,
                rekoResult : resultPattern,
                listResult : await this.read(number)
            }
        }  

    async main(router, params) 
        {    
            try 
                {

                    const routine = new Map([
                        ["allNotes",    (params) => this.read(params.number) ],
                        ["insert",      (params) => this.detect(params) ],
                    ])

                    const fn = routine.get(router)
                    return await fn(params)

                }
            catch(err) 
                {
                    
                    if(err.sqs === true) 
                        {
                            const command   = new SendMessageCommand({
                                QueueUrl : "https://sqs.us-east-1.amazonaws.com/396913714523/task-queue",
                                MessageBody : JSON.stringify(err)
                            });
                            const result    = await this.sqsSvc.send(command)
                        }

                    return {
                        statusCode : 500,
                        rekoResult : err.msg || "Internal server error!",
                        listResult : await this.read(params.number)
                    }
                }

        }

}