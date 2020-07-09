import { objectType } from '@nexus/schema'
import { Node, NodeType, User, UserType } from './interfaces'

export interface CurrentUserType extends NodeType, UserType {}

export const CurrentUser = objectType({
  name: 'CurrentUser',
  definition: t => {
    t.implements(Node, User)
  },
})
