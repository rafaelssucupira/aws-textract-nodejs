import { describe, expect, it } from "vitest"
import { readFile, writeFile } from "fs/promises"
import { normalize, join } from "path"
import Patterns from "../../src/patterns.js"
import { Main } from "../../src/factory.js"
import { format, parse } from "date-fns"
import { ptBR } from "date-fns/locale"

describe("Image analyser test suite", () => {
    it("it should analyse succesfuly te image returning the results", async () => {
        const path          = join( normalize(__dirname), "vouchers");
        const base64        = await readFile(`${path}/bradesco.pdf`, { encoding : "base64" })
        const base64Data    = base64.replace(/^data:image\/\w+;base64,/, "");
        const buffer        = Buffer.from(base64Data, 'base64')

        const result    = await Main( "create", { number: "XXX", buffer } );
        // console.log(result);
        expect(result.statusCode).toStrictEqual(200);
    })

    it.only("should read all items dynamodb", async () => {
        const result    = await Main( "read", { number: "XXX", start : "2025-01-01 00:00:00", end : "2025-30-12 23:59:59" } );
        console.log(result);
    })

    it("should resolve pattern Nubank", async () => {
        const base      = join( normalize(__dirname), "mocks");
        const file      = await readFile(`${base}/textsNubank.txt`, { encoding : "utf-8" })
        const result    = Patterns.getNubank( JSON.parse(file).join("\n") );
        console.log(result)
        expect(result.datetime).toMatch(/\d{4}\-\d{2}\-\d{2}\s\d{2}\:\d{2}/);
        expect(result.value).toMatch(/(?<valor>R\$\s\d{1,5},\d{2})/);
        expect(result.to).toMatch(/[A-Z]/);
        expect(result.of).toMatch(/[A-Z]/);
        expect(result.keypix).toMatch(/[A-Za-z]/);
    
    })

    it("should resolve pattern Banco do Brasil", async () => {
        const base      = join( normalize(__dirname), "mocks");
        const file      = await readFile(`${base}/textsBancoDoBrasil.txt`, { encoding : "utf-8" })
        const result    = Patterns.getBB( JSON.parse(file).join("\n") );
        console.log(result)
        expect(result.datetime).toMatch(/\d{4}\-\d{2}\-\d{2}\s\d{2}\:\d{2}/);
        expect(result.value).toMatch(/(?<valor>R\$\s?\d{1,5}(.\d{3,4})?(,\d{2})?)/);
        expect(result.to).toMatch(/[A-Z]/);
        expect(result.of).toMatch(/[A-Z]/);
        expect(result.keypix).toMatch(/[A-Za-z]/);

    })

    it("should resolve pattern .pdf by MERCADO PAGO ", async () => {

        const base      = join( normalize(__dirname), "mocks");
        const file      = await readFile(`${base}/textsMercadoPago.txt`, { encoding : "utf-8" })
        const result    = Patterns.getMercadoPago( JSON.parse(file).join("\n") );
        console.log(result)
        expect(result.datetime).toMatch(/\d{4}\-\d{2}\-\d{2}\s\d{2}\:\d{2}/);
        expect(result.value).toMatch(/R\$\s?\d{1,5}(,\d{2})?/);
        expect(result.of).toMatch(/[A-Z]/);
        expect(result.to).toMatch(/[A-Z]/);
       

    })

    it("should resolve pattern .pdf by BRADESCO", async () => {
        const base      = join( normalize(__dirname), "mocks");
        const file      = await readFile(`${base}/textsBradesco.txt`, { encoding : "utf-8" })
        const result    = Patterns.getBradesco( JSON.parse(file).join("\n") );
        console.log(result)
        expect(result.datetime).toMatch(/\d{4}\-\d{2}\-\d{2}\s\d{2}\:\d{2}/);
        expect(result.value).toMatch(/R\$\s?\d{1,5}(,\d{2})?/);
        expect(result.of).toMatch(/[A-Z]/);
        expect(result.to).toMatch(/[A-Z]/);
      
    })

    it("should formatted data yyyy/mm/dd h:i:s", async () => {

        const mocksDates = {
            "mercadoPago" : "7 de Fevereiro de 2025 - 20:21:47",
            "nubank": "13 FEV 2025 - 14:51:46",
            "bradesco_with_bb" : "31/01/2025 - 14:06:16"
        }

        const resultFormatted = Object.keys(mocksDates).reduce((acc, key) => {
            let date;
            if (key === "mercadoPago") {
                date = parse(mocksDates[key], "d 'de' MMMM 'de' yyyy - HH:mm:ss", new Date(), { locale: ptBR });
            } else if (key === "nubank") {
                date = parse(mocksDates[key], "d MMM yyyy - HH:mm:ss", new Date(), { locale: ptBR });
            } else if (key === "bradesco_with_bb") {
                date = parse(mocksDates[key], "dd/MM/yyyy - HH:mm:ss", new Date(), { locale: ptBR });
            }
            const formattedDate = format(date, "yyyy-MM-dd HH:mm")
            expect(formattedDate).toMatch(/\d{4}\-\d{2}\-\d{2}\s\d{2}\:\d{2}/);
            
            acc[key] = formattedDate;
            return acc;
        }, {});

    })
   
    
})
