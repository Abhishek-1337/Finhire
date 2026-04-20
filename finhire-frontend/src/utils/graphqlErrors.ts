export const getGraphqlErrorMessage = (error: unknown) => {
  if (error && typeof error === "object" && "graphQLErrors" in error) {
    const graphQLErrors = (error as { graphQLErrors?: Array<{ message?: string }> }).graphQLErrors;
    const first = graphQLErrors?.[0]?.message;
    if (first) return first;
  }
  if (error && typeof error === "object" && "networkError" in error) {
    const networkError = (error as { networkError?: { message?: string } }).networkError;
    if (networkError?.message) return networkError.message;
  }
  if (error instanceof Error) return error.message;
  return "Request failed";
};
