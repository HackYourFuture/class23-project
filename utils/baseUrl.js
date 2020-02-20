const baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://intense-citadel-90085.herokuapp.com"
    : "http://localhost:3000";

export default baseUrl;
