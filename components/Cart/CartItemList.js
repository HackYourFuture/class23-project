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

function CartItemList({ products, user, handleRemoveFromCart, success }) {
  console.log(products);
  const router = useRouter();

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
            <Button color="orange" onClick={() => router.push("/")}>
              View Products
            </Button>
          ) : (
            <Button color="blue" onClick={() => router.push("/login")}>
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
          <Item.Content fluid>
            <Item.Header
              as="a"
              onClick={() => router.push(`/product?_id=${p.product._id}`)}
            >
              {p.product.name}
            </Item.Header>
            <Item.Meta>
              {`${p.quantity} x`}
              <span
                style={{
                  textDecoration: p.discountApplied ? "line-through" : "none"
                }}
              >{`$${p.product.price}`}</span>
            </Item.Meta>
            {p.discountApplied && (
              <Label color="green">
                {`$${p.product.price - p.discountAmount}`}
              </Label>
            )}

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
