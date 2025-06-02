import connectDB from './config/db/index.js'
import { app } from './app.js'
import dotenv from 'dotenv'

dotenv.config()

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`server is running on port : ${process.env.PORT}`)
    })
})
.catch((err) => {
    console.log('monogo db connection failed')
    
})