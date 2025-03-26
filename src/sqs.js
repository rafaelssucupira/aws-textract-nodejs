
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

export const resolve = async (event) => {
  
  const data = JSON.parse(event.Records[0].body.msg);
  const ses = new SESClient({});
  const command = new SendEmailCommand({
    Source : "PixBot@elections.app.br",
    Destination : {
      ToAddresses : [
        "rafaelssucupira@gmail.com"
      ]
    },
    Message: { 
      Subject: { 
        Data: data.msg,
      },
      Body: { 
        Text: {
          Data: `${JSON.stringify(event.Records[0],null,2)}`, // required
        }
      },
    },
  })


  const result = await ses.send(command)
  console.log("result", result);

}

  