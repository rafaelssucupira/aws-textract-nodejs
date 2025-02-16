import { format, parse } from "date-fns"
import { ptBR } from "date-fns/locale"
export default class Patterns {
    static getNubank(texts) 
    {    
        const foundTime = texts.match(/(?<data>[0-9]+\s[JANFEVMARABRMAIJUNJULAGOSETOUTNOVDEZ]+\s\d{4}).+(?<hours>\d{2}\:\d{2}\:\d{2})/);
        const foundValue= texts.match(/(?<valor>R\$\s?\d{1,5}(.\d{2,4})?(,\d{2})?)/);
        const of        = texts.match(/Origem\s(Nome)?\s?(?<de>.+\s?(Nome)?\s?.+)/)
        const to        = texts.match(/Destino\s(Nome)?\s?(?<para>[A-Za-zãç\s]+)Instituição/);
        const keyPix    = texts.match(/Chave\sPix\s(?<keypix>.+)/)

        const getDate       = parse(`${foundTime.groups.data} - ${foundTime.groups.hours}`, "d MMM yyyy - HH:mm:ss", new Date(), { locale: ptBR })
        const formattedDate = format(getDate, "yyyy-MM-dd HH:mm")
      
        return {
            datetime    : formattedDate,
            value       : foundValue.groups.valor,
            of          : of.groups.de.replace(/Instituição|Nome|CPF|CNPJ|\n/g, ""),
            to          : to.groups.para.replace(/Destino|Nome|CPF|CNPJ|\n/g, ""),
            keypix      : keyPix?.groups?.keypix || "DESCONHECIDO"
        }

    }

    static getBB(texts) 
    {
        const foundTime = texts.match(/DATA:\s(?<data>\d{2}\/\d{2}\/\d{4}).+(?<hours>\d{2}\:\d{2}\:\d{2})/);
        const foundValue = texts.match(/(?<valor>R\$\s?\d{1,5}(.\d{2,4})?(,\d{2})?)/);
        const of = texts.match(/CLIENTE:\s(?<de>.+)/);
        const to = texts.match(/PAGO PARA:\s(?<para>.+)/);
        const keyPix = texts.match(/CHAVE\sPIX:\s(?<keypix>.+)/)
        
        const getDate       = parse(`${foundTime.groups.data} - ${foundTime.groups.hours}`, "dd/MM/yyyy - HH:mm:ss", new Date(), { locale: ptBR })
        const formattedDate = format(getDate, "yyyy-MM-dd HH:mm")

        return {
            datetime    : formattedDate,
            value       : foundValue.groups.valor,
            of          : of.groups.de,
            to          : to.groups.para,
            keypix      : keyPix?.groups?.keypix || "DESCONHECIDO"
        }

        
    }

    static getBradesco(texts) 
    {
        const dates = texts.match(/Data e Hora:\s?(?<date>.+)/gm);
        const foundValue = texts.match(/(?<valor>R\$\s?\d{1,5}(.\d{2,4})?(,\d{2})?)/);
        const names     = texts.match(/Nome:\s?(?<name>.+)/gm);
        const keyPix = texts.match(/Chave:\s(?<keypix>.+)/)
        
        const getDate       = parse(dates[0].replace("Data e Hora: ", ""), "dd/MM/yyyy - HH:mm:ss", new Date(), { locale: ptBR })
        const formattedDate = format(getDate, "yyyy-MM-dd HH:mm")

        return {
            datetime    : formattedDate,
            value       : foundValue.groups.valor,
            of          : names[0].replace("Nome: ", ""),
            to          : names[1].replace("Nome: ", ""),
            keypix      : keyPix?.groups?.keypix || "DESCONHECIDO"
        }

    }

    static getMercadoPago(texts) 
    {
        
        const foundDate     = texts.match(/(?<data>\d{1,2}\sde\s[A-Za-z]+\sde\s\d{4})/);
        const foundHour     = texts.match(/(?<hours>\d{2}:\d{2}:\d{2})/);
        const foundValue    = texts.match(/(?<valor>R\$\s?\d{1,5}(.\d{2,4})?(,\d{2})?)/);
        const of            = texts.match(/De\s(?<de>[A-Za-z\s]+)\s(CPF|CNPJ)/);
        const to            = texts.match(/Para\s(?<para>.+)\s/);

        const getDate       = parse(`${foundDate.groups.data} - ${foundHour.groups.hours}`, "d 'de' MMMM 'de' yyyy - HH:mm:ss", new Date(), { locale: ptBR })
        const formattedDate = format(getDate, "yyyy-MM-dd HH:mm")
        return {
            datetime: formattedDate,
            value   : foundValue.groups.valor,
            of      : of.groups.de,
            to      : to.groups.para,
            keypix  : "DESCONHECIDO"
        }

    }


} 
