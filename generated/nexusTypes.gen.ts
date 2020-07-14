/**
 * This file was generated by Nexus Schema
 * Do not make changes to this file directly
 */


import { core } from "@nexus/schema"
declare global {
  interface NexusGenCustomInputMethods<TypeName extends string> {
    date<FieldName extends string>(fieldName: FieldName, opts?: core.ScalarInputFieldConfig<core.GetGen3<"inputTypes", TypeName, FieldName>>): void // "Date";
  }
}
declare global {
  interface NexusGenCustomOutputMethods<TypeName extends string> {
    date<FieldName extends string>(fieldName: FieldName, ...opts: core.ScalarOutSpread<TypeName, FieldName>): void // "Date";
  }
}


declare global {
  interface NexusGen extends NexusGenTypes {}
}

export interface NexusGenInputs {
  GetCurrentUserPostInput: { // input type
    postId: string; // ID!
  }
  UpdatableCurrentUserInformationInput: { // input type
    bio?: string | null; // String
    firstName?: string | null; // String
    lastName?: string | null; // String
  }
  UpdateCurrentUserInformationInput: { // input type
    updatableCurrentUserInformation: NexusGenInputs['UpdatableCurrentUserInformationInput']; // UpdatableCurrentUserInformationInput!
  }
  UpdateCurrentUserPostContentInput: { // input type
    postContent: any; // JSON!
    postId: string; // ID!
  }
  UpdateCurrentUserPostTitleInput: { // input type
    postId: string; // ID!
    postTitle: string; // String!
  }
  UserPostsInput: { // input type
    after?: string | null; // String
    limit?: number | null; // Int
  }
}

export interface NexusGenEnums {
  ErrorCodeEnum: "BadRequest" | "Conflict" | "Forbidden" | "InternalServer" | "NotFound" | "Unauthorized"
}

export interface NexusGenRootTypes {
  CreateCurrentUserPostPayload: { // root type
    post?: NexusGenRootTypes['Post'] | null; // Post
    userErrors?: NexusGenRootTypes['UserError'][] | null; // [UserError!]
  }
  CurrentUser: {};
  GetCurrentUserPayload: { // root type
    currentUser?: NexusGenRootTypes['CurrentUser'] | null; // CurrentUser
    successful: boolean; // Boolean!
    userErrors?: NexusGenRootTypes['UserError'][] | null; // [UserError!]
  }
  GetCurrentUserPostPayload: { // root type
    post?: NexusGenRootTypes['Post'] | null; // Post
    userErrors?: NexusGenRootTypes['UserError'][] | null; // [UserError!]
  }
  Mutation: {};
  Post: { // root type
    content?: any | null; // JSON
    updatedAt?: any | null; // Date
  }
  Query: {};
  RegularUser: {};
  UpdateCurrentUserInformationPayload: { // root type
    user?: NexusGenRootTypes['RegularUser'] | null; // RegularUser
    userErrors?: NexusGenRootTypes['UserError'][] | null; // [UserError!]
  }
  UpdateCurrentUserPostContentPayload: { // root type
    post?: NexusGenRootTypes['Post'] | null; // Post
    userErrors?: NexusGenRootTypes['UserError'][] | null; // [UserError!]
  }
  UpdateCurrentUserPostTitlePayload: { // root type
    post?: NexusGenRootTypes['Post'] | null; // Post
    userErrors?: NexusGenRootTypes['UserError'][] | null; // [UserError!]
  }
  UserError: { // root type
    code: NexusGenEnums['ErrorCodeEnum']; // ErrorCodeEnum!
    message: string; // String!
  }
  UserPosts: {};
  UserProfile: {};
  Node: NexusGenRootTypes['CurrentUser'] | NexusGenRootTypes['Post'] | NexusGenRootTypes['RegularUser'];
  User: NexusGenRootTypes['CurrentUser'] | NexusGenRootTypes['RegularUser'];
  String: string;
  Int: number;
  Float: number;
  Boolean: boolean;
  ID: string;
  Date: any;
  Email: any;
  JSON: any;
}

