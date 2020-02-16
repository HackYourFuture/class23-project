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
import { productsPhrase, productPhrase, categoriesPhrase, categoryPhrase } from "../utils/discount";
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
            <List.Item key={pd._id}>
              <Label.Group>
                <Label color="red" tag>
                  {`%${pd.discountPercentage}`}
                </Label>
              </Label.Group>
              {pd.multipleUnits ? pd.products.map(p => (
                <Image key={`discount_products_multiple_image_${pd._id}_${p.name}`} size="small" src={p.mediaUrl} />
              )) : <Image size="small" src={pd.product.mediaUrl} />}

              <List.Header>Products:</List.Header>
              {pd.multipleUnits ? pd.products.map(p => (
                <List.Item key={`discount_products_multiple_header_${pd._id}_${p.name}`} as="span">{p.name + ' '}</List.Item>
              )) : <List.Item as="span">{pd.product.name}</List.Item>}

              <List.Content>
                <Button
                  floated="right"
                  color="green"
                  onClick={() => router.push(`/offer?discountId=${pd._id}`)}
                >
                  See details
                </Button>
                <List.Description>
                  {pd.multipleUnits ? productsPhrase(pd.products, pd.discountPercentage) : productPhrase(pd.product, pd.discountPercentage, pd.amountRequired)}
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
            <List.Item key={c._id}>
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
                {c.multipleUnits ? c.categories.map(cat => (
                  <List.Header key={`discount_category_multiple_${c._id}_${cat}`} as="a">{cat.toUpperCase() + ' '}</List.Header>
                )) : <List.Header as="a">{c.category.toUpperCase()}</List.Header>}
                <List.Description>
                  {c.multipleUnits ? categoriesPhrase(c.categories, c.discountPercentage) : categoryPhrase(c.category, c.discountPercentage, c.amountRequired)}
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
