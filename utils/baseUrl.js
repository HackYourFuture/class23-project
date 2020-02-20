const baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://intense-citadel-90085.herokuapp.com"
    : process.env.PORT;

export default baseUrl;
