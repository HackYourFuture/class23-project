import {
  Header,
  Segment,
  Button,
  Icon,
  Item,
  Message,
} from "semantic-ui-react";
import { redirectUser } from "../../utils/auth";
import CartItem from './CartItem';

function CartItemList({
  products,
  user,
  handleRemoveFromCart,
  success,
  currency
}, ctx) {

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
      {products.map(p => <CartItem handleRemoveFromCart={handleRemoveFromCart} currency={currency} cartProduct={p} />)}
    </Item.Group>
  );
}

export default CartItemList;
