import express from 'express'
import prospectsRoutes from './routes/prospects.routes.js'
import advisorsRoutes from './routes/advisors.routes.js'
import blogsRoutes from './routes/blogs.routes.js'
import reviewsRoutes from './routes/reviews.routes.js'
import dotenv from 'dotenv'
import cors from "cors";
const app = express()



dotenv.config()


app.use(cors());
app.use(express.json())
app.use('/api', prospectsRoutes)
app.use('/api', advisorsRoutes)
app.use('/api', blogsRoutes)
app.use('/api', reviewsRoutes)

app.use((req, res, next) => {
    res.status(404).json({
        message: 'endpoint not found'
    })
})


export default app;