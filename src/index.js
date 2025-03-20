import TelegramBot from 'node-telegram-bot-api';
import { readFile } from "node:fs/promises"
import { Main } from "./factory.js"
import Utils from "./utils.js"

const bot = new TelegramBot( process.env.TOKEM, {polling: true} );
const ids = [];
const editMessage = async (chatID, txt) => {
    const { message_id } = await bot.editMessageText( txt, { chat_id : chatID, message_id : ids[ ids.length - 1] } )
    ids.push(message_id)
}

bot.on("message", async (msg) => {
 
    const { message_id } = await bot.sendMessage(msg.chat.id, "🔄 Processando..." )
    ids.push(message_id)
    if(msg.photo || (msg.document && msg.document.mime_type === "application/pdf") ) 
        {
            await editMessage(msg.chat.id, "🔄 Salvando...")

            const downFilePath  = await bot.downloadFile(Utils.getFileID(msg), `./datas/`)
            const base64 = await readFile(downFilePath, { encoding : "base64" } )

            await editMessage(msg.chat.id, "🔄 Lendo...")

            const { statusCode, rekoResult, listResult } = await Main("insert",  { buffer : Utils.normalizeBase64(base64), number : msg.chat.id.toString() } )
            await bot.deleteMessage(msg.chat.id, ids[ ids.length - 1] )
            await bot.sendMessage(msg.chat.id, statusCode === 200 ? Utils.normalizeResult(rekoResult) : rekoResult )
            await bot.sendMessage(msg.chat.id, Utils.normalizeTotal(listResult) )
           
        }
    else 
        {
            await editMessage(msg.chat.id, "🔄 Buscando...")
            const listResult = await Main("allNotes", { number : msg.chat.id.toString() } )
            
            await bot.deleteMessage(msg.chat.id, ids[ ids.length - 1] )
            await bot.sendMessage(msg.chat.id, Utils.normalizeTotal(listResult) )
        }
})