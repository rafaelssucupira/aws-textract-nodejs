import { describe, expect, it } from "vitest"
import { readFile, writeFile } from "fs/promises"
import { normalize, join } from "path"
import Patterns from "../../src/patterns.js"
import { Main } from "../../src/factory.js"

describe("Image analyser test suite", () => {
    it.only("it should analyse succesfuly te image returning the results", async () => {
        const path          = join( normalize(__dirname), "vouchers");
        const base64        = await readFile(`${path}/mercadopago.pdf`, { encoding : "base64" })
        const base64Data    = base64.replace(/^data:image\/\w+;base64,/, "");
        const buffer        = Buffer.from(base64Data, 'base64')

        const result    = await Main( buffer );
        // console.log(result);
        expect(result.statusCode).toStrictEqual(200);
    })

    it("should resolve pattern Nubank", async () => {
        const base      = join( normalize(__dirname), "mocks");
        const file      = await readFile(`${base}/textsNubankCPF.txt`, { encoding : "utf-8" })
        const result    = Patterns.getNubank( JSON.parse(file).join("\n") );
        console.log(result)
        expect(result.datetime).toMatch(/(?<data>[0-9]+\s[JANFEVMARABRMAIJUNJULAGOSETOUTNOVDEZ]+\s\d{4}).+(?<hours>\d{2}\:\d{2}\:\d{2})/);
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
        expect(result.datetime).toMatch(/(?<data>)\d{2}\/\d{2}\/\d{4}\s\-\s(?<hours>\d{2}\:\d{2}\:\d{2})/);
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
        expect(result.datetime).toMatch(/\d{2}\:\d{2}\:\d{2}/);
        expect(result.value).toMatch(/R\$\s?\d{1,5}(,\d{2})?/);
        expect(result.of).toMatch(/[A-Z]/);
        expect(result.to).toMatch(/[A-Z]/);
       

    })

    it("should resolve pattern .pdf by BRADESCO", async () => {
        const base      = join( normalize(__dirname), "mocks");
        const file      = await readFile(`${base}/textsBradesco.txt`, { encoding : "utf-8" })
        const result    = Patterns.getBradesco( JSON.parse(file).join("\n") );
        console.log(result)
        expect(result.datetime).toMatch(/\d{2}\:\d{2}\:\d{2}/);
        expect(result.value).toMatch(/R\$\s?\d{1,5}(,\d{2})?/);
        expect(result.of).toMatch(/[A-Z]/);
        expect(result.to).toMatch(/[A-Z]/);
      
    })
   
    
})
