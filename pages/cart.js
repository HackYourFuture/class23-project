import { useState } from 'react';
import { logEvent } from '../utils/analytics';
import { Segment, Modal, Image, Button, Header } from 'semantic-ui-react';
import CartItemList from '../components/Cart/CartItemList';
import CartSummary from '../components/Cart/CartSummary';
import { parseCookies } from 'nookies';
import axios from 'axios';
import baseUrl from '../utils/baseUrl';
import cookie from 'js-cookie';
import catchErrors from '../utils/catchErrors';
import { redirectUser } from '../utils/auth';

function Cart({ products, user, currency, code }, ctx) {
  const [cartProducts, setCartProducts] = React.useState(products);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [lastOrder, setLastOrder] = React.useState({});

  console.log(products);
  async function handleRemoveFromCart(productId) {
    const url = `${baseUrl}/api/cart`;
    const token = cookie.get('token');
    const payload = {
      params: { productId },
      headers: { Authorization: token },
    };
    const response = await axios.delete(url, payload);
    console.log(response.data);
    setCartProducts(response.data);
    logEvent('User', `User ${user.name} removed product from their cart`);
  }

  async function handleCheckout(paymentData) {
    try {
      setLoading(true);
      const url = `${baseUrl}/api/checkout`;
      const token = cookie.get("token");
      const payload = { paymentData, currency };
      const headers = { headers: { Authorization: token } };
      const response = await axios.post(url, payload, headers);
      setLastOrder(response.data);
      setSuccess(true);
      logEvent('User', `User ${user.name} made a payment! `);
    } catch (error) {
      catchErrors(error, window.alert);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (success) {
      handleInfoMail();
      return;
    }

    async function handleInfoMail() {
      try {
        const url = `${baseUrl}/api/info-mail`;
        const token = cookie.get('token');
        const payload = { lastOrder, email: user.email };
        const headers = { headers: { Authorization: token } };
        await axios.put(url, payload, headers);
      } catch (error) {
        catchErrors(error, window.alert);
      }
    }
  }, [success]);

  return (
    <>
      <Segment loading={loading}>
        <CartItemList
          handleRemoveFromCart={handleRemoveFromCart}
          user={user}
          products={cartProducts}
          success={success}
          currency={currency}
        />
        <CartSummary
          products={cartProducts}
          handleCheckout={handleCheckout}
          success={success}
          currency={currency}
          code={code}
        />
      </Segment>
      {success && (
        <Modal
          centered={false}
          closeIcon
          open={isOpen}
          size="large"
          style={{
            marginTop: '0px !important',
            position: 'relative',
            top: '20px',
          }}
        >
          <Header content="You can rate your products from your order list now!" />
          <Modal.Content image>
            <Image floated="left" src="../static/click-to-rate.png" />
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" onClick={() => redirectUser(ctx, '/account')}>
              I'd love to!
            </Button>
            <Button color="red" onClick={() => setIsOpen(false)}>
              Nah..Maybe later.
            </Button>
          </Modal.Actions>
        </Modal>
      )}
    </>
  );
}

Cart.getInitialProps = async ctx => {
  const { token } = parseCookies(ctx);
  if (!token) {
    return { products: [] };
  }
  const url = `${baseUrl}/api/cart`;
  const payload = { headers: { Authorization: token } };
  const response = await axios.get(url, payload);
  return { ...response.data };
};

export default Cart;
