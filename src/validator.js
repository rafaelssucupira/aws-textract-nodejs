import Ajv from "ajv"
const ajv = new Ajv() 
const schema = {
  type: "object",
  properties: {
    datetime  : { type: "string", nullable : false },
    value     : { type: "string", nullable : false },
    to        : { type: "string", nullable : false },
    of        : { type: "string", nullable : false },
    keypix    : { type: "string", nullable : false },
    text      : { type: "string", nullable : false }
  },
  required: ["datetime", "value", "to", "of", "keypix", "text"],
  
}

export const validate = ajv.compile(schema)
