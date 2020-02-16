import React from "react";
import StripeCheckout from "react-stripe-checkout";
import { Button, Segment, Divider } from "semantic-ui-react";
import calculateCartTotal from "../../utils/calculateCartTotal";

function CartSummary({ products, handleCheckout, success, currency }) {
  const [cartAmount, setCartAmount] = React.useState(0);
  const [stripeAmount, setStripeAmount] = React.useState(0);
  const [isCartEmpty, setCartEmpty] = React.useState(false);

  React.useEffect(() => {
    const {
      cartTotal,
      stripeTotal,
      cartTotalEuro,
      stripeTotalEuro
    } = calculateCartTotal(products);
    currency === "usd"
      ? (setCartAmount(cartTotal), setStripeAmount(stripeTotal))
      : (setCartAmount(cartTotalEuro), setStripeAmount(stripeTotalEuro));
    setCartEmpty(products.length === 0);
  }, [products]);

  return (
    <>
      <Divider />
      {currency === "usd" ? (
        <Segment clearing size="large">
          <strong>Sub total:</strong> ${cartAmount}
          <StripeCheckout
            name="React Reserve"
            amount={stripeAmount}
            image={products.length > 0 ? products[0].product.mediaUrl : ""}
            currency="USD"
            shippingAddress={true}
            billingAddress={true}
            zipCode={true}
            stripeKey="pk_test_M2XSgYvdEVpF4572Qjyg4nA9004mp7CZYP"
            token={handleCheckout}
            triggerEvent="onClick"
          >
            <Button
              icon="cart"
              disabled={isCartEmpty || success}
              color="teal"
              floated="right"
              content="Checkout"
            />
          </StripeCheckout>
        </Segment>
      ) : (
        <Segment clearing size="large">
          <strong>Sub total:</strong> &euro;{cartAmount}
          <StripeCheckout
            name="React Reserve"
            amount={stripeAmount}
            image={products.length > 0 ? products[0].product.mediaUrl : ""}
            currency={currency === "usd" ? "USD" : "EUR"}
            shippingAddress={true}
            billingAddress={true}
            zipCode={true}
            stripeKey="pk_test_M2XSgYvdEVpF4572Qjyg4nA9004mp7CZYP"
            token={handleCheckout}
            triggerEvent="onClick"
          >
            <Button
              icon="cart"
              disabled={isCartEmpty || success}
              color="teal"
              floated="right"
              content="Checkout"
            />
          </StripeCheckout>
        </Segment>
      )}
    </>
  );
}

export default CartSummary;
