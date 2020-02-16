import {
  Button,
  Item,
  Message,
} from "semantic-ui-react";
import { useRouter } from "next/router";
import { UNIT_TYPES } from '../../utils/discount';

function DiscountUnitsList({ units, handleRemove, unitType, discountPercentage }) {
  const router = useRouter();

  function mapUnitsToItems(units) {
    return units.map(unit =>
      (
        unitType === UNIT_TYPES.product ?
          {
            childKey: `unit_${unit._id}`,
            header: (
              <Item.Header
                as="a"
                onClick={() => router.push(`/product?_id=${unit._id}`)}
              >
                {unit.name}
              </Item.Header>
            ),
            image: unit.mediaUrl,
            meta: `$${unit.price} => $${(unit.price * ((100 - discountPercentage) / 100)).toFixed(2)}`,
            fluid: "true",
            extra: (
              <Button
                basic
                icon="remove"
                floated="right"
                onClick={() => handleRemove(unit._id, unitType)}
              />
            )
          } :
          {
            childKey: `unit_${unit}`,
            header: (
              <Item.Header
                as='h1'
              >
                {unit}
              </Item.Header>
            ),
            fluid: "true",
            extra: (
              <Button
                basic
                icon="remove"
                floated="right"
                onClick={() => handleRemove(unit, unitType)}
              />
            )
          }));
  }

  return (
    units.length > 0 ?
      <Item.Group divided items={mapUnitsToItems(units)} />
      :
      <Message content={`No ${unitType} added to the Discount yet!`} />
  );
}

export default DiscountUnitsList;
