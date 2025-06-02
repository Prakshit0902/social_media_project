import express, { json } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app = express()

app.use(json())
app.use(cookieParser())
app.use(cors())

export {app}