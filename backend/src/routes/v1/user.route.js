import {Router} from 'express'

const router = Router()

router.route('/register').post()
router.route('/login').post()
router.route('/logout')

export default router