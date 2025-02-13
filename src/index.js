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
        const result = await Main( buffer )

        let send = "";
        if(result.statusCode === 200) {
            send = `- ID : ${data.id}\n
                - Data/Hora : ${data.datetime}\n
                - Valor : ${data.value}c
                - De : ${data.of}\n
                - Para : ${data.to}\n
                - PIX : ${data.keypix}\n`;
        }
        else {
            send = "Internal server error!"
        }
        await client.sendText(msg.from, send);
    }
    else {
        await client.sendText(msg.from, "Envie seu comprovante!");
    }   

})
