import { ApolloServer } from "apollo-server";
import { typeDefs } from "./graphql/typeDefs/schema";
import { resolvers } from "./graphql/resolvers";
import { createContext } from "./graphql/context";
import { env } from "./config/env";
import "./utils/openAi"; // Ensure OpenAI utilities are initialized

async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: createContext,
  });

  const { url } = await server.listen({ port: env.PORT });
  // eslint-disable-next-line no-console
  console.log(`FinHire GraphQL API running at ${url}`);
  // start AI endpoint server for receiving search strings
}

startServer().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", error);
  process.exit(1);
});
