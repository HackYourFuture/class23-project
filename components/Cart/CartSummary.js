import React from "react";
import StripeCheckout from "react-stripe-checkout";
import {
  Button,
  Segment,
  Divider,
  Label,
  Item,
  Form,
  Message
} from "semantic-ui-react";
import calculateCartTotal from "../../utils/calculateCartTotal";
import title from "../../utils/title";
import baseUrl from "../../utils/baseUrl";
import cookie from "js-cookie";
import axios from "axios";

function CartSummary({ products, handleCheckout, success, currency, code }) {
  const [cartAmount, setCartAmount] = React.useState(0);
  const [stripeAmount, setStripeAmount] = React.useState(0);
  const [isCartEmpty, setCartEmpty] = React.useState(false);
  const [discountedAmount, setDiscountedAmount] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [codeApplied, setCodeApplied] = React.useState(!!code);
  const [voucher, setVoucher] = React.useState(code);
  const [voucherCode, setVoucherCode] = React.useState(code ? code.code : "");
  const [error, setError] = React.useState("");
  const [codeSuccess, setCodeSuccess] = React.useState("");

  React.useEffect(() => {
    const {
      cartTotal,
      stripeTotal,
      cartTotalEuro,
      stripeTotalEuro,
      discountAmount,
      discountAmountEuro
    } = calculateCartTotal(products, voucher);

    currency === "usd"
      ? (setCartAmount(cartTotal),
        setStripeAmount(stripeTotal),
        setDiscountedAmount(discountAmount))
      : (setCartAmount(cartTotalEuro),
        setStripeAmount(stripeTotalEuro),
        setDiscountedAmount(discountAmountEuro));
    setCartEmpty(products.length === 0);
  }, [products, voucher]);

  React.useEffect(() => {
    if (codeSuccess) {
      setTimeout(() => {
        setCodeSuccess("");
      }, 1500);
    }
    if (error) {
      setTimeout(() => {
        setError("");
      }, 2000);
    }
  }, [codeSuccess, error]);

  async function handleVoucherSubmit() {
    try {
      setLoading(true);
      const url = `${baseUrl}/api/code`;
      const token = cookie.get("token");
      const headers = { Authorization: token };
      const payload = { code: voucherCode };
      const response = await axios.put(url, payload, { headers });
      setError("");
      setCodeApplied(true);
      setVoucher(response.data);
      setCodeSuccess("Coupon code applied to your cart successfully.");
    } catch (error) {
      setError(error.message);
      setCodeSuccess("");
    } finally {
      setLoading(false);
    }
  }

  async function handleVoucherRemove() {
    try {
      setLoading(true);
      const url = `${baseUrl}/api/code`;
      const token = cookie.get("token");
      const headers = { Authorization: token };
      const params = { code: voucherCode };
      const response = await axios.delete(url, { params, headers });
      setError("");
      setCodeApplied(false);
      setVoucher(null);
      setCodeSuccess(response.data);
    } catch (error) {
      setError(error.message);
      setCodeSuccess("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Divider />
      <Segment clearing size="large">
        {discountedAmount ? (
          <>
            <strong>Sub total:</strong>
            <span style={{ textDecoration: "line-through" }}>
              {!currency || currency == "usd" ? "$" : "€"}
              {(Number(cartAmount) + Number(discountedAmount)).toFixed(2)}
            </span>
            <Label color="green">
              {!currency || currency == "usd" ? "$" : "€"}
              {cartAmount}
            </Label>
          </>
        ) : (
          <>
            <strong>Sub total:</strong>{" "}
            {!currency || currency == "usd" ? "$" : "€"}
            {cartAmount}
          </>
        )}
        {cartAmount > 0 && (
          <Form
            style={{ marginTop: "20px" }}
            loading={loading}
            error={!!error}
            success={!!codeSuccess}
            onSubmit={handleVoucherSubmit}
          >
            <Message success content={codeSuccess} />
            <Message error content={error} />
            <Form.Group>
              <Form.Input
                placeholder="Coupon code"
                name="code"
                disabled={loading || codeApplied}
                value={voucherCode}
                onChange={(_event, { value }) => setVoucherCode(value)}
                width="13"
              />
              {!codeApplied && (
                <Button
                  disabled={loading || codeApplied}
                  type="submit"
                  icon="check"
                  content="Apply"
                  color="green"
                />
              )}
              {codeApplied && (
                <Button
                  disabled={loading || !codeApplied}
                  icon="remove"
                  content="Remove"
                  color="orange"
                  onClick={handleVoucherRemove}
                />
              )}
            </Form.Group>
          </Form>
        )}

        {console.log(typeof stripeAmount)}
        <StripeCheckout
          name={title}
          amount={stripeAmount}
          image={products.length > 0 ? products[0].product.mediaUrl : ""}
          currency={currency === "usd" ? "usd" : "eur"}
          shippingAddress={true}
          billingAddress={true}
          zipCode={true}
          stripeKey="pk_test_CxNl8AOYSrEso5vij6ems2BK00HCvRY9YF"
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
    </>
  );
}

export default CartSummary;
