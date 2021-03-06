---
alias: yaeco6ieth
description: Authentication
---

# Authentication

In this section, you'll learn how you can migrate your authentication functionality from the Graphcool Framework to Graphcool 1.0.

## Authentication with the Graphcool Framework

With the Graphcool Framework, authentication is implemented using [resolver functions](!alias-su6wu3yoo2). The GraphQL schema of the API is extended with dedicated mutations that provide signup and login functionality.

Since resolver functions don't exist any more in Graphcool 1.0, this functionality now moves into the GraphQL server.

With the Graphcool Framework, authentication involved the following steps:

1. Define your signup and login resolver functions as schema extension on the `Mutation` type in your GraphQL schema
1. Provide the implementation of the resolver functions in JavaScript directly through the Graphcool Framework or use a webhook to invoke a function hosted by yourself
1. Connect the mutation definitions with the implementation by adjusting your service definition file

## Authentication with Graphcool 1.0

Graphcool 1.0 has a different authentication concept than previous versions. Rather than tying authentication to a permission system, Graphcool 1.0 only provides a general key for having full read- and write-access to the data stored in the database. (In the future, simple authorization mechanisms are planned for the database as well). User authentication and permission rules are now implemented in the GraphQL server.

Another major change to the Graphcool Framework is that in 1.0 you now generate the JWT tokens for your users yourself rathen than having it generated by `graphcool-lib`.

## Going from the framework to 1.0

The following instructions assume you're using `graphql-yoga` as your GraphQL server and that your schema definition is written in SDL.

### Step 1: Migrate schema definitions

In your Graphcool Framework service, you might have had a schema extension defined that looks as follows:

```grapqhl
type Mutation {
  signupUser(email: String!, password: String!): SignupUserPayload
  authenticateUser(email: String!, password: String!): AuthenticateUserPayload
}

type SignupUserPayload{
  userId: ID!
  token: String!
}

type AuthenticateUserPayload {
  token: String!
}
```

The `signupUser` and `authenticateUser` mutations can be used for signup and login. The returned `token` is a JSON web token that's generated by `graphcool-lib` and can be sent in the `Authorization` HTTP header to authenticate requests against the API.

You can now move these definitions into the schema definition of your `graphql-yoga` server. Note that you can also get rid of one workaround that was required due to the limitation that resolver functions were not able to return model types.

Here is a suggestion for what your new defintion could look like:

```grapqhl
type Mutation {
  signup(email: String!, password: String!): AuthPayload
  login(email: String!, password: String!): AuthPayload
}

type AuthPayload {
  token: String!
  user: User!
}
```

### Step 2: Migrate resolver functions

Next, you need to implement the resolvers for the above defined `signup` and `login` mutations. In these resolvers, you're now generating a JWT token which you then return to your users. In the `signup` resolver, you also create a new node of the `User` type.

**auth.js**:

```js
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const auth = {
  async signup(parent, args, ctx, info) {
    const password = await bcrypt.hash(args.password, 10)
    const user = await ctx.db.mutation.createUser({
      data: { ...args, password },
    })

    return {
      token: jwt.sign({ userId: user.id }, process.env.JWT_SECRET),
      user,
    }
  },

  async login(parent, { email, password }, ctx, info) {
    const user = await ctx.db.query.user({ where: { email } })
    if (!user) {
      throw new Error(`No such user found for email: ${email}`)
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      throw new Error('Invalid password')
    }

    return {
      token: jwt.sign({ userId: user.id }, process.env.JWT_SECRET),
      user,
    }
  },
}

module.exports = { auth }
```

**AuthPayload.js**:

```js
const AuthPayload = {
  user: async ({ user: { id } }, args, ctx, info) => {
    return ctx.db.query.user({ where: { id } }, info)
  },
}

module.exports = { AuthPayload }
```
