import axios from "axios";
import ProductSummary from "../components/Product/ProductSummary";
import ProductAttributes from "../components/Product/ProductAttributes";
import baseUrl from "../utils/baseUrl";

function Product({ product, user, totalComments }) {
  return (
    <>
      <ProductSummary user={user} {...product} />
      <ProductAttributes user={user} {...product} />
    </>
  );
}

Product.getInitialProps = async ({ query: { _id, page } }) => {
  const url = `${baseUrl}/api/product`;
  const payload = { params: { _id, page } };
  const response = await axios.get(url, payload);
  return response.data;
};

export default Product;
