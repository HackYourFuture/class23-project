const baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://warm-sands-49381.herokuapp.com"
    : "http://localhost:3000";

export default baseUrl;
