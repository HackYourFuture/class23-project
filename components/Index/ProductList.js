import React from "react";
import {
  Card,
  Container,
  Rating,
  Dropdown,
  Icon,
  Segment,
  Image,
  Label,
  Button,
  Modal,
  Message,
  Loader
} from "semantic-ui-react";
import { useRouter } from "next/router";
import calculateRatingMedian from "../../utils/calculateRatingMedian";
import { logEvent } from "../../utils/analytics";
import catchErrors from "../../utils/catchErrors";
import baseUrl from "../../utils/baseUrl";
import cookie from "js-cookie";
import axios from "axios";
import { isDiscountExpired, isDiscountStarted } from '../../utils/discount';
import { redirectUser } from "../../utils/auth";
import { categoryOptions } from '../Create/ProductCreation';

function ProductList({ products, selectCategory, user, currency }, ctx) {
  const [isOpen, setIsOpen] = React.useState();
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [showMessage, setShowMessage] = React.useState(false);

  const router = useRouter();

  console.log(products);

  function mapProductsToItems(products) {
    return products.map(product => {
      const averageRating = calculateRatingMedian(product.ratings);

      async function handleAddProductToCart() {
        try {
          logEvent(
            "User",
            `User ${user.name} added product ${name} to their cart`,
            "Product"
          );

          setLoading(true);
          const url = `${baseUrl}/api/cart`;
          const payload = { quantity: 1, productId: product._id };
          const token = cookie.get("token");
          const headers = { headers: { Authorization: token } };
          await axios.put(url, payload, headers);
          setSuccess(true);
        } catch (error) {
          catchErrors(error, window.alert);
        } finally {
          setTimeout(() => {
            setLoading(false);
          }, 1000);
          setTimeout(() => {
            setSuccess(false);
          }, 3000);
        }
      }

      return {
        header: product.name,
        image: (
          <Segment basic>
            {
              (product.discount && product.discount.isActive &&
                isDiscountStarted(product.discount) && !isDiscountExpired(product.discount)) ?
                <Label ribbon icon='gift' color='red' content={`%${product.discount.discountPercentage}`} />
                : <Label basic style={{ border: 'none' }} attached='top left' content="   " />
            }
            <Image src={product.mediaUrl} />
          </Segment>
        ),
        meta: !currency || currency === "usd"
          ? `$${product.price.toFixed(2)}`
          : `€${product.priceEuro.toFixed(2)}`,
        color: "teal",
        fluid: true,
        childKey: product._id,
        href: success ? "#!" : `/product?_id=${product._id}`,
        description: (
          <Rating
            size="tiny"
            icon="star"
            disabled
            maxRating={5}
            rating={averageRating || 0}
          />
        ),
        extra: (
          <Button
            fluid
            color="orange"
            size="mini"
            onClick={() => {
              if (user) {
                setSuccess(true);
                setShowMessage(true);
                handleAddProductToCart();
                console.log(user);
                return;
              }
              setSuccess(true);
              setIsOpen(true);
            }}
          >
            <Icon style={{ marginLeft: "5px" }} size="large" name="cart" />
            Add to cart
          </Button>
        )
      };
    });
  }

  return (
    <>
      {success && showMessage && (
        <Message success={success}>Product successfully added to cart</Message>
      )}
      <Container style={{ marginBottom: "2em" }}>
        <Dropdown
          placeholder="Select Category"
          fluid
          selection
          multiple
          closeOnChange
          closeOnEscape
          options={categoryOptions}
          onChange={selectCategory}
        />
      </Container>
      <Card.Group
        stackable
        itemsPerRow="3"
        centered
        items={mapProductsToItems(products)}
      />
      {isOpen && (
        <Modal
          closeIcon
          style={{ textAlign: "center", transform: "translateY(-50%)" }}
          open={isOpen}
          onClose={() => setIsOpen(false)}
          dimmer="inverted"
        >
          <Modal.Header>
            You didn't login yet. You can click login button to add products.
            <br /> If you don't have an account, please click Signup button.
          </Modal.Header>
          <Button
            color="red"
            style={{ margin: "15px" }}
            content="Login"
            onClick={() => redirectUser(ctx, "/login")}
          />
          <Button
            color="blue"
            style={{ margin: "15px " }}
            onClick={() => redirectUser(ctx, "/signup")}
          >
            Signup
          </Button>
        </Modal>
      )}
      {loading && (
        <Modal open={loading}>
          <Loader content="product adding process continue!" />
        </Modal>
      )}
    </>
  );
}
export default ProductList;
