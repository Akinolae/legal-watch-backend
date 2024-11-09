const router = require("express").Router();
const { authSchema } = require("../validator/index");
const { StatusCodes } = require("http-status-codes");
const {
  cognitoUserSignUp,
  prepareSignUpData,
  cognitoSignIn,
  confirmUserSignUp,
  getUserDetails,
  confirmForgotPassword,
  forgotPassword,
} = require("../../lib/aws");
const { preparedData } = require("../utils");

router.get(`/users`, (req, res) => {
  console.log({ req, res });
});

router.post(`/register`, async (req, res) => {
  const { body } = req;
  const validate = authSchema.validate(body);

  if (!!validate.error) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      success: false,
      message: validate.error.details[0].message,
    });
    return;
  }

  try {
    await cognitoUserSignUp({
      input: body,
      attributes: prepareSignUpData(body),
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "User registered",
    });
  } catch (error) {
    res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      message: error.message,
    });
  }
});

router.post(`/login`, async (req, res) => {
  const { body } = req;
  if (!body.email || !body.password) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      success: false,
      message: "Invalid login parameters",
    });
    return;
  }
  try {
    const userData = await cognitoSignIn({
      ...body,
    });

    let refreshToken, accessToken;

    accessToken = userData.AuthenticationResult.AccessToken;
    refreshToken = userData.AuthenticationResult.RefreshToken;

    const userDataFromToken = await getUserDetails({
      AccessToken: accessToken,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Login successful",
      data: {
        ...preparedData(userDataFromToken.UserAttributes),
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: error.message,
    });
  }
});

router.post(`/confirmEmail`, async (req, res) => {
  const { body } = req;
  if (!body.email || !body.code) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      success: false,
      message: "Email and verification code required",
    });
    return;
  }
  try {
    const userData = await confirmUserSignUp({
      Username: body.email,
      ConfirmationCode: body.code,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: error.message,
    });
  }
});

router.post(`/forgotPassword`, async (req, res) => {
  const { body } = req;
  if (!body.email) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      success: false,
      message: "Email is required",
    });
    return;
  }
  try {
    await forgotPassword({
      email: body.email,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Verification code sent to provided email",
    });
  } catch (error) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: error.message,
    });
  }
});

router.post(`/changePassword`, async (req, res) => {
  const { body } = req;
  if (!body.email || !body.password || !body.code) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      success: false,
      message: "All fields are required",
    });
    return;
  }
  try {
    await confirmForgotPassword({
      ...body,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(StatusCodes.UNAUTHORIZED).json({
      success: false,
      message: error.message,
    });
  }
});

router;

module.exports = router;
