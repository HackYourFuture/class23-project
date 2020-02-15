import baseUrl from "../utils/baseUrl";
import axios from "axios";
import { Card, Image, Header } from "semantic-ui-react";
const Offer = ({ discounts }) => {
  console.log(discounts);
  //   console.log(discounts, query);
  //   const [discountedProduct, setDiscountedProduct] = React.useState([]);
  //   React.useEffect(() => {
  //     const product = discounts.discounts.filter(d => d._id === query._id);
  //     setDiscountedProduct(product);
  //   }, []);
  //   console.log(discountedProduct);

  return (
    <>
      <Header></Header>
      {/* <Image.Group>
        {discountedProduct.map(p =>
          p.products.map(p => <Image src={p.mediaUrl} size="medium" />)
        )}
      </Image.Group> */}
    </>
  );
};

Offer.getInitialProps = async ({ query: { discountId } }) => {
  const url = `${baseUrl}/api/discount`;
  const payload = { params: { discountId } };
  const response = await axios.get(url, payload);
  return response.data;
};
export default Offer;
