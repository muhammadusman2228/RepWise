

import Joi from "joi";

const workoutSchema = Joi.object({
  name: Joi.string().default("New Workout Session").trim(),
  duration: Joi.number().min(0).default(0),
  date: Joi.date().default(Date.now),
  exercises: Joi.array()
    .items(
      Joi.object({
        exerciseId: Joi.string()
          .pattern(/^[0-9a-fA-F]{24}$/)
          .required()
          .messages({
            "string.pattern.base":
              "exerciseId must be a valid MongoDB ObjectId",
          }),
        name: Joi.string().required(),
        sets: Joi.array()
          .items(
            Joi.object({
              reps: Joi.number().min(0).required(),
              weight: Joi.number().min(0).required(),
              rpe: Joi.number().min(1).max(10).optional().allow(null),
              completed: Joi.boolean().default(true),
            }),
          )
          .min(1)
          .required(),
      }),
    )
    .min(1)
    .required(),
});

export { workoutSchema };
