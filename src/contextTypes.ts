import { PrismaClient } from '@prisma/client'
import { v2 as Cloudinary } from 'cloudinary'
import { Request } from 'express'
import { ContextParameters } from 'graphql-yoga/dist/types'

export interface ContextType extends Omit<ContextParameters, 'request'> {
  cloudinary: typeof Cloudinary
  prisma: PrismaClient
  request: Omit<Request, 'user'> & { user: { sub: string } }
}
