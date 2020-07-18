import { enumType } from '@nexus/schema'

export enum UserPostsOrderByEnumType {
  CreatedAtAscending = 'CreatedAtAscending',
  CreatedAtDescending = 'CreatedAtDescending',
}

export const UserPostsOrderByEnum = enumType({
  name: 'UserPostsOrderByEnum',
  members: ['CreatedAtAscending', 'CreatedAtDescending'],
})
