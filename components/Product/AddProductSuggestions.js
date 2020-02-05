import { Card, Rating } from "semantic-ui-react";
import calculateRatingMedian from "../../utils/calculateRatingMedian";

function AddProductSuggestions({ topSuggestedProducts, ratings }) {
  const [ratingAmount, setRatingAmount] = React.useState(0);

  React.useEffect(() => {
    const avrRating = calculateRatingMedian(ratings);
    setRatingAmount(avrRating);
  }, [ratings]);

  function mapProductsToItems(products) {
    return products.map(product => {
      return {
        header: product.name,
        image: product.mediaUrl,
        meta: `$${product.price}`,
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
            rating={ratingAmount || 0}
          />
        )
      };
    });
  }
  return (
    <>
      <Card.Header centered>Similar products</Card.Header>
      <Card.Group
        stackable
        itemsPerRow="3"
        centered
        items={mapProductsToItems(topSuggestedProducts)}
      />
    </>
  );
}

export default AddProductSuggestions;
