import { User, PrismaClient } from '@prisma/client'
import { v2 as Cloudinary } from 'cloudinary'
import { Request } from 'express'
import { ContextParameters } from 'graphql-yoga/dist/types'

export interface ContextType extends ContextParameters {
  cloudinary: typeof Cloudinary
  prisma: PrismaClient
  request: Request & { currentUser?: User; currentUserId?: string }
}
