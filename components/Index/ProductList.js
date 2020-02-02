import { Card, Container, Rating, Dropdown } from 'semantic-ui-react';
import calculateRatingMedian from '../../utils/calculateRatingMedian';

function ProductList({ products, selectCategory }) {
  const categoryOptions = [
    { key: 'acc', text: 'Accessories', value: 'accessories' },
    { key: 'bath', text: 'Bathroom', value: 'bathroom' },
    { key: 'bed', text: 'Bedroom', value: 'bedroom' },
    { key: 'dec', text: 'Decoration', value: 'decoration' },
    { key: 'kit', text: 'Kitchen', value: 'kitchen' },
    { key: 'lig', text: 'Lighting', value: 'lighting' },
    { key: 'liv', text: 'Living Room', value: 'living_room' },
    { key: 'off', text: 'Office', value: 'office' },
    { key: 'tec', text: 'Technology', value: 'technology' },
    { key: 'oth', text: 'Other', value: 'other' },
  ];

  function mapProductsToItems(products) {
    return products.map(product => {
      const averageRating = calculateRatingMedian(product.ratings);

      return {
        header: product.name,
        image: product.mediaUrl,
        meta: `$${product.price}`,
        color: 'teal',
        fluid: true,
        childKey: product._id,
        href: `/product?_id=${product._id}`,
        extra: (
          <Rating size='tiny' icon='star' disabled maxRating={5} rating={averageRating || 0} />
        ),
      };
    });
  }

  return (
    <>
      <Container style={{ marginBottom: '2em' }}>
        <Dropdown
          placeholder='Select Category'
          fluid
          selection
          multiple
          closeOnChange
          closeOnEscape
          options={categoryOptions}
          onChange={selectCategory}
        />
      </Container>
      <Card.Group stackable itemsPerRow='3' centered items={mapProductsToItems(products)} />
    </>
  );
}

export default ProductList;
