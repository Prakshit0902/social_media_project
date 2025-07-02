  import express, { json } from 'express'
  import cookieParser from 'cookie-parser'
  import cors from 'cors'
  import routes from './routes/index.js'

  const app = express()
  const allowedOrigins = ["http://localhost:5173","http://192.168.252.186:5173"]

  app.use(json())
  app.use(cookieParser())
  app.use(cors({
    origin:  function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,               
  }))

  // app.use((req, res, next) => {
  //   console.log(`${req.method} ${req.path}`, {
  //     cookies: req.cookies,
  //     origin: req.headers.origin
  //   });
  //   next();
  // })

  app.use('/api',routes)

  export {app}