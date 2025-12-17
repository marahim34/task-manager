const Joi = require('joi');

const createTaskSchema = Joi.object({
    title: Joi.string()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.min': 'Title must be at least 3 characters',
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Title is required'
    }),
    description: Joi.string()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
    status: Joi.string()
    .valid('pending', 'in-progress', 'completed')
    .optional()
    .messages({
      'any.only': 'Status must be one of: pending, in-progress, completed'
    }),
    priority: Joi.string()
    .valid('low', 'medium', 'high')
    .optional()
    .messages({
      'any.only': 'Priority must be one of: low, medium, high'
    }),
    category: Joi.string()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Category cannot exceed 50 characters'
    }),
    dueDate: Joi.date()
    .iso()
    .min('now')
    .optional()
    .messages({
      'date.min': 'Due date cannot be in the past',
      'date.format': 'Due date must be a valid ISO date'
    }),
    completed: Joi.boolean()
    .optional()
});

const updateTaskSchema = Joi.object({
    title: Joi.string()
    .min(3)
    .max(200)
    .optional()
    .messages({
      'string.min': 'Title must be at least 3 characters',
      'string.max': 'Title cannot exceed 200 characters'
    }),
    description: Joi.string()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
    status: Joi.string()
    .valid('pending', 'in-progress', 'completed')
    .optional()
    .messages({
      'any.only': 'Status must be one of: pending, in-progress, completed'
    }),
    priority: Joi.string()
    .valid('low', 'medium', 'high')
    .optional()
    .messages({
      'any.only': 'Priority must be one of: low, medium, high'
    }),
    category: Joi.string()
    .max(50)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Category cannot exceed 50 characters'
    }),
    dueDate: Joi.date()
    .iso()
    .optional()
    .allow(null)
    .messages({
      'date.format': 'Due date must be a valid ISO date'
    }),
    completed: Joi.boolean()
    .optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
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
  validateCreateTask: validate(createTaskSchema),
  validateUpdateTask: validate(updateTaskSchema)
};
