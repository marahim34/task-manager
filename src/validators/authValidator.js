const Joi = require("joi");

const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "Please provide a valid email address",
      "any.required": "Email is required",
    }),

  password: Joi.string()
    .min(8)
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters",
      "any.required": "Password is required",
    }),

  name: Joi.string()
    .min(2)
    .required()
    .messages({
      "string.min": "Name must be at least 2 characters",
      "any.required": "Name is required",
    }),

  role: Joi.string().valid("regular", "admin").optional(),
});


const loginSchema = Joi.object({
    email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
    password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors 
      });
    }
    
    next();
  };
};

module.exports = {
  validateRegister: validate(registerSchema),
  validateLogin: validate(loginSchema)
};