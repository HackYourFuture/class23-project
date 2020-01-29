import axios from 'axios';
import ProductSummary from '../components/Product/ProductSummary';
import ProductAttributes from '../components/Product/ProductAttributes';
import baseUrl from '../utils/baseUrl';
import { useEffect } from 'react';

function Product({ product, user }) {
  useEffect(() => {
    async function incrementProductView() {
      const url = `${baseUrl}/api/view`;
      const payload = { productId: product._id };
      await axios.post(url, payload);
    }
    incrementProductView();
  }, [product]);

  return (
    <>
      <ProductSummary user={user} {...product} />
      <ProductAttributes user={user} {...product} />
    </>
  );
}

Product.getInitialProps = async ({ query: { _id } }) => {
  const url = `${baseUrl}/api/product`;
  const payload = { params: { _id } };
  const response = await axios.get(url, payload);
  return { product: response.data };
};

export default Product;
