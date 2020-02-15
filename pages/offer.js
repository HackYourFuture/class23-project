import baseUrl from "../utils/baseUrl";
import axios from "axios";
import formatDate from "../utils/formatDate";
import { calculateDiscount } from "../utils/discount";
import { Card, Image, Header, Label, List, Segment } from "semantic-ui-react";
const Offer = ({ discounts }) => {
  let [products, setProducts] = React.useState([]);
  console.log(discounts);
  React.useEffect(() => {
    async function fetchProducts() {
      try {
        const url = `${baseUrl}/api/products`;
        const response = await axios.get(url);
        setProducts(response.data);
      } catch (error) {
        console.log(error);
      }
    }
    fetchProducts();
  }, []);
  const totalProducts = products;
  console.log(totalProducts.products);
  console.log("all", products);
  return (
    <>
      {discounts.map(d =>
        d.unitType === "product" ? (
          <Segment>
            <Header as="h2">Product Information</Header>
            <Image.Group>
              {d.products.map(p => (
                <Image key={p._id} src={p.mediaUrl} size="medium" />
              ))}
            </Image.Group>
            <Label color="olive" size="large">{`Ends in ${formatDate(
              d.endDate
            )}`}</Label>
            <List.Item>
              <strong>Names:</strong>
              {d.products.map(p => (
                <span>{`${p.name} | `}</span>
              ))}
            </List.Item>
            <List.Item>
              <strong>Multiple Purchase Required:</strong>{" "}
              {d.multipleUnits ? "Yes" : "No"}
            </List.Item>
            <List>
              <List.Item>
                <strong>Discount:</strong> {`%${d.discountPercentage}`}
              </List.Item>

              <List.Item>
                <strong>Discounted Prices:</strong>
                {d.products.map(p => (
                  <Label size="medium">{`${p.price} /${calculateDiscount(
                    p.price,
                    d.discountPercentage
                  )} `}</Label>
                ))}
              </List.Item>
            </List>
          </Segment>
        ) : (
          <Segment>
            <Header>Category Information</Header>
            <Header as="h4">About Discount:</Header>
            <List>
              <List.Item>
                <strong>Categories:</strong>
                {`${[...d.categories]} `}
              </List.Item>
              <List.Item content="Things you can buy"></List.Item>
            </List>
          </Segment>
        )
      )}
    </>
  );
};

Offer.getInitialProps = async ({ query: { discountId } }) => {
  const url = `${baseUrl}/api/discount`;
  console.log(discountId);
  const payload = { params: { discountId } };
  const response = await axios.get(url, payload);
  return response.data;
};
export default Offer;
