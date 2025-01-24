const { RekognitionClient } = require("@aws-sdk/client-rekognition");
const { TranslateClient } = require("@aws-sdk/client-translate");
const Handler = require("./handler.js")

const rekoSvc = new RekognitionClient({ region: "us-east-1" });
const translateSvc = new TranslateClient({ region: "us-east-1" });
const handler  = new Handler({
    rekoSvc,
    translateSvc
})

// //pra poder usar o this do  handler
module.exports = handler.main.bind(handler)