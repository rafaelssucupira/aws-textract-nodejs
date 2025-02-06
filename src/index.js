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
        const resultBase64    = await client.downloadMedia(id)
        console.log("resultBase64", resultBase64)
        await Main(Buffer.from(resultBase64, "base64"))

        await client.sendText(msg.from, "Obrigado pela preferência!");
    }
    else {
        await client.sendText(msg.from, "Envie seu comprovante!");
    }   

})

