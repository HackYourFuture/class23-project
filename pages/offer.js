import baseUrl from "../utils/baseUrl";
import axios from "axios";
import formatDate from "../utils/formatDate";
import { calculateDiscount } from "../utils/discount";
import {
  Card,
  Image,
  Header,
  Label,
  List,
  Segment,
  Item,
  Button
} from "semantic-ui-react";
const Offer = ({ discounts, productId }) => {
  let [products, setProducts] = React.useState([]);
  console.log(productId);
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
          <>
            <Header as="h2">Product Information</Header>
            <Segment>
              {d.multipleUnits ?
                d.products.map(p => (
                  <Item.Group>
                    <Item key={`discount_detail_product_multiple_${d._id}_${p.name}`}>
                      <Item.Image src={p.mediaUrl} size="medium" />
                      <Item.Content>
                        <Item.Header>{p.name}</Item.Header>
                        <Item.Description>
                          <p>
                            <strong>Discount Percentage:</strong>{" "}
                            {`%${d.discountPercentage}`}
                          </p>
                          <Label.Group>
                            <span>
                              <strong>{`New Price: `}</strong>
                            </span>
                            <Label
                              style={{ textDecoration: "line-through" }}
                              size="medium"
                            >{`${p.price.toFixed(2)}`}</Label>
                            <Label
                              size="medium"
                              color="green"
                            >{`${calculateDiscount(
                              p.price,
                              d.discountPercentage
                            )}`}</Label>
                          </Label.Group>
                          <p>
                            {`Saved: $${(p.price -
                              calculateDiscount(p.price, d.discountPercentage)).toFixed(2)}`}
                          </p>
                        </Item.Description>
                        <Item.Extra></Item.Extra>
                      </Item.Content>
                    </Item>
                  </Item.Group>
                )) :
                <Item.Group>
                  <Item>
                    <Item.Image src={d.product.mediaUrl} size="medium" />
                    <Item.Content>
                      <Item.Header>{d.product.name}</Item.Header>
                      <Item.Description>
                        <p>
                          <strong>Discount Percentage:</strong>{" "}
                          {`%${d.discountPercentage}`}
                        </p>
                        <Label.Group>
                          <span>
                            <strong>{`New Price: `}</strong>
                          </span>
                          <Label
                            style={{ textDecoration: "line-through" }}
                            size="medium"
                          >{`${d.product.price.toFixed(2)}`}</Label>
                          <Label
                            size="medium"
                            color="green"
                          >{`${calculateDiscount(
                            d.product.price,
                            d.discountPercentage
                          )}`}</Label>
                        </Label.Group>
                        <p>
                          {`Saved: $${(d.product.price -
                            calculateDiscount(d.product.price, d.discountPercentage)).toFixed(2)}`}
                        </p>
                      </Item.Description>
                      <Item.Extra></Item.Extra>
                    </Item.Content>
                  </Item>
                </Item.Group>
              }
              <Segment textAlign="center">
                <Label color="olive" size="large">{`Ends in ${formatDate(
                  d.endDate
                )}`}</Label>
              </Segment>
            </Segment>
          </>
        ) : (
            <>
              <Header>Category Information</Header>
              <Segment>
                <Header as="h4">About Discount:</Header>
                <List>
                  <List.Item>
                    <strong>Categories:</strong>
                    {d.multipleUnits ? `${d.categories.map(c => c.toUpperCase() + ' ')}` : d.category.toUpperCase()}
                  </List.Item>
                  {
                    d.multipleUnits ?
                      <List.Item content="In order to take advantage of this discount you need to purchase at least one product from the categories specified above."></List.Item>
                      :
                      <List.Item content={`In order to take advantage of this discount you need to purchase at least ${d.amountRequired} product(s) from the category specified above.`}></List.Item>
                  }

                </List>
                <Segment textAlign="center">
                  <Label color="olive" size="large">{`Ends in ${formatDate(
                    d.endDate
                  )}`}</Label>
                </Segment>
              </Segment>
            </>
          )
      )}
    </>
  );
};

Offer.getInitialProps = async ({ query: { discountId, productId } }) => {
  const url = `${baseUrl}/api/discount`;
  console.log(discountId);
  const payload = { params: { discountId, productId } };
  const response = await axios.get(url, payload);
  return response.data;
};
export default Offer;
