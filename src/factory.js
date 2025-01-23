const { RekognitionClient } = require("@aws-sdk/client-rekognition");
const Handler = require("./handler.js")

const rekoSvc = new RekognitionClient({ region: "us-east-1" });
const handler  = new Handler({
    rekoSvc
})

// //pra poder usar o this do  handler
module.exports = handler.main.bind(handler)