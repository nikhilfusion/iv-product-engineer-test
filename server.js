require("dotenv").config();
const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

// Hasura GraphQL Endpoint and Admin Secret
const HASURA_GRAPHQL_ENDPOINT = 'http://localhost:8080/v1/graphql';
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

// Helper function to interact with Hasura
const fetchFromHasura = async (query, variables = {}) => {
  try {
    const response = await axios.post(
      HASURA_GRAPHQL_ENDPOINT,
      { query, variables },
      {
        headers: {
          "Content-Type": "application/json",
          "x-hasura-admin-secret": HASURA_ADMIN_SECRET,
        },
      }
    );
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.errors[0]?.message || "Hasura error");
  }
};

// Define GraphQL Schema
const schema = buildSchema(`
  type Query {
    getUsers: [User]
    getUserById(id: Int!): User
  }

  type Mutation {
    addUser(name: String!, email: String!, mobile: Int!): User
  }

  type User {
    id: Int
    name: String
    email: String
    mobile: Int
  }
`);

// Define Resolvers
const root = {
  getUsers: async () => {
    const query = `
      query {
        users {
          id
          name
          email
          mobile
        }
      }
    `;
    return await fetchFromHasura(query);
  },

  getUserById: async ({ id }) => {
    const query = `
      query ($id: Int!) {
        users_by_pk(id: $id) {
          id
          name
          email
          mobile
        }
      }
    `;
    const data = await fetchFromHasura(query, { id });
    return data.users_by_pk;
  },

  addUser: async ({ name, email }) => {
    const mutation = `
      mutation ($name: String!, $email: String!, $mobile: Int) {
        insert_users_one(object: {name: $name, email: $email, mobile: $mobile}) {
          id
          name
          email,
          mobile
        }
      }
    `;
    const data = await fetchFromHasura(mutation, { name, email, mobile });
    return data.insert_users_one;
  },
};

// Setup GraphQL Endpoint
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
  })
);

// Start the Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/graphql 🚀`);
});