import {
  Header,
  Segment,
  Button,
  Icon,
  Item,
  Message,
  Label
} from "semantic-ui-react";
import { useRouter } from "next/router";
import { redirectUser } from "../../utils/auth";

function CartItemList({
  products,
  user,
  handleRemoveFromCart,
  success,
  currency
}, ctx) {
  const router = useRouter();

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

  if (success) {
    return (
      <Message
        success
        header="Success!"
        content="Your order and payment has been accepted"
        icon="star outline"
      />
    );
  }

  if (products.length === 0) {
    return (
      <Segment secondary color="teal" inverted textAlign="center" placeholder>
        <Header icon>
          <Icon name="shopping basket" />
          No products in your cart. Add some!
        </Header>
        <div>
          {user ? (
            <Button color="orange" onClick={() => redirectUser(ctx, '/')}>
              View Products
            </Button>
          ) : (
              <Button color="blue" onClick={() => redirectUser(ctx, '/login')}>
                Login to Add Products
            </Button>
            )}
        </div>
      </Segment>
    );
  }

  return (
    <Item.Group divided>
      {products.map(p => (
        <Item key={p.product._id}>
          <Item.Image src={p.product.mediaUrl} size="small" />
          <Item.Content>
            <Item.Header
              as="a"
              onClick={() => redirectUser(ctx, `/product?_id=${p.product._id}`)}
            >
              {p.product.name}
            </Item.Header>
            <Item.Meta>
              {calculatedIndependentPriceText(p)}
            </Item.Meta>
            <Item.Meta>
              {p.discountApplied && calculatedDiscountedText(p)}
            </Item.Meta>
            <Item.Meta>
              {p.discountApplied && calculatedNonDiscountedText(p)}
            </Item.Meta>
            <Item.Extra>
              <Button
                basic
                icon="remove"
                floated="right"
                onClick={() => handleRemoveFromCart(p.product._id)}
              />
            </Item.Extra>
          </Item.Content>
        </Item>
      ))}
    </Item.Group>
  );
}

export default CartItemList;
