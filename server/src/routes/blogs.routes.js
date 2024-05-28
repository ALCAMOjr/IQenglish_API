import { Router } from "express";
import advisorExtractor from '../middleware/advisorExtractor.js'
import { getBlogs, getBlogById, createBlog, updateBlog, deleteBlog } from '../controllers/blogs.controller.js';

const router = Router()

router.get('/blogs', getBlogs)

router.get('/blogs/:id', getBlogById)

router.post('/blogs', advisorExtractor, createBlog)

router.patch('/blogs/:id', advisorExtractor, updateBlog)

router.delete('/blogs/:id', advisorExtractor, deleteBlog)


export default router
