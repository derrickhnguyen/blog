import { objectType } from '@nexus/schema'
import { NodeType, User, UserType, Node } from './interfaces'

export interface CurrentUserType extends NodeType, UserType {}

export const CurrentUser = objectType({
  name: 'CurrentUser',
  definition: t => {
    t.implements(Node, User)
  },
})
