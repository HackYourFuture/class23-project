import baseUrl from "../utils/baseUrl";
import axios from "axios";
import { Card, Image, Header } from "semantic-ui-react";
const Offer = ({ discounts }) => {
  console.log(discounts);

  return (
    <>
      {discounts.map(d =>
        d.unitType === "product" ? (
          <>
            <Header>Product Information</Header>
            <Image.Group>
              {d.products.map(p => (
                <Image key={p._id} src={p.mediaUrl} size="medium" />
              ))}
            </Image.Group>
          </>
        ) : (
          ""
        )
      )}
    </>
  );
};

Offer.getInitialProps = async ({ query: { discountId } }) => {
  const url = `${baseUrl}/api/discount`;
  console.log(discountId);
  const payload = { params: { discountId } };
  const response = await axios.get(url, payload);
  return response.data;
};
export default Offer;
