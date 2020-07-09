import { objectType } from '@nexus/schema'
import { Node, NodeType, User, UserType } from './interfaces'

export interface RegularUserType extends NodeType, UserType {}

export const RegularUser = objectType({
  name: 'RegularUser',
  definition: t => {
    t.implements(Node, User)
  },
})
