import { login, deleteAdvisors, getAllAdvisors, updateAdvisors, registerUser, verify} from "../controllers/advisors.controller.js";
import { Router } from "express";
import advisorExtractor from '../middleware/advisorExtractor.js'

const router = Router()

router.get('/advisors',advisorExtractor, getAllAdvisors)

router.post('/advisors/login', login)

router.post('/advisors/register', advisorExtractor, registerUser)

router.patch('/advisors/:id',advisorExtractor, updateAdvisors)

router.delete('/advisors/:id',advisorExtractor, deleteAdvisors)

router.post('/advisors/:id',advisorExtractor, deleteAdvisors)

router.post('/advisor/verify', verify)

export default router