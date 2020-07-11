import { GraphQLServer } from 'graphql-yoga'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import cors, { CorsOptions } from 'cors'
import { NextFunction, Request, Response } from 'express'
import { PrismaClient, User } from '@prisma/client'
import { ContextParameters } from 'graphql-yoga/dist/types'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import passport from 'passport'
import { schema } from './schema'
import { ContextType } from './contextTypes'
import initPassport from './initPassport'

const prisma = new PrismaClient()
const port = 3000
const configPath = '/blog.config.env'
const { parsed } = dotenv.config({ path: configPath })

if (!parsed) {
  throw new Error(
    `Unable to parse environment variables from path ${configPath}`,
  )
}

const corsOptions: CorsOptions = {
  origin: 'http://localhost:8000',
  credentials: true,
}

const { FB_CLIENT_ID, FB_CLIENT_SECRET, JWT_SECRET } = parsed

const server = new GraphQLServer({
  /* eslint-disable @typescript-eslint/no-explicit-any */
  schema: schema as any,
  context: (request: ContextParameters): ContextType => ({
    ...request,
    prisma,
  }),
})

initPassport({
  fbClientId: FB_CLIENT_ID,
  fbClientSecret: FB_CLIENT_SECRET,
  prisma,
})

server.use(cors(corsOptions))
server.use(cookieParser())
server.use(bodyParser.urlencoded({ extended: true }))
server.use(passport.initialize())

server.use(
  (
    req: Request & { currentUserId?: number },
    res: Response,
    next: NextFunction,
  ) => {
    const { blogJwtToken } = req.cookies

    if (!blogJwtToken) {
      return next()
    }

    const jwtResponse = jwt.verify(blogJwtToken, JWT_SECRET)

    const containsUserId = (obj: unknown): obj is { currentUserId: number } =>
      obj && typeof obj === 'object' && !!('currentUserId' in obj)

    if (!containsUserId(jwtResponse)) {
      return next()
    }

    req.currentUserId = jwtResponse.currentUserId

    return next()
  },
)

server.use(
  async (
    req: Request & { currentUser?: User | null; currentUserId?: number },
    res: Response,
    next: NextFunction,
  ) => {
    if (typeof req.currentUserId !== 'number') {
      return next()
    }

    const user = await prisma.user.findOne({
      where: { id: req.currentUserId },
    })

    req.currentUser = user

    return next()
  },
)

server.get(
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

    const token = jwt.sign({ currentUserId: currentUser.id }, JWT_SECRET)

    return res
      .cookie('blogJwtToken', token, {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie
      })
      .status(200)
      .json({ success: true, message: 'User is authorized.' })
  },
)

server.get('/auth/signout', (req: Request, res: Response) => {
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
    console.log(`🚀 Server ready at: http://localhost:${port}\n⭐️`)
  },
)
