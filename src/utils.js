export default class Utils {
    static formatDate(date) {
        const data = date.match(/(?<day>\d{2})\/?\-?(?<month>\d{2})\/?\-?(?<year>\d{4})/)
        return `${data.groups.year}-${data.groups.month}-${data.groups.day}`
    }

    static normalizeBase64(base64) {
        return Buffer.from(base64.replace(/^data:image\/\w+;base64,|^data:application\/\w+;base64,/, ""), "base64")
    }

    static getFileID (msg) 
        {
            return msg.photo ? msg.photo.reduce((acc, cur) => {
                return cur.width > acc.width ? cur : acc;
            }, msg.photo[0] ).file_id
            :
            msg.document.file_id
        }
        
    static normalizeResult(result)  
        {
            return '✅ Data/Hora : '+result.datetime+
                    '\n✅ Valor : '+result.value+
                    '\n✅ De : '+result.of+
                    '\n✅ Para : '+result.to+
                    '\n✅ Pix : '+result.keypix
        }
    
    static normalizeTotal(result)  
        {
            const formatter = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            return '🟢 Crédito : R$ '+formatter.format(result.CREDITO)+
                    '\n🔴 Débito : R$ '+formatter.format(result.DEBITO)+        
                    '\n\n💰 Total : R$ '+formatter.format(result.CREDITO - result.DEBITO)
        }

}