import { describe, expect, it } from "vitest"
import { readFile, writeFile } from "fs/promises"
import { normalize, join } from "path"
import Patterns from "../../src/patterns.js"
import { Main } from "../../src/factory.js"
import { format, parse } from "date-fns"
import { ptBR } from "date-fns/locale"
import Utils from "../../src/utils.js"

describe("Image analyser test suite", () => {
    it("it should analyse succesfuly te image returning the results", async () => {
        const path          = join( normalize(__dirname), "vouchers");
        const base64        = await readFile(`${path}/mercadopago.pdf`, { encoding : "base64" })
        const base64Data    = base64.replace(/^data:image\/\w+;base64,/, "");
        const buffer        = Buffer.from(base64Data, 'base64')

        const result    = await Main( "create", { number: "XXX", buffer } );
        expect(result.statusCode).toStrictEqual(200);
    })

    it("should read all items dynamodb", async () => {
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
        expect(result.keypix).toMatch(/[A-Za-z]/);
       

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
        expect(result.keypix).toMatch(/[A-Za-z]/);
      
    })

    it("should formatted data yyyy-mm-dd", async () => {
        const resultFormatted = Utils.formatDate("16/02/2025")
        expect(resultFormatted).toStrictEqual("2025-02-16")
    })
    
})
