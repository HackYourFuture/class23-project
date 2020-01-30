import React from "react";
import { Item, Label, Rating, Segment } from "semantic-ui-react";
import axios from "axios";
import cookie from "js-cookie";
import baseUrl from "../../utils/baseUrl";
import calculateRatingMedian from "../../utils/calculateRatingMedian";
import AddProductToCart from "./AddProductToCart";

function ProductSummary({ name, mediaUrl, _id, price, sku, user, ratings }) {
  const [ratingAmount, setRatingAmount] = React.useState(0);
  console.log(ratings);

  React.useEffect(() => {
    const avrRating = calculateRatingMedian(ratings);
    setRatingAmount(avrRating);
  }, [ratings]);

  // async function handleRate(e, { rating }) {
  //   const url = `${baseUrl}/api/ratings`;
  //   const token = cookie.get("token");
  //   const headers = { headers: { Authorization: token } };
  //   const payload = { productId: _id, rating, userId: user._id };
  //   const response = await axios.post(url, payload, headers);
  //   console.log(response.data);
  // }
  // console.log(ratings);
  // console.log(user);
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
      <Rating maxRating="5" icon="star" size="large" rating={ratingAmount} />
      <span>{`${ratings.length} users rated this!`}</span>
    </>
  );
}

export default ProductSummary;
