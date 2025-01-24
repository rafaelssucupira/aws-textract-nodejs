const { DetectLabelsCommand } = require("@aws-sdk/client-rekognition");
const { TranslateTextCommand  } = require("@aws-sdk/client-translate");

module.exports = class Handler {
    constructor( { rekoSvc, translateSvc } ) 
        {
            this.rekoSvc = rekoSvc
            this.translateSvc = translateSvc
        }

    async getImage(url) 
        {
            const get = await fetch(url)
            const result = await get.arrayBuffer()
            return Buffer.from(result, "base64");
        }

    async detectImgLabels(imgBuffer) {
        
        try {
            const data = await this.rekoSvc.send(new DetectLabelsCommand({
                Image : {
                    Bytes : imgBuffer
                }
            }));
            return data;
        
          } catch (error) {
            console.log(error)
          } 
    }

    async translateTxt(txt) {
        
        // const input = { // TranslateTextRequest
        //     Text: "STRING_VALUE", // required
        //     TerminologyNames: [ // ResourceNameList
        //       "STRING_VALUE",
        //     ],
        //     SourceLanguageCode: "STRING_VALUE", // required
        //     TargetLanguageCode: "STRING_VALUE", // required
        //     Settings: { // TranslationSettings
        //       Formality: "FORMAL" || "INFORMAL",
        //       Profanity: "MASK",
        //       Brevity: "ON",
        //     },
        //   };

        try {
            const data = await this.translateSvc.send(new TranslateTextCommand({
                    Text: txt, // required
                    SourceLanguageCode: "en", // required
                    TargetLanguageCode: "pt-PT", // required
                    Settings: { // TranslationSettings required
                        Formality: "INFORMAL",
                        Brevity: "ON",
                    }
                })
            );
            return data;
        
          } catch (error) {
            console.log(error)
          } 
    }

    async main(event) {
        
        try {
            const { imageUrl } = event.queryStringParameters
            if(!imageUrl) {
                return {
                    statusCode : 400,
                    body : "image as empty!"
                }
            }
            const buffer        = await this.getImage(imageUrl)
            const resultLabel   = await this.detectImgLabels(buffer)
          
            
            const results = resultLabel.Labels
                            .filter( data => data.Confidence > 80)
                            .map( data => `${data.Confidence}%. ${data.Name}` )

            const translateText     = await this.translateTxt(results.join("\n"))
            
            return {
                statusCode  : 200,
                body        : translateText.TranslatedText
            }

        }
        catch(e) {
            
            return {
                statusCode : 500,
                body : "Internal server error!"
            }
        }

    }

}