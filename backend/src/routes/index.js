import v1Routes from './v1/index.js'
import { Router } from 'express'

const router = Router()

router.use('/v1',v1Routes)