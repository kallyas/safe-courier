const joi = require("joi");
// validate signup fields
const signUpCheck = (data) => {
  const validateSchema = joi.object({
    username: joi.string().min(4).required(),
    email: joi.string().min(4).required().email(),
    password: joi.string().min(4).required(),
  });
  return validateSchema.validate(data);
};

//validate login fields
const loginCheck = (data) => {
  const validateSchema = joi.object({
    username: joi.string().min(4).required(),
    password: joi.string().min(4).required(),
  });
  return validateSchema.validate(data);
};

const parcelCheck = (data) => {
  const validateSchema = joi.object({
    parcelType: joi.string().required(),
    sender: joi.string().required(),
    locationFrom: joi.string().required(),
    locationTo: joi.string().required(),
    weight: joi.number().required()
  })
  return validateSchema.validate(data)
}

module.exports.signUpCheck = signUpCheck;
module.exports.loginCheck = loginCheck;
module.exports.parcelCheck = parcelCheck;
