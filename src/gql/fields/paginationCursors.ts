import { objectType } from '@nexus/schema'

export interface PaginationCursorsType {
  startCursor?: string
  endCursor?: string
}

export const PaginationCursors = objectType({
  name: 'PaginationCursors',
  definition: t => {
    t.string('startCursor', {
      nullable: true,
      resolve: (root: any) => {
        const containsStartCursor = (
          root: any,
        ): root is PaginationCursorsType => !!('startCursor' in root)

        return containsStartCursor(root) && typeof root.startCursor === 'string'
          ? root.startCursor
          : null
      },
    })

    t.string('endCursor', {
      nullable: true,
      resolve: (root: any) => {
        const containsEndCursor = (root: any): root is PaginationCursorsType =>
          !!('endCursor' in root)

        return containsEndCursor(root) && typeof root.endCursor === 'string'
          ? root.endCursor
          : null
      },
    })
  },
})
