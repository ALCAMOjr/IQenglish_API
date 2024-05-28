import { Router } from "express";
import advisorExtractor from '../middleware/advisorExtractor.js'
import { getReviews, getReviewById, createReview, updateReview, deleteReview } from '../controllers/reviews.controller.js';

const router = Router()

router.get('/reviews', getReviews)

router.get('/reviews/:id', getReviewById)

router.post('/reviews', createReview)

router.patch('/reviews/:id', advisorExtractor, updateReview)

router.delete('/reviews/:id', advisorExtractor, deleteReview)


export default router
