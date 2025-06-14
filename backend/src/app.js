import express, { json } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import routes from './routes/index.js'

const app = express()

app.use(json())
app.use(cookieParser())
app.use(cors({
  origin: "*",
  credentials: true,               
}))


app.use('/api',routes)

export {app}