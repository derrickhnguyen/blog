import { homedir } from 'os'
import { GraphQLServer } from 'graphql-yoga'
import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import expressJwt from 'express-jwt'
import cors, { CorsOptions } from 'cors'
import { Request, Response } from 'express'
import { PrismaClient, User } from '@prisma/client'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import passport from 'passport'
import { schema } from './schema'
import { ContextType } from './contextTypes'
import initPassport from './initPassport'
import csrf from 'csurf'

const prisma = new PrismaClient()
const port = 8000
const configPath = `${homedir()}/blog.config.env`
const { parsed: envVariables } = dotenv.config({ path: configPath })

if (!envVariables) {
  throw new Error(
    `Unable to parse environment variables from path ${configPath}`,
  )
}

const corsOptions: CorsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
}

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  FB_CLIENT_ID,
  FB_CLIENT_SECRET,
  JWT_SECRET,
} = envVariables

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
})

const server = new GraphQLServer({
  /* eslint-disable @typescript-eslint/no-explicit-any */
  schema: schema as any,
  context: (request: any): ContextType => ({
    ...request,
    prisma,
    cloudinary,
  }),
})

initPassport({
  fbClientId: FB_CLIENT_ID,
  fbClientSecret: FB_CLIENT_SECRET,
  prisma,
})

const checkJwt = expressJwt({
  credentialsRequired: false,
  secret: JWT_SECRET,
  issuer: 'api.blog',
  audience: 'api.blog',
  algorithms: ['HS256'],
  getToken: (req: Request) => req.cookies?.blogJwtToken,
}).unless({
  path: ['/auth/facebook/token', '/auth/signout', '/auth/csrf-token'],
})

const csrfProtection = csrf({ cookie: true })

server.use(cors(corsOptions))
server.use(cookieParser())
server.use(bodyParser.urlencoded({ extended: true }))
server.use(passport.initialize())
server.use(checkJwt)
server.use(csrfProtection)

server.get('/auth/csrf-token', (req: any, res: any) => {
  res.json({ csrf: req.csrfToken() })
})

server.post(
  '/auth/facebook/token',
  passport.authenticate('facebook-token'),
  (req: Request, res: Response) => {
    const currentUser = req.user

    const isPrismaUser = (user: unknown): user is User =>
      user && typeof user === 'object' && !!('id' in user)

    if (!isPrismaUser(currentUser)) {
      return res
        .status(401)
        .json({ success: false, message: 'Unable to authorize user.' })
    }

    const token = jwt.sign({ sub: currentUser.id }, JWT_SECRET, {
      issuer: 'api.blog',
      audience: 'api.blog',
      algorithm: 'HS256',
      expiresIn: '1h',
    })

    return res
      .cookie('blogJwtToken', token, { httpOnly: true })
      .status(200)
      .json({ success: true, message: 'User is authorized.' })
  },
)

server.post('/auth/signout', (req: Request, res: Response) => {
  res
    .clearCookie('blogJwtToken')
    .json({ success: true, message: 'Successfully logged out.' })
})

server.start(
  {
    cors: corsOptions,
    endpoint: '/graphql',
    playground: '/playground',
    getEndpoint: true,
    port,
  },
  () => {
    console.log(`🚀 Server ready at: http://localhost:${port} ⭐️`)
  },
)