export interface NexusGenAllTypes extends NexusGenRootTypes {
  GetCurrentUserPostInput: NexusGenInputs['GetCurrentUserPostInput'];
  UpdatableCurrentUserInformationInput: NexusGenInputs['UpdatableCurrentUserInformationInput'];
  UpdateCurrentUserInformationInput: NexusGenInputs['UpdateCurrentUserInformationInput'];
  UpdateCurrentUserPostContentInput: NexusGenInputs['UpdateCurrentUserPostContentInput'];
  UpdateCurrentUserPostTitleInput: NexusGenInputs['UpdateCurrentUserPostTitleInput'];
  UserPostsInput: NexusGenInputs['UserPostsInput'];
  ErrorCodeEnum: NexusGenEnums['ErrorCodeEnum'];
}

export interface NexusGenFieldTypes {
  CreateCurrentUserPostPayload: { // field return type
    post: NexusGenRootTypes['Post'] | null; // Post
    successful: boolean; // Boolean!
    userErrors: NexusGenRootTypes['UserError'][] | null; // [UserError!]
  }
  CurrentUser: { // field return type
    email: any; // Email!
    firstName: string; // String!
    id: string; // ID!
    lastName: string; // String!
    posts: NexusGenRootTypes['UserPosts']; // UserPosts!
    profile: NexusGenRootTypes['UserProfile']; // UserProfile!
  }
  GetCurrentUserPayload: { // field return type
    currentUser: NexusGenRootTypes['CurrentUser'] | null; // CurrentUser
    successful: boolean; // Boolean!
    userErrors: NexusGenRootTypes['UserError'][] | null; // [UserError!]
  }
  GetCurrentUserPostPayload: { // field return type
    post: NexusGenRootTypes['Post'] | null; // Post
    successful: boolean; // Boolean!
    userErrors: NexusGenRootTypes['UserError'][] | null; // [UserError!]
  }
  Mutation: { // field return type
    createCurrentUserPost: NexusGenRootTypes['CreateCurrentUserPostPayload']; // CreateCurrentUserPostPayload!
    updateCurrentUserInformation: NexusGenRootTypes['UpdateCurrentUserInformationPayload']; // UpdateCurrentUserInformationPayload!
    updateCurrentUserPostContent: NexusGenRootTypes['UpdateCurrentUserPostContentPayload']; // UpdateCurrentUserPostContentPayload!
    updateCurrentUserPostTitle: NexusGenRootTypes['UpdateCurrentUserPostTitlePayload']; // UpdateCurrentUserPostTitlePayload!
  }
  Post: { // field return type
    author: NexusGenRootTypes['RegularUser']; // RegularUser!
    content: any | null; // JSON
    createdAt: any; // Date!
    id: string; // ID!
    published: boolean; // Boolean!
    title: string; // String!
    updatedAt: any | null; // Date
  }
  Query: { // field return type
    getCurrentUser: NexusGenRootTypes['GetCurrentUserPayload']; // GetCurrentUserPayload!
    getCurrentUserPost: NexusGenRootTypes['GetCurrentUserPostPayload']; // GetCurrentUserPostPayload!
  }
  RegularUser: { // field return type
    email: any; // Email!
    firstName: string; // String!
    id: string; // ID!
    lastName: string; // String!
    posts: NexusGenRootTypes['UserPosts']; // UserPosts!
    profile: NexusGenRootTypes['UserProfile']; // UserProfile!
  }
  UpdateCurrentUserInformationPayload: { // field return type
    successful: boolean; // Boolean!
    user: NexusGenRootTypes['RegularUser'] | null; // RegularUser
    userErrors: NexusGenRootTypes['UserError'][] | null; // [UserError!]
  }
  UpdateCurrentUserPostContentPayload: { // field return type
    post: NexusGenRootTypes['Post'] | null; // Post
    successful: boolean; // Boolean!
    userErrors: NexusGenRootTypes['UserError'][] | null; // [UserError!]
  }
  UpdateCurrentUserPostTitlePayload: { // field return type
    post: NexusGenRootTypes['Post'] | null; // Post
    successful: boolean; // Boolean!
    userErrors: NexusGenRootTypes['UserError'][] | null; // [UserError!]
  }
  UserError: { // field return type
    code: NexusGenEnums['ErrorCodeEnum']; // ErrorCodeEnum!
    message: string; // String!
  }
  UserPosts: { // field return type
    results: NexusGenRootTypes['Post'][]; // [Post!]!
    totalResults: number; // Int!
  }
  UserProfile: { // field return type
    bio: string; // String!
  }
  Node: { // field return type
    id: string; // ID!
  }
  User: { // field return type
    email: any; // Email!
    firstName: string; // String!
    lastName: string; // String!
    posts: NexusGenRootTypes['UserPosts']; // UserPosts!
    profile: NexusGenRootTypes['UserProfile']; // UserProfile!
  }
}

export interface NexusGenArgTypes {
  CurrentUser: {
    posts: { // args
      input?: NexusGenInputs['UserPostsInput'] | null; // UserPostsInput
    }
  }
  Mutation: {
    updateCurrentUserInformation: { // args
      input: NexusGenInputs['UpdateCurrentUserInformationInput']; // UpdateCurrentUserInformationInput!
    }
    updateCurrentUserPostContent: { // args
      input: NexusGenInputs['UpdateCurrentUserPostContentInput']; // UpdateCurrentUserPostContentInput!
    }
    updateCurrentUserPostTitle: { // args
      input: NexusGenInputs['UpdateCurrentUserPostTitleInput']; // UpdateCurrentUserPostTitleInput!
    }
  }
  Query: {
    getCurrentUserPost: { // args
      input: NexusGenInputs['GetCurrentUserPostInput']; // GetCurrentUserPostInput!
    }
  }
  RegularUser: {
    posts: { // args
      input?: NexusGenInputs['UserPostsInput'] | null; // UserPostsInput
    }
  }
  User: {
    posts: { // args
      input?: NexusGenInputs['UserPostsInput'] | null; // UserPostsInput
    }
  }
}

export interface NexusGenAbstractResolveReturnTypes {
  Node: "CurrentUser" | "Post" | "RegularUser"
  User: "CurrentUser" | "RegularUser"
}

export interface NexusGenInheritedFields {}

export type NexusGenObjectNames = "CreateCurrentUserPostPayload" | "CurrentUser" | "GetCurrentUserPayload" | "GetCurrentUserPostPayload" | "Mutation" | "Post" | "Query" | "RegularUser" | "UpdateCurrentUserInformationPayload" | "UpdateCurrentUserPostContentPayload" | "UpdateCurrentUserPostTitlePayload" | "UserError" | "UserPosts" | "UserProfile";

export type NexusGenInputNames = "GetCurrentUserPostInput" | "UpdatableCurrentUserInformationInput" | "UpdateCurrentUserInformationInput" | "UpdateCurrentUserPostContentInput" | "UpdateCurrentUserPostTitleInput" | "UserPostsInput";

export type NexusGenEnumNames = "ErrorCodeEnum";

export type NexusGenInterfaceNames = "Node" | "User";

export type NexusGenScalarNames = "Boolean" | "Date" | "Email" | "Float" | "ID" | "Int" | "JSON" | "String";

export type NexusGenUnionNames = never;

export interface NexusGenTypes {
  context: any;
  inputTypes: NexusGenInputs;
  rootTypes: NexusGenRootTypes;
  argTypes: NexusGenArgTypes;
  fieldTypes: NexusGenFieldTypes;
  allTypes: NexusGenAllTypes;
  inheritedFields: NexusGenInheritedFields;
  objectNames: NexusGenObjectNames;
  inputNames: NexusGenInputNames;
  enumNames: NexusGenEnumNames;
  interfaceNames: NexusGenInterfaceNames;
  scalarNames: NexusGenScalarNames;
  unionNames: NexusGenUnionNames;
  allInputTypes: NexusGenTypes['inputNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['scalarNames'];
  allOutputTypes: NexusGenTypes['objectNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['unionNames'] | NexusGenTypes['interfaceNames'] | NexusGenTypes['scalarNames'];
  allNamedTypes: NexusGenTypes['allInputTypes'] | NexusGenTypes['allOutputTypes']
  abstractTypes: NexusGenTypes['interfaceNames'] | NexusGenTypes['unionNames'];
  abstractResolveReturn: NexusGenAbstractResolveReturnTypes;
}


declare global {
  interface NexusGenPluginTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginSchemaConfig {
  }
}