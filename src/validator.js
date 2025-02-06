import Ajv from "ajv"
const ajv = new Ajv() 
const schema = {
  type: "object",
  properties: {
    datetime: { type: "string", nullable : false },
    value: { type: "string", nullable : false },
    destination: { type: "string", nullable : false },
    origin: { type: "string", nullable : false },
    
  },
  required: ["datetime", "value", "destination", "origin"],
  
}

export const validate = ajv.compile(schema)
