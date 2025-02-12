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

//SER FEITO NO INDEX.JS
// const base      = join( normalize(__dirname), "..", "integration", "vouchers");
// const boleto    = await readFile(`${base}/mercadopago.pdf`);
// const convert   = fromBuffer(boleto, {
//     width: 250,
//     height: 600
// });
// const { buffer } = await convert(1, { responseType: "buffer" })
// const result = await Main( buffer )

