export default class Patterns {
    static getNubank(texts) 
    {    
        const foundTime = texts.match(/(?<data>[0-9]+\s[JANFEVMARABRMAIJUNJULAGOSETOUTNOVDEZ]+\s\d{4}).+(?<hours>\d{2}\:\d{2}\:\d{2})/);
        const foundValue= texts.match(/(?<valor>R\$\s?\d{1,5}(.\d{3,4})?(,\d{2})?)/);
        const to        = texts.match(/(?<para>Destino\s?[A-Za-z\s]+(CNPJ|CPF))/);
        const of        = texts.match(/Origem\sNome\s(?<de>.+)/)
        const keyPix    = texts.match(/Chave\sPix\s(?<keypix>.+)/)
        
        return {
            datetime    : `${foundTime.groups.data} - ${foundTime.groups.hours}`,
            value       : foundValue.groups.valor,
            of          : of.groups.de,
            to          : to.groups.para.replace(/Destino|Nome|CPF|CNPJ|\n/g, ""),
            keypix      : keyPix.groups.keypix

        }

    }

    static getBB(texts) 
    {
        const foundTime = texts.match(/DATA:\s(?<data>\d{2}\/\d{2}\/\d{4}).+(?<hours>\d{2}\:\d{2}\:\d{2})/);
        const foundValue = texts.match(/(?<valor>R\$\s?\d{1,5}(.\d{3,4})?(,\d{2})?)/);
        const of = texts.match(/CLIENTE:\s(?<de>.+)/);
        const to = texts.match(/PAGO PARA:\s(?<para>.+)/);
        const keyPix = texts.match(/CHAVE\sPIX:\s(?<keypix>.+)/)
        return {
            datetime    : `${foundTime.groups.data} - ${foundTime.groups.hours}`,
            value       : foundValue.groups.valor,
            of          : of.groups.de,
            to          : to.groups.para,
            keypix      : keyPix.groups.keypix
        }

        
    }

    static getBradesco(texts) 
    {
        const dates = texts.match(/Data e Hora:\s?(?<date>.+)/gm);
        const foundValue = texts.match(/(?<valor>R\$\s?\d{1,5}(.\d{3,4})?(,\d{2})?)/);
        const names     = texts.match(/Nome:\s?(?<name>.+)/gm);
        const keyPix = texts.match(/Chave:\s(?<keypix>.+)/)
        return {
            datetime    : dates[0].replace("Data e Hora: ", ""),
            value       : foundValue.groups.valor,
            of          : names[0].replace("Nome: ", ""),
            to          : names[1].replace("Nome: ", ""),
            keypix      : keyPix.groups.keypix
        }

    }

    static getMercadoPago(texts) 
    {
        
        const foundDate     = texts.match(/(?<data>\d{1,2}\sde\s[A-Za-z]+\sde\s\d{4})/);
        const foundHour     = texts.match(/(?<hours>\d{2}:\d{2}:\d{2})/);
        const foundValue    = texts.match(/(?<valor>R\$\s?\d{1,5}(,\d{2})?)/);
        const of          = texts.match(/De\s(?<de>[A-Za-z\s]+)\s(CPF|CNPJ)/);
        const to        = texts.match(/Para\s(?<para>.+)\s/);
        return {
            datetime: `${foundDate.groups.data} - ${foundHour.groups.hours}`,
            value   : foundValue.groups.valor,
            of      : of.groups.de,
            to      : to.groups.para,
            keypix  : "DESCONHECIDO"
        }

    }


} 
