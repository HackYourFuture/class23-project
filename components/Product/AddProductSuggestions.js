import { Card, Rating } from "semantic-ui-react";
import calculateRatingMedian from "../../utils/calculateRatingMedian";

function AddProductSuggestions({ topSuggestedProducts, currency }) {
  function mapProductsToItems(products) {
    return products.map(product => {
      console.log({ product })
      return {
        header: product.name,
        image: product.mediaUrl,
        meta: (!currency || currency === 'usd') ? `$${product.price.toFixed(2)}` : `€${product.priceEuro.toFixed(2)}`,
        color: "teal",
        fluid: true,
        childKey: product._id,
        href: `/product?_id=${product._id}`,
        extra: (
          <Rating
            size="tiny"
            icon="star"
            disabled
            maxRating={5}
            rating={
              product.ratings ? calculateRatingMedian(product.ratings) : 0
            }
          />
        )
      };
    });
  }

  return (
    <>
      <Card.Header as="h2" centered='true'>
        You may also like..
      </Card.Header>
      <Card.Group
        stackable
        itemsPerRow="5"
        centered
        items={mapProductsToItems(topSuggestedProducts)}
      />
    </>
  );
}

export default AddProductSuggestions;
