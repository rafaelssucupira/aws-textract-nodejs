import { SESClient, SendRawEmailCommand } from "@aws-sdk/client-ses";

export const send = async (event) => {
  const [record] = event.Records;
  const data = JSON.parse(record.body);

  // Converta o conteúdo do anexo para JSON e codifique em Base64
  const attachment = JSON.stringify(data.respAWS, null, 2);
  const attachmentBuffer = Buffer.from(attachment).toString("base64");

  // Construa a mensagem MIME
  const raw = `From: PixBot@elections.app.br\nTo: rafaelssucupira@gmail.com\nSubject: ${data.msg}\nMIME-Version: 1.0\nContent-type: Multipart/Mixed; boundary="NextPart"\n\n--NextPart\nContent-Type: text/plain\n\n${JSON.stringify(data.pattern,null,2)}\n\n--NextPart\nContent-Type: application/json;\nContent-Description: pattern.json\nContent-Disposition: attachment; filename="aws-response.txt"\nContent-Transfer-Encoding: base64\n\n${attachmentBuffer}\n\n--NextPart--`
  const ses = new SESClient({ region: "us-east-1" });
  const command = new SendRawEmailCommand({
    RawMessage: {
      Data: raw, // Substitui quebras de linha para evitar problemas
    },
  });

  try {
    const result = await ses.send(command);
    console.log("E-mail enviado com sucesso:", result);
  } catch (error) {
    console.error("Erro ao enviar o e-mail:", error);
  }
};


