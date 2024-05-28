import { Router } from "express";
import { getProspects, getProspectById, createProspect, updateProspect, deleteProspect, createProspectForm } from "../controllers/prospects.controller.js";
import advisorExtractor from '../middleware/advisorExtractor.js'

const router = Router()

router.get('/prospects', advisorExtractor, getProspects)

router.get('/prospects/:id', advisorExtractor, getProspectById)

router.post('/prospects', createProspect)

router.post('/prospects/create', createProspectForm)

router.patch('/prospects/:id',  advisorExtractor, updateProspect)

router.delete('/prospects/:id',  advisorExtractor, deleteProspect)


export default router