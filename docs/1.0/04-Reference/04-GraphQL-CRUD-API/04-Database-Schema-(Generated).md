---
alias: ahtae1eewu
description: Database Schema (g)
---

# Database Schema (Generated)

The database schema is the [GraphQL schema](https://blog.graph.cool/graphql-server-basics-the-schema-ac5e2950214e) for your service's GraphQL API. It defines the CRUD operations for the types in your data model.

The database schema is generated and managed by Graphcool, based on the types in your data model. If you provide a valid file path for the `schema` property in your `graphcool.yml`, the CLI will store the database schema there whenever you deploy a service.

## Data model vs Database schema

Data model and database schema in Graphcool services can easily be confused. The key thing to realize is that:

- the data model is written by you
- the database schema is automatically generated and should never be modified by you

The database schema contains the full specification of your API, most notably the CRUD operations for the types in your data model.

The data model on the other hand only contains the type definitions for your application, modeling the entities from your application domain.

## Example

As an example, consider this data model:

```graphql
type User {
  id: ID! @unique
  email: String! @unique
  name: String
}
```

Deploying a Graphcool service with this data model will generate the following database schema:

```graphql
type Query {

  # retrieve a single user by a unique field
  user(where: UserWhereUniqueInput): User

  # retrieve list of users
  users(
    where: UserWhereInput
    orderBy: UserOrderByInput
    skip: Int
    before: String
    after: String
    first: Int
    last: Int
  ): [User!]!

  # retrieve list of users using the GraphQL connections
  usersConnection(
    filter: UserWhereInput
    orderBy: UserOrderByInput
    skip: Int
    before: String
    after: String
    first: Int
    last: Int
  ): UserConnection!
}

type Mutation {
  createUser(data: UserCreateInput!): User!
  updateUser(data: UserUpdateInput!, where: UserWhereUniqueInput!): User
  deleteUser(where: UserWhereUniqueInput!): User
  upsertUser(where: UserWhereUniqueInput!, create: UserCreateInput!, update: UserUpdateInput!): User

  updateManyUsers(data: UserUpdateInput!, where: UserWhereInput!): BatchPayload
  deleteManyUsers(where: UserWhereInput!): BatchPayload
}

interface Node {
  id: ID @unique
}

type User implements Node {
  id: ID! @unique
  email: String! @unique
  name: String
}

type UserConnection {
  edges: [UserEdge!]
  aggregate: UserAggregate
  groupwhere: UserGroupBy
}

type UserEdge {
  node: User!
}

input UserCreateInput {
  email: String!
  name: String
}

input UserWhereUniqueInput {
  id: ID
  email: String
}

input UserUpdateInput {
  email: String
  name: String
}

input UserWhereInput {
  # all generated filter properties
}

enum UserOrderByInput {
  # all generated order properties
}
```

Most notably, the `Query` and `Mutation` types define all the queries and mutations that can be sent to the API.

<!--
TODO
- finalize generated schema
- what does BatchPayload look like?
- are fields on `UserWhereUniqueInput` all optional?
- specify `UserAggregate`, `UserGroupBy`
-->
