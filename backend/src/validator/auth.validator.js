import Joi from 'joi'


const registerSchema=Joi.object({
    name:Joi.string().min(3).max(30).required(),
    username: Joi.string().alphanum().min(3).max(30).required(),

  email: Joi.string().email().required(),

  password: Joi.string()
    .min(8)
    .pattern(/[A-Z]/)
    .pattern(/[a-z]/)
    .pattern(/[0-9]/)
    .pattern(/[^A-Za-z0-9]/)
    .required()})

const loginSchema = Joi.object({
        email: Joi.string().email().required(),

  password: Joi.string()
    .min(8)
    .pattern(/[A-Z]/)
    .pattern(/[a-z]/)
    .pattern(/[0-9]/)
    .pattern(/[^A-Za-z0-9]/)
    .required()
})

const exerciseCategories = [
  "chest",
  "shoulder",
  "cardio",
  "back",
  "leg",
  "arms",
  "core",
  "olympics",
  "others",
];

const exerciseSchema = Joi.object({
  name: Joi.string().required().trim().min(2).max(50),
  category: Joi.string()
    .required()
    .valid(...exerciseCategories),
  creatorId: Joi.string(),
});
export {registerSchema,loginSchema,exerciseSchema}
