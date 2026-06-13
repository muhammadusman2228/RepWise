import mongoose from 'mongoose'

const setSchema = new mongoose.Schema({
  reps: {
    type: Number,
    required: true,
    min: [0, 'Reps cannot be negative']
  },
  weight: {
    type: Number,
    required: true,
    min: [0, 'Weight cannot be negative']
  },
  rpe: {
    type: Number,
    min: [1, 'RPE cannot be less than 1'],
    max: [10, 'RPE cannot exceed 10'],
    default: null
  },
  completed: {
    type: Boolean,
    default: true
  }
});

const loggedExerciseSchema = new mongoose.Schema({
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  sets: [setSchema]
});

const workoutSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    default: 'New Workout Session',
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number,
    default: 0
  },
  exercises: [loggedExerciseSchema]
}, { timestamps: true });
const workoutModel = mongoose.model('Workout', workoutSchema);
export default workoutModel
