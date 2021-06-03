const Joi = require('joi');


const schema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required(),

  access_token: [
    Joi.string(),
    Joi.number()
  ],

})


const result = schema.validate({ username: '1', access_token: 1994 });
console.log(result)
