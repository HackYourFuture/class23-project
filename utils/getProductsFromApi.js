import axios from "axios";
import baseUrl from "./baseUrl";

function getProductsFromApi(api, payload) {
  const url = `${baseUrl}/api/${api}`;
  return axios.get(url, payload);
}

export default getProductsFromApi;
