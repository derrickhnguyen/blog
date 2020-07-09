import { enumType } from '@nexus/schema'

export enum ErrorCodeEnumType {
  BadRequest = 'BadRequest',
  Conflict = 'Conflict',
  InternalServer = 'InternalServer',
  Unauthorized = 'Unauthorized',
  Forbidden = 'Forbidden',
  NotFound = 'NotFound',
}

export const ErrorCodeEnum = enumType({
  name: 'ErrorCodeEnum',
  members: [
    'BadRequest',
    'Conflict',
    'InternalServer',
    'Unauthorized',
    'Forbidden',
    'NotFound',
  ],
})
