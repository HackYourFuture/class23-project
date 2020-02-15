import baseUrl from "../utils/baseUrl";
import axios from "axios";
import { Card, Image } from "semantic-ui-react";
const Offer = ({ discounts, query }) => {
  console.log(discounts, query);
  const [discountedProduct, setDiscountedProduct] = React.useState([]);
  React.useEffect(() => {
    const product = discounts.discounts.filter(d => d._id === query._id);
    setDiscountedProduct(product);
  }, []);
  console.log(discountedProduct);

  return (
    <>
      <Card>
        <Image.Group>
          {discountedProduct.map(p =>
            p.products.map(p => <Image inline src={p.mediaUrl} size="medium" />)
          )}
        </Image.Group>
      </Card>
    </>
  );
};

Offer.getInitialProps = async ({ query }) => {
  const url = `${baseUrl}/api/discount`;
  const isActive = true;
  const response = await axios.get(url);
  return { discounts: response.data, query };
};

export default Offer;
