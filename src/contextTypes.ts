import { User, PrismaClient } from '@prisma/client'
import { Request } from 'express'
import { ContextParameters } from 'graphql-yoga/dist/types'

export interface ContextType extends ContextParameters {
  prisma: PrismaClient
  request: Request & { currentUser?: User; currentUserId?: string }
}
