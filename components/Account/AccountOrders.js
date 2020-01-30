import {
  Header,
  Accordion,
  Label,
  Segment,
  Icon,
  Button,
  List,
  Image,
  Rating,
  Modal
} from "semantic-ui-react";
import { useRouter } from "next/router";
import baseUrl from "../../utils/baseUrl";
import cookie from "js-cookie";
import axios from "axios";
import formateDate from "../../utils/formatDate";

function AccountOrders({ orders, _id }) {
  const [isClicked, setIsClicked] = React.useState(false);
  const [productId, setProductId] = React.useState("");
  const [ratings, setRatings] = React.useState(0);
  const router = useRouter();

  console.log(_id);
  console.log(orders);

  async function getRatings() {
    const url = `${baseUrl}/api/ratings`;
    const token = cookie.get("token");
    const payload = { headers: { Authorization: token } };
    const response = await axios.get(url, payload);
    setRatings(response.data);
  }

  React.useEffect(() => {
    getRatings();
  }, []);
  function handleClick(product) {
    console.log("clicked");
    const pid = product;
    setProductId(pid);
    if (product == pid) {
      setIsClicked(true);
    }
  }

  console.log(productId);

  async function handleOnRate(e, { rating }) {
    const url = `${baseUrl}/api/ratings`;
    const token = cookie.get("token");
    const headers = { headers: { Authorization: token } };
    const payload = { productId: productId, rating, userId: _id };
    const response = await axios.post(url, payload, headers);
    console.log(response.data);
    console.log("i ran");
    setIsClicked(false);
  }

  function mapOrdersToPanels(orders) {
    return orders.map(order => ({
      key: order._id,
      title: {
        content: <Label color="blue" content={formateDate(order.createdAt)} />
      },
      content: {
        content: (
          <>
            <List.Header as="h3">
              Total: ${order.total}
              <Label
                content={order.email}
                icon="mail"
                basic
                horizontal
                style={{ marginLeft: "1em" }}
              />
            </List.Header>
            <List>
              {order.products.map(p => (
                <List.Item key={p.product._id}>
                  <Image avatar src={p.product.mediaUrl} />
                  <List.Content>
                    <List.Header>{p.product.name}</List.Header>
                    <List.Description>
                      {p.quantity} · ${p.product.price}
                    </List.Description>
                  </List.Content>

                  {isClicked ? (
                    <Rating
                      icon="star"
                      maxRating="5"
                      size="tiny"
                      onRate={handleOnRate}
                      rating={p.product.ratings[0].star}
                    />
                  ) : (
                    <Button
                      onClick={() => handleClick(p.product._id)}
                      content="click to rate"
                    />
                  )}

                  <List.Content floated="right">
                    <Label tag color="red" size="tiny">
                      {p.product.sku}
                    </Label>
                  </List.Content>
                </List.Item>
              ))}
            </List>
          </>
        )
      }
    }));
  }

  return (
    <>
      <Header as="h2">
        <Icon name="folder open" />
        Order History
      </Header>
      {orders.length === 0 ? (
        <Segment inverted tertiary color="grey" textAlign="center">
          <Header icon>
            <Icon name="copy outline" />
            No past orders.
          </Header>
          <div>
            <Button onClick={() => router.push("/")} color="orange">
              View Products
            </Button>
          </div>
        </Segment>
      ) : (
        <Accordion
          fluid
          styled
          exclusive={false}
          panels={mapOrdersToPanels(orders)}
        />
      )}
    </>
  );
}

export default AccountOrders;
