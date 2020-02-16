import { useState } from "react";
import { logEvent } from "../utils/analytics";
import { useRouter } from "next/router";
import {
  Segment,
  Modal,
  Image,
  Button,
  Header,
  Form,
  Divider
} from "semantic-ui-react";
import CartItemList from "../components/Cart/CartItemList";
import CartSummary from "../components/Cart/CartSummary";
import { parseCookies } from "nookies";
import axios from "axios";
import baseUrl from "../utils/baseUrl";
import cookie from "js-cookie";
import catchErrors from "../utils/catchErrors";

function Cart({ products, user }) {
  const router = useRouter();
  const [cartProducts, setCartProducts] = React.useState(products);
  const [success, setSuccess] = useState(false);
  const [values, setValues] = React.useState("");
  const [values2, setValues2] = React.useState("");
  const [successSubmit, setSuccessSubmit] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  async function handleRemoveFromCart(productId) {
    const url = `${baseUrl}/api/cart`;
    const token = cookie.get("token");
    const payload = {
      params: { productId },
      headers: { Authorization: token }
    };
    const response = await axios.delete(url, payload);
    setCartProducts(response.data);
    logEvent("User", `User ${user.name} removed product from their cart`);
  }

  async function handleCheckout(paymentData) {
    try {
      setLoading(true);
      const url = `${baseUrl}/api/checkout`;
      const token = cookie.get("token");
      const payload = { paymentData };
      const headers = { headers: { Authorization: token } };
      await axios.post(url, payload, headers);
      setSuccess(true);
      logEvent("User", `User ${user.name} made a payment! `);
    } catch (error) {
      catchErrors(error, window.alert);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async event => {
    event.preventDefault();
    try {
      console.log("Coupon Submitted");
      const url = `${baseUrl}/api/code`;
      const payload = { values };
      const response = await axios.post(url, payload);
      await setSuccessSubmit(response.data);
      console.log("submit", response.data);
      console.log("val", values);
      await setValues2(values);
      console.log(values2);
    } catch (error) {
      setValues2("");
      setValues("");
      catchErrors(error, window.alert);
    }
  };
  const handleChange = event => {
    setValues(event.target.value);
  };

  return (
    <>
      <Segment loading={loading}>
        <CartItemList
          handleRemoveFromCart={handleRemoveFromCart}
          user={user}
          products={cartProducts}
          success={success}
        />
        <Divider />
        <Segment>
          <>Add a Promo Code</>
          <Divider hidden />
          <Form onSubmit={handleSubmit}>
            <Form.Input
              placeholder="Coupon"
              name="couponCode"
              value={values}
              onChange={handleChange}
            />
            <Form.Button content="Submit" />
            {values2.length > 2 ? <h3>Valid Discount Code</h3> : null}
          </Form>
        </Segment>
        {successSubmit === values2 ? (
          <CartSummary
            products={cartProducts}
            handleCheckout={handleCheckout}
            success={success}
            code={successSubmit}
          />
        ) : (
          <CartSummary
            products={cartProducts}
            handleCheckout={handleCheckout}
            success={success}
            code={""}
          />
        )}
      </Segment>
      {success && (
        <Modal
          centered={false}
          closeIcon
          open={isOpen}
          size="large"
          style={{
            marginTop: "0px !important",
            position: "relative",
            top: "20px"
          }}
        >
          <Header content="You can rate your products from your order list now!" />
          <Modal.Content image>
            <Image floated="left" src="../static/click-to-rate.png" />
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" onClick={() => router.push("/account")}>
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
  const url2 = `${baseUrl}/api/code`;
  const payload = { headers: { Authorization: token } };
  // const payload2 = { values };
  const response = await axios.get(url, payload);
  // const result = await axios.get(url2);
  return { products: response.data };
};

export default Cart;
