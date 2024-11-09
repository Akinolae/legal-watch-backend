const joi = require("joi");

const authSchema = joi.object({
  firstName: joi.string().trim().required(),
  lastName: joi.string().trim().required(),
  gender: joi.string().trim().required(),
  phoneNumber: joi.string().trim().required(),
  email: joi
    .string()
    .trim()
    .email({ tlds: { allow: ["com", "ai"] } })
    .required(),
  password: joi.string().min(8).max(16).trim().required(),
});

module.exports = { authSchema };
