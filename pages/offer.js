import baseUrl from "../utils/baseUrl";
import axios from "axios";
const Offer = ({ discount }) => {
  console.log(discount);
  return <>Hello</>;
};

Offer.getInitialProps = async ({ query: { discountId } }) => {
  const url = `${baseUrl}/api/discount`;
  const isActive = true;
  const payload = { params: { discountId } };
  const response = await axios.get(url, payload);
  return response.data;
};
export default Offer;
