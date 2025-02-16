import { Main } from "./factory.js"
import { create } from '@wppconnect-team/wppconnect';
import { writeFile } from "node:fs/promises"
import Utils from "./utils.js"

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
            const {statusCode, result} = await Main( "create", { buffer : Utils.normalizeBase64(base64), number : msg.from.replace("@c.us", "") } )
            const resp = statusCode === 200 ? `- *Data/Hora :* ${result.datetime}\n- *Valor :* ${result.value}\n- *De :* ${result.of}\n- *Para :* ${result.to}\n- *PIX :* ${result.keypix}\n` 
                                            : result
            
            await client.sendText(msg.from, resp);
            return
        }
    else if(msg.type === "chat") 
        {
            const txtLowerCase = msg.body.toLocaleLowerCase();
            if(txtLowerCase.includes("caixa") === true) 
                {
                    const atCount = (msg.body.match(/@/g) || []).length;
                    const isDataValid = (msg.body.match(/(?<day>\d{2})\/?\-?(?<month>\d{2})\/?\-?(?<year>\d{4})/gm) || []).length
                    if(atCount !== 2 && isDataValid !== 2) {
                        await client.sendText(msg.from, "A mensagem deve conter exatamente dois '@'.\nAs Datas devem estar no formato dd/mm/yyyy\n\nEx : caixa@dd/mm/yyyy@dd/mm/yyyy");
                        return;
                    }
                    
                    const param = msg.body.split("@")
                    const { statusCode, result } = await Main( "read", { start : Utils.formatDate(param[1]), end : Utils.formatDate(param[2]) } )


                    const resp = statusCode === 200 ? `- * Crédito :* ${result.CREDITO}\n- *Débito :* ${result.DEBITO}\n- *Total :* ${(result.CREDITO-result.DEBITO)}` 
                                                    : result
                    await client.sendText(msg.from, resp);    

                }

            return

        } 
        
        await client.sendText(msg.from, "Envie seu comprovante ou envie o comando *caixa@dd/mm/yyyy@dd/mm/yyyy* para obter relatório!");
    
})
