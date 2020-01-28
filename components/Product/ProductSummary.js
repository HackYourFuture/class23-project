import { Item, Label, Rating } from "semantic-ui-react";
import axios from "axios";
import cookie from "js-cookie";
import baseUrl from "../../utils/baseUrl";
import AddProductToCart from "./AddProductToCart";

function ProductSummary({ name, mediaUrl, _id, price, sku, user }) {
  async function handleRate(e, { rating }) {
    const url = `${baseUrl}/api/ratings`;
    const token = cookie.get("token");
    const headers = { headers: { Authorization: token } };
    const payload = {
      productId: _id,
      star: rating
    };
    const response = await axios.put(url, payload, headers);
    console.log(response.data);
  }
  return (
    <>
      <Item.Group>
        <Item>
          <Item.Image size="medium" src={mediaUrl} />
          <Item.Content>
            <Item.Header>{name}</Item.Header>
            <Item.Description>
              <p>${price}</p>
              <Label>SKU: {sku}</Label>
            </Item.Description>
            <Item.Extra>
              <AddProductToCart user={user} productId={_id} />
            </Item.Extra>
          </Item.Content>
        </Item>
      </Item.Group>
      <Rating
        clearable
        maxRating="5"
        icon="star"
        defaultRating="0"
        size="large"
        onRate={handleRate}
      />
    </>
  );
}

export default ProductSummary;
