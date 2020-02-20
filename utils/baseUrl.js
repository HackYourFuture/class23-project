const baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://hackyourshop.herokuapp.com"
    : "http://localhost:3000";

export default baseUrl;
