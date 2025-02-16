import { DetectDocumentTextCommand  } from "@aws-sdk/client-textract";
import { PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb"
import Patterns from"./patterns.js"
import { validate } from "./validator.js"

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

                const field = cur.box_de === "Rafael Sucupira Marques" ? "CREDITO" : cur.box_para === "Rafael Sucupira Marques" ? "DEBITO" : "DEBITO"
                
                const valor = parseFloat(cur.box_valor.replace("R$", "").replace(".", "").replace(",", "."));
                acc[ field ] += valor;

                return acc;
                // if (cur.box_de === "Rafael Sucupira Marques") {
                // }
                // else if (cur.box_para === "Rafael Sucupira Marques") {
                //     const valor = parseFloat(cur.box_valor.replace("R$", "").replace(".", "").replace(",", "."));
                //     acc["DEBITO"] += valor;
                // }
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
            
            const result = await this.dynamoSvc.send(new PutItemCommand({
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
            
            return result.$metadata.httpStatusCode 

        }    

    async readItems( { number, start, end } ) 
        {
            const result = await this.dynamoSvc.send(new QueryCommand({
                TableName : "boxzap",
                ExpressionAttributeValues :  {
                    ":id"       : number,
                    ":start"    : start,
                    ":end"      : end  
                },
                ProjectionExpression : "box_valor,box_data,box_de,box_para",
                KeyConditionExpression : "box_id = :id AND box_data BETWEEN :start AND :end",
            }) )

            console.log("resultRead", JSON.stringify(result,null,2));
            if(result.$metadata.httpStatusCode !== 200) throw "Não foi possivel salvar dados no dynamoDB."
            return {
                statusCode : result.$metadata.httpStatusCode ,
                result : this.debitOrCredit(result)
            }

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
            // await writeFile("textDetections.txt", JSON.stringify(rekoResult, null, 2))
            const pattern = new Map([
                [ "0800 887 0463",                                  (rekoResult) => Patterns.getNubank(rekoResult) ], 
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
            const resultDb      = await this.saveItems( { 
                id : number, 
                text : rekoResultFormatted,
                ...resultPattern 
            } );
            if(resultDb !== 200) throw "Não foi possivel salvar dados no dynamoDB."

            return {
                statusCode : resultDb,
                result : resultPattern
            }
        }  

    // params = buffer || paramsQueryRead
    async main(opt = "read", params = "") 
        {    
            try 
                {
                    const opts = new Map([
                        ["create",  (params) => this.textDetect(params) ],
                        ["read",    (params) => this.readItems(params) ]
                    ])
                    const result = await opts.get(opt)(params)
                    return result
                }
            catch(e) 
                {
                    console.log(e);
                    return {
                        statusCode : 500,
                        body : "Internal server error!"
                    }
                }

        }

}