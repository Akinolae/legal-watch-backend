require("dotenv").config();

const {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
  ConfirmSignUpCommand,
  GetUserCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

const cognito = new CognitoIdentityProviderClient({
  apiVersion: "latest",
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRETE_ACCESS_KEY,
  },
});

const comonParams = {
  ClientId: process.env.clientId,
};

const cognitoApifn = async (command, args) => {
  const cognitoCommand = new command({ ...args });

  try {
    return await cognito.send(cognitoCommand);
  } catch (error) {
    throw error;
  }
};

const cognitoUserSignUp = async (args) => {
  const { input, attributes } = args;

  await cognitoApifn(SignUpCommand, {
    ...comonParams,
    Password: input.password,
    Username: input.email,
    UserAttributes: attributes,
  });
};

const cognitoSignIn = async (args) => {
  const { email, password } = args;

  const command = new InitiateAuthCommand({
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: comonParams.ClientId,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  });

  return await cognito.send(command);
};

const confirmUserSignUp = async (args) => {
  const { Username, ConfirmationCode } = args;

  return await cognitoApifn(ConfirmSignUpCommand, {
    ...comonParams,
    Username,
    ConfirmationCode,
  });
};

const prepareSignUpData = (params) => {
  return [
    {
      Name: "custom:firstName",
      Value: params.firstName,
    },
    {
      Name: "custom:lastName",
      Value: params.lastName,
    },
    {
      Name: "gender",
      Value: params.gender,
    },
    {
      Name: "phone_number",
      Value: params.phoneNumber,
    },
  ];
};

const getUserDetails = async (args) => {
  const { AccessToken } = args;
  const command = new GetUserCommand({ AccessToken });
  return await cognito.send(command);
};

const generateNewToken = async (args) => {
  const command = new InitiateAuthCommand({
    AuthFlow: "REFRESH_TOKEN_AUTH",
    ClientId: comonParams.ClientId,
    AuthParameters: {
      REFRESH_TOKEN: args,
    },
  });

  return await cognito.send(command);
};

const forgotPassword = async ({ email }) => {
  await cognitoApifn(ForgotPasswordCommand, {
    ...comonParams,
    Username: email,
  });
};

const confirmForgotPassword = async (args) => {
  await cognitoApifn(ConfirmForgotPasswordCommand, {
    ...comonParams,
    ConfirmationCode: args.code,
    Password: args.password,
    Username: args.email,
  });
};

module.exports = {
  cognitoUserSignUp,
  prepareSignUpData,
  cognitoSignIn,
  confirmUserSignUp,
  getUserDetails,
  generateNewToken,
  forgotPassword,
  confirmForgotPassword,
};
