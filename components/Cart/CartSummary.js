import React from "react";
import StripeCheckout from "react-stripe-checkout";
import { Button, Segment, Divider, Label } from "semantic-ui-react";
import calculateCartTotal from "../../utils/calculateCartTotal";
import title from '../../utils/title';
import baseUrl from "../../utils/baseUrl";
import cookie from 'js-cookie';
import axios from 'axios';

function CartSummary({ products, handleCheckout, success, currency, code }) {
  const [cartAmount, setCartAmount] = React.useState(0);
  const [stripeAmount, setStripeAmount] = React.useState(0);
  const [isCartEmpty, setCartEmpty] = React.useState(false);
  const [discountedAmount, setDiscountedAmount] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [codeApplied, setCodeApplied] = React.useState(!!code);
  const [voucher, setVoucher] = React.useState(code);
  const [voucherCode, setVoucherCode] = React.useState(code ? code.code : '');
  const [error, setError] = React.useState('');
  const [codeSuccess, setCodeSuccess] = React.useState('');

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
      ? (setCartAmount(cartTotal), setStripeAmount(stripeTotal), setDiscountedAmount(discountAmount))
      : (setCartAmount(cartTotalEuro), setStripeAmount(stripeTotalEuro), setDiscountedAmount(discountAmountEuro));
    setCartEmpty(products.length === 0);
  }, [products, voucher]);

  function handleVoucherSubmit() {
    try {
      setLoading(true);
      const url = `${baseUrl}/api/code`;
      const token = cookie.get('token');
      const headers = { Authorization: token };
      const payload = { code: voucherCode };
      const response = await axios.put(url, payload, { headers });
      setError('');
      setCodeApplied(true);
      setVoucher(response.data);
      setCodeSuccess('Coupon code applied to your cart successfully.');
    } catch (error) {
      setError(error.message);
      setCodeSuccess('');
    } finally {
      setLoading(false);
    }
  }

  function handleVoucherRemove() {
    try {
      setLoading(true);
      const url = `${baseUrl}/api/code`;
      const token = cookie.get('token');
      const headers = { Authorization: token };
      const params = { code: voucherCode };
      const response = await axios.delete(url, { params, headers });
      setError('');
      setCodeApplied(false);
      setVoucher(null);
      setCodeSuccess(response.data);
    } catch (error) {
      setError(error.message);
      setCodeSuccess('');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Divider />
      <Segment clearing size="large">
        {
          discountedAmount ?
            <>
              <strong>Sub total:</strong>
              <span style={{ textDecoration: 'line-through' }}>{!currency || currency == 'usd' ? '€' : '$'}{cartAmount + discountedAmount}</span>
              <Label color='green'>{!currency || currency == 'usd' ? '€' : '$'}{cartAmount}</Label>
            </>
            :
            <><strong>Sub total:</strong> `€${cartAmount}`</>
        }
        <Item.Meta>
          <Form loading={loading} error={!!error} success={!!codeSuccess} onSubmit={handleVoucherSubmit}>
            <Message success content={codeSuccess} />
            <Message error content={error} />
            <Form.Input
              placeholder='Coupon code'
              name='code'
              disabled={loading || codeApplied}
              value={voucherCode}
              onChange={(_event, data) => setVoucherCode(data)}
            />
            <Button disabled={loading || codeApplied} type='submit' icon='add' />
            <Button disabled={loading || !codeApplied} icon='remove' onClick={handleVoucherRemove} />
          </Form>
        </Item.Meta>
        <StripeCheckout
          name={title}
          amount={stripeAmount}
          image={products.length > 0 ? products[0].product.mediaUrl : ""}
          currency={currency === "usd" ? "USD" : "EUR"}
          shippingAddress={true}
          billingAddress={true}
          zipCode={true}
          stripeKey={process.env.STRIPE_SECRET_KEY}
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
