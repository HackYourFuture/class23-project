import {
  Header,
  List,
  Image,
  Button,
  Label,
  Segment,
  Icon,
  Container
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
          {productDiscounts.map(pd => (
            <List.Item>
              <Label.Group>
                <Label color="red" tag>
                  {`%${pd.discountPercentage}`}
                </Label>
              </Label.Group>
              {pd.products.map(p => (
                <Image size="small" src={p.mediaUrl} />
              ))}

              <List.Header>Products:</List.Header>
              {pd.products.map(p => (
                <List.Item as="span">{p.name}</List.Item>
              ))}

              <List.Content>
                <Button
                  floated="right"
                  color="green"
                  onClick={() => router.push(`/offer?discountId=${pd._id}`)}
                >
                  See details
                </Button>
                <List.Description>
                  {productPhrase(pd.products, pd.discountPercentage)}
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
              <List.Content>
                <Label.Group>
                  <Label color="red" tag>{`%${c.discountPercentage}`}</Label>
                </Label.Group>
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
