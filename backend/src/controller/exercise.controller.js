import exerciseModel from "../models/exercise.model.js";

export async function getExercises(req, res) {
  const exercises = await exerciseModel.find({
    $or: [{ creatorId: null }, { creatorId: req.user._id }],
  });

  res.status(200).json({
    success: true,
    exercises: exercises,
  });
}
export async function createExercise(req, res) {
  const { name, category } = req.body;
  const createExercise = await exerciseModel.create({
    name,
    category,
    creatorId: req.user._id,
  });
  res.status(201).json({
    success: true,
    Exercise: createExercise,
  });
}
