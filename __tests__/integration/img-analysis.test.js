import { describe, expect, it } from "vitest"
import { readFile } from "fs/promises"
import { normalize, join } from "path"
import Patterns from "../../src/patterns.js"
import { Main } from "../../src/factory.js"

describe("Image analyser test suite", () => {
    it("it should analyse succesfuly te image returning the results", async () => {
        const path          = join( normalize(__dirname), "vouchers");
        const base64        = await readFile(`${path}/nubank4.jpg`, { encoding : "base64" })
        const base64Data    = base64.replace(/^data:image\/\w+;base64,/, "");
        const buffer        = Buffer.from(base64Data, 'base64')

        const result    = await Main( buffer );
        console.log(result);
        expect(result.statusCode).toStrictEqual(200);
    })

    it("should resolve pattern Nubank", async () => {
        const base      = join( normalize(__dirname), "..", "mocks");
        const file      = await readFile(`${base}/textsNubank.txt`, { encoding : "utf-8" })
        const result    = Patterns.getNubank( JSON.parse(file).join("\n") );
        
        expect(result.datetime).toMatch(/(?<data>[0-9]+\s[JANFEVMARABRMAIJUNJULAGOSETOUTNOVDEZ]+\s\d{4}).+(?<hours>\d{2}\:\d{2}\:\d{2})/);
        expect(result.value).toMatch(/(?<valor>R\$\s\d{1,5},\d{2})/);
        expect(result.destination).toMatch(/[A-Z]/);
        expect(result.origin).toMatch(/[A-Z]/);
    
    })

    it("should resolve pattern Banco do Brasil", async () => {
        const base      = join( normalize(__dirname), "..", "mocks");
        const file      = await readFile(`${base}/textsBancoDoBrasil.txt`, { encoding : "utf-8" })
        const result    = Patterns.getBB( JSON.parse(file).join("\n") );
        
        expect(result.datetime).toMatch(/(?<data>)\d{2}\/\d{2}\/\d{4}\s\-\s(?<hours>\d{2}\:\d{2}\:\d{2})/);
        expect(result.value).toMatch(/R\$\d{1,5},\d{2}/);
        expect(result.destination).toMatch(/[A-Z]/);
        expect(result.origin).toMatch(/[A-Z]/);

    })

   
    
})
