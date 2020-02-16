import {
  Item,
  Message,
} from "semantic-ui-react";
import { useRouter } from "next/router";
import { UNIT_TYPES } from '../../utils/discount';

function DiscountSingleUnit({ unit, unitType, discountPercentage }) {
  const router = useRouter();

  function mapUnitToItem(unit) {
    return [
      unitType === UNIT_TYPES.product ?
        {
          childKey: `unit_${unit.product._id}`,
          header: (
            <Item.Header
              as="a"
              onClick={() => router.push(`/product?_id=${unit.product._id}`)}
            >
              {unit.product.name}
            </Item.Header>
          ),
          image: unit.product.mediaUrl,
          meta: `$${unit.product.price} => $${(unit.product.price * ((100 - discountPercentage) / 100)).toFixed(2)}`,
          fluid: "true"
        } :
        {
          childKey: `unit_${unit.category}`,
          header: (
            <Item.Header
              as='h1'
            >
              {unit.category}
            </Item.Header>
          ),
          fluid: "true"
        }];
  }

  return (
    Boolean(unit[unitType]) ?
      <Item.Group divided items={mapUnitToItem(unit)} />
      :
      <Message content={`No ${unitType} selected yet!`} />
  );
}

export default DiscountSingleUnit;
