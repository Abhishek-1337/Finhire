import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client/core";
import { setContext } from "@apollo/client/link/context";
import { ApolloProvider } from "@apollo/client/react";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";

const httpLink = new HttpLink({
  uri: "/api"
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

const client = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ApolloProvider>
  </StrictMode>,
);
