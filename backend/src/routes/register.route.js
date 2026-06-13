

import {Router} from 'express'
import { registerUser,verifyMe ,login,  refresh,me} from '../controller/auth.controller.js';

import {protect} from '../middleware/auth.middleware.js'
import validate from '../middleware/validation.middleware.js';
import { loginSchema, registerSchema } from '../validator/auth.validator.js';
const route = Router()



route.post('/register',validate(registerSchema),registerUser)
route.get('/verifyMe',verifyMe)

route.post('/login',validate(loginSchema),login)
route.get('/refresh',refresh)
route.get('/me',protect,me)

export default route