import express from 'express'
import prospectsRoutes from './routes/prospects.routes.js'
import advisorsRoutes from './routes/advisors.routes.js'
import reviewsRoutes from './routes/reviews.routes.js'
import cors from "cors";
const app = express()


app.use(cors());
app.use(express.json())
app.use('/api', prospectsRoutes)
app.use('/api', advisorsRoutes)
app.use('/api', reviewsRoutes)

export { app };
