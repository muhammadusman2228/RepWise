


import {Router} from "express"
import { protect } from "../middleware/auth.middleware.js";
import { createExercise, getExercises } from "../controller/exercise.controller.js";
import validate from "../middleware/validation.middleware.js";
import { exerciseSchema } from "../validator/auth.validator.js";


const route = Router()


route.get('/',protect,getExercises)
route.post('/',protect,validate(exerciseSchema),createExercise)

export default route
