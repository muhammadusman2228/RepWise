import {Router} from 'express'
import { protect } from '../middleware/auth.middleware.js';
import validate from '../middleware/validation.middleware.js';
import { workoutSchema } from '../validator/workout.validator.js';
import { deleteWorkout, getWorkouts, workout } from '../controller/workout.controller.js';


const route = Router()



route.post('/',protect,validate(workoutSchema),workout)
route.get('/',protect,getWorkouts)
route.delete('/:id',protect,deleteWorkout)

export default route