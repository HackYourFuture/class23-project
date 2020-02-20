const baseUrl =
  process.env.NODE_ENV === "production"
    ? "https://hackyourshop.herokuapp.com"
    : process.env.PORT;

export default baseUrl;
