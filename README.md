# Node HTTP API with aws.rekognition on AWS

This template demonstrates how to make a simple HTTP API with Node.js running on AWS Lambda, API Gateway and API Rekognition using the Serverless Framework.

This template does not include any kind of persistence (database).

## Usage

### Deployment

In order to deploy the example, you need to run the following command:

```
serverless deploy
```

After running deploy, you should see output similar to:

```
Deploying "serverless-http-api" to stage "dev" (us-east-1)

✔ Service deployed to stack serverless-http-api-dev (91s)

endpoint: GET - https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/
functions:
  hello: serverless-http-api-dev-hello (1.6 kB)
```

_Note_: In current form, after deployment, your API is public and can be invoked by anyone. For production deployments, you might want to configure an authorizer.

### Invocation

After successful deployment, you can call the created application via HTTP:

```
curl https://xxxxxxx.execute-api.us-east-1.amazonaws.com?imageURL=https://beecrowd.com/wp-content/uploads/2024/04/2022-07-26-Coisas-importantes-que-um-programador-deve-saber.jpg
```

Which should result in response similar to:

```json
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
  "82.78709411621094%. Poster"
```
> [!NOTE]
> Only values ​​that have a confidence level greater than 80 will be returned.

### Local development

The easiest way to develop and test your function is to use the `dev` command:

```
serverless dev
```

This will start a local emulator of AWS Lambda and tunnel your requests to and from AWS Lambda, allowing you to interact with your function as if it were running in the cloud.

Now you can invoke the function as before, but this time the function will be executed locally. Now you can develop your function locally, invoke it, and see the results immediately without having to re-deploy.

When you are done developing, don't forget to run `serverless deploy` to deploy the function to the cloud.
