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
        const result = await Main( Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), "base64") )
        console.log(result)

        await client.sendText(msg.from, "Obrigado pela preferência!");
    }
    else {
        await client.sendText(msg.from, "Envie seu comprovante!");
    }   

})
