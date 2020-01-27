const baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://rabie-reactreserve.now.sh"
    : "http://localhost:3000";

export default baseUrl;
