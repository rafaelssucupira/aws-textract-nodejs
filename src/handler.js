const { DetectLabelsCommand } = require("@aws-sdk/client-rekognition");

module.exports = class Handler {
    constructor( { rekoSvc } ) 
        {
            this.rekoSvc = rekoSvc
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
            
            return {
                statusCode  : 200,
                body        : results.join("\n")
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