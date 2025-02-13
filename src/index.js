import { Main } from "./factory.js"
import { create } from '@wppconnect-team/wppconnect';
import { writeFile } from "node:fs/promises"

const client = await create({
    phoneNumber: process.env.NUMBER,
    catchLinkCode: (str) => console.log('Code: ' + str),
})

client.onMessage( async (msg) => 
{
    await writeFile("msgInterface.txt", JSON.stringify(msg, null, 2));

    if(msg.type === "image" || (msg.type === "document" && msg.mimetype === "application/pdf") ) {
        const id     = msg.id;
        const base64 = await client.downloadMedia(id)
        const buffer = Buffer.from(base64.replace(/^data:image\/\w+;base64,|^data:application\/\w+;base64,/, ""), "base64")
        const {statusCode, result} = await Main( buffer )
        const resp = statusCode === 200 ? `- *Data/Hora :* ${result.datetime}\n- *Valor :* ${result.value}\n- *De :* ${result.of}\n- *Para :* ${result.to}\n- *PIX :* ${result.keypix}\n` 
                                        : "Internal server error!"
        
        await client.sendText(msg.from, resp);
    }
    else {
        if(msg.type === "text" && msg.body.toLowerCase() === "caixa") {
            await client.sendText(msg.from, "report");    
        }

        await client.sendText(msg.from, "Envie seu comprovante!");
    }   
    
})
