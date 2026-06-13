import workoutModel from "../models/workout.model.js";

export async function workout(req, res) {
  const { name, duration, date, exercises } = req.body;

  const workout = await workoutModel.create({
    userId: req.user._id,
    name,
    duration,
    date,
    exercises,
  });
  res.status(201).json({
    success: true,
    workout: workout,
  });
}
export async function getWorkouts(req, res) {
  const workouts = await workoutModel
    .find({ userId: req.user._id })
    .sort({ date: -1 });
  res.status(200).json({
    success: true,
    workouts: workouts,
  });
}
export async function deleteWorkout(req, res) {
  const workoutId = req.params.id;
  const workout = await workoutModel.findById(workoutId);
  if (!workout) {
    return res.status(404).json({
      success: false,
    });
  }
  if (workout.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to delete this workout",
    });
  }
  await workoutModel.findByIdAndDelete(workoutId);

  res.status(200).json({
    success: true,
  });
}
