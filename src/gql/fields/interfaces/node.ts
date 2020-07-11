import { interfaceType } from '@nexus/schema'

export interface NodeType {
  id: string
}

export const Node = interfaceType({
  name: 'Node',
  definition: t => {
    t.id('id', {
      resolve: root => {
        const containsId = (root: any): root is { id: string } =>
          !!('id' in root)

        return containsId(root) ? root.id : ''
      },
    })

    t.resolveType(() => null)
  },
})
