const { describe, expect } = require("@jest/globals")
const requestMock = require("./../mocks/requestMock.json")
const requestMockInvalidUrl = require("./../mocks/requestMockInvalidUrl.json")
const { main } = require("./../../src/index")

const time = 10000

describe("Image analyser test suite", () => {
    test("it should analyse succesfuly te image returning the results", async () => {

        const response = [
            "98.91707611083984%. Computer",
            "98.91707611083984%. Electronics",
            "98.29694366455078%. Adult",
            "98.29694366455078%. Male",
            "98.29694366455078%. Man",
            "98.29694366455078%. Person",
            "97.9880142211914%. Pc",
            "91.58375549316406%. Face",
            "91.58375549316406%. Head",
            "88.15668487548828%. Computer Hardware",
            "88.15668487548828%. Computer Keyboard",
            "88.15668487548828%. Hardware",
            "86.43101501464844%. Bottle",
            "86.43101501464844%. Shaker",
            "82.78709411621094%. Advertisement",
            "82.78709411621094%. Poster",
        ]
        
        const expected = {
            statusCode : 200,
            body : response.join("\n")
        }
       const result = await main ( requestMock );
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