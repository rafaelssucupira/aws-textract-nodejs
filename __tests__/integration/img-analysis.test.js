const { describe, expect } = require("@jest/globals")
const requestMock = require("./../mocks/requestMock.json")
const requestMockInvalidUrl = require("./../mocks/requestMockInvalidUrl.json")
const { main } = require("./../../src/index")

const time = 15000

describe("Image analyser test suite", () => {
    test("it should analyse succesfuly te image returning the results", async () => {

        const response = [
          '98.91707611083984%. Computador',
          '98.91707611083984%. Eletrónica',
          '98.29694366455078%. Adulto',
          '98.29694366455078%. Masculino',
          '98.29694366455078%. Homem',
          '98.29694366455078%. Pessoa',
          '97.9880142211914%. Pc',
          '91.58375549316406%. Cara',
          '91.58375549316406%. Cabeça',
          '88.15668487548828%. Hardware de computador',
          '88.15668487548828%. Teclado de computador',
          '88.15668487548828%. Hardware',
          '86.43101501464844%. Garrafa',
          '86.43101501464844%. Shaker',
          '82.78709411621094%. Publicidade',
          '82.78709411621094%. Cartaz',
        ]
        
        const expected = {
            statusCode : 200,
            body : response.join("\n")
        }
       const result = await main ( requestMock );
    //    console.log("result", result);
       expect(result).toStrictEqual( expected ) 

    }, time)
    test("given an empty queryString it should return status code 400", async () => {

        const expected = {
            statusCode : 400,
            body : "image as empty!"
        }
       const result = await main ( requestMockInvalidUrl );
       expect(result).toStrictEqual( expected ) ;
    })
    test("given an invalid ImageURL it should return status 500", async () => {
        const expected = {
            statusCode : 500,
            body : "Internal server error!"
        }
       const result = await main ();
       expect(result).toStrictEqual( expected ) ;
    })
})