import {
  Button,
  Item,
  Label,
  Form,
  Message
} from "semantic-ui-react";
import { redirectUser } from "../../utils/auth";

function CartItem({
  cartProduct,
  handleRemoveFromCart,
  currency
}, ctx) {

  function calculatedIndependentPriceText(cartDocument) {
    const curr = (!currency || currency === "usd" || !cartDocument.product.priceEuro) ? "$" : '€';
    const price = curr === '$' ? cartDocument.product.price : cartDocument.product.priceEuro;
    return (
      <span style={{ textDecoration: cartDocument.discountApplied ? "line-through" : "none" }}>
        {`${cartDocument.quantity} x ${curr}${price.toFixed(2)}`}
      </span>
    );
  }

  function calculatedDiscountedText(cartDocument) {
    const curr = (!currency || currency === "usd" || !cartDocument.product.priceEuro) ? "$" : '€';
    const amount = cartDocument.discount.multipleUnits ? 1 : cartDocument.discount.amountRequired;
    const price = curr === '$' ? cartDocument.product.price : cartDocument.product.priceEuro;
    const totalDiscountedPrice = curr === '$' ? cartDocument.discountAmount : cartDocument.discountAmountEuro;
    const perItemDiscountedPrice = price - (cartDocument.discount.multipleUnits ? totalDiscountedPrice : totalDiscountedPrice / cartDocument.discount.amountRequired);
    return (
      <Label color="green">
        {amount}<span> x </span>{`${curr}${(perItemDiscountedPrice).toFixed(2)}`}
      </Label >
    )
  }

  function calculatedNonDiscountedText(cartDocument) {
    const curr = (!currency || currency === "usd" || !cartDocument.product.priceEuro) ? "$" : '€';
    const price = curr === '$' ? cartDocument.product.price : cartDocument.product.priceEuro;
    const amount = cartDocument.discount.multipleUnits ? (cartDocument.quantity - 1) : (cartDocument.quantity - cartDocument.discount.amountRequired);
    if (amount <= 0) return;
    return <Label>{amount} x {curr}{price.toFixed(2)}</Label>;
  }

  return (
    <Item key={cartProduct.product._id}>
      <Item.Image src={cartProduct.product.mediaUrl} size="small" />
      <Item.Content>
        <Item.Header
          as="a"
          onClick={() => redirectUser(ctx, `/product?_id=${cartProduct.product._id}`)}
        >
          {cartProduct.product.name}
        </Item.Header>
        <Item.Meta>
          {calculatedIndependentPriceText(cartProduct)}
        </Item.Meta>
        <Item.Meta>
          {cartProduct.discountApplied && calculatedDiscountedText(cartProduct)}
        </Item.Meta>
        <Item.Meta>
          {cartProduct.discountApplied && calculatedNonDiscountedText(cartProduct)}
        </Item.Meta>
        <Item.Extra>
          <Button
            basic
            icon="remove"
            floated="right"
            onClick={() => handleRemoveFromCart(cartProduct.product._id)}
          />
        </Item.Extra>
      </Item.Content>
    </Item>
  )
}

export default CartItem;