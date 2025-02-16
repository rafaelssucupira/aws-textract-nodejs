import { Main } from "./factory.js"
import { create } from '@wppconnect-team/wppconnect';
import { writeFile } from "node:fs/promises"

const client = await create({
    catchLinkCode: (str) => console.log('Code: ' + str),
})

client.onMessage( async (msg) => 
{
    await writeFile("msgInterface.txt", JSON.stringify(msg, null, 2));

    if(msg.type === "image" || (msg.type === "document" && msg.mimetype === "application/pdf") ) 
        {
            const id     = msg.id;
            const base64 = await client.downloadMedia(id)
            const buffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,|^data:application\/\w+;base64,/, ""), "base64")
            const {statusCode, result} = await Main( buffer )
            const resp = statusCode === 200 ? `- *Data/Hora :* ${result.datetime}\n- *Valor :* ${result.value}\n- *De :* ${result.of}\n- *Para :* ${result.to}\n- *PIX :* ${result.keypix}\n` 
                                            : "Internal server error!"
            
            await client.sendText(msg.from, resp);
        }
    else 
        {
            if(msg.type === "text" && msg.body.toLowerCase() === "caixa") 
                {

                    const resp = statusCode === 200 ? `- * Crédito :* ${result.CREDITO}\n- *Débito :* ${result.DEBITO}\n- *Total :* ${(result.CREDITO-result.DEBITO)}` 
                                                    : "Internal server error!"
                    await client.sendText(msg.from, resp);    

                }

            await client.sendText(msg.from, "Envie seu comprovante!");
        }   
    
})
