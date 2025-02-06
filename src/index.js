import { Main } from "./factory.js"
import { create } from '@wppconnect-team/wppconnect';

const client = await create({
    phoneNumber: process.env.NUMBER,
    catchLinkCode: (str) => console.log('Code: ' + str),
})

client.onMessage( async (msg) => 
{
    if(msg.type === "image") {
        const id                = msg.id;
        const base64    = await client.downloadMedia(id)
        await Main(Buffer.from(base64.replace(/^data:image\/\w+;base64,/, ""), "base64"))

        await client.sendText(msg.from, "Obrigado pela preferência!");
    }
    else {
        await client.sendText(msg.from, "Envie seu comprovante!");
    }   

})

