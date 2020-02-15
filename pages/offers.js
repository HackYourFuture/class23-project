import {
  Header,
  List,
  Image,
  Button,
  Icon,
  Label,
  Segment
} from "semantic-ui-react";
import { useRouter } from "next/router";
import baseUrl from "../utils/baseUrl";
import { productPhrase, categoryPhrase } from "../utils/discount";
import axios from "axios";

function Offers({ discounts }) {
  const router = useRouter();
  const productDiscounts = discounts.filter(
    p => p.unitType === "product" && p.isActive
  );
  const categoryDiscounts = discounts.filter(
    p => p.unitType === "category" && p.isActive
  );
  console.log(productDiscounts);
  console.log(categoryDiscounts);

  return (
    <>
      <Header as="h1" textAlign="center">
        Top Deals
      </Header>
      <Header dividing as="h3">
        Products
      </Header>
      <Segment>
        <List divided>
          {productDiscounts.map(p => (
            <List.Item>
              {p.products.map(p => (
                <Image size="small" src={p.mediaUrl} />
              ))}
              <Label attached="top right" color="red" tag>
                {p.discountPercentage}
              </Label>
              <List.Header>Products:</List.Header>
              {p.products.map(p => (
                <List.Item as="span">{p.name}</List.Item>
              ))}

              <List.Content>
                <Button
                  floated="right"
                  color="green"
                  onClick={() => router.push(`/offer?discountId=${p._id}`)}
                >
                  See details
                </Button>
                <List.Description>
                  {productPhrase(p.products, p.discountPercentage)}
                </List.Description>
              </List.Content>
            </List.Item>
          ))}
        </List>
      </Segment>

      <Header dividing as="h3">
        Category
      </Header>
      <Segment>
        <List divided>
          {categoryDiscounts.map(c => (
            <List.Item>
              <Label attached="top right" color="red" tag>
                {`%${c.discountPercentage}`}
              </Label>
              <List.Content>
                <Button
                  floated="right"
                  color="green"
                  onClick={() => router.push(`/offer?discountId=${c._id}`)}
                >
                  See details
                </Button>
                {c.categories.map(c => (
                  <List.Header as="a">{c.toUpperCase()}</List.Header>
                ))}
                <List.Description>
                  {categoryPhrase(c.categories, c.discountPercentage)}
                </List.Description>
              </List.Content>
            </List.Item>
          ))}
        </List>
      </Segment>
    </>
  );
}

Offers.getInitialProps = async () => {
  const url = `${baseUrl}/api/discount`;
  const isActive = true;
  const payload = { params: { isActive } };
  const response = await axios.get(url);
  return response.data;
};

export default Offers;
