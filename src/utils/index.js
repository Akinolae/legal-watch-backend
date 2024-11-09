const getValueFromAttributes = (attributes, params) => {
  return attributes.find((user) => user.Name === params).Value;
};

const preparedData = (user) => {
  return {
    lastName: getValueFromAttributes(user, "custom:lastName"),
    user_id: getValueFromAttributes(user, "sub"),
    email: getValueFromAttributes(user, "email"),
    gender: getValueFromAttributes(user, "gender"),
    firstName: getValueFromAttributes(user, "custom:firstName"),
    phone_number: getValueFromAttributes(user, "phone_number"),
    verified: Boolean(getValueFromAttributes(user, "email_verified")),
  };
};

module.exports = {
  preparedData,
};
