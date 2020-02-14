import {
  Header,
  List,
  Image,
  Button,
  Container,
  Label,
  Segment
} from "semantic-ui-react";

function Offers() {
  return (
    <>
      <Header as="h1" textAlign="center">
        Top Deals
      </Header>
      <Header dividing as="h3">
        Amount Based
      </Header>
      <Segment>
        <List>
          <List.Item>
            <Image
              size="tiny"
              src="https://react.semantic-ui.com/images/avatar/small/rachel.png"
            />
            <p>if todays deal ?</p>
            <Label attached="top right" color="red" tag>
              Todays deal!
            </Label>
            <List.Content>
              <Button floated="right">See details</Button>
              <List.Header as="a">Product Name</List.Header>
              <p>Ratings</p>
              <List.Description>
                This product is <b>--discount percentage--</b> off on purchase
                <b>--requiredAmount--</b> or more!
              </List.Description>
            </List.Content>
          </List.Item>
        </List>
      </Segment>

      <Header dividing as="h3">
        Product Based
      </Header>
      <Segment>
        <List divided>
          <List.Item>
            <Image
              size="tiny"
              src="https://react.semantic-ui.com/images/avatar/small/rachel.png"
            />
            <p>if todays deal ?</p>
            <Label attached="top right" color="red" tag>
              Todays deal!
            </Label>
            <List.Content>
              <Button floated="right">See details</Button>
              <List.Header as="a">Product Name</List.Header>
              <p>Ratings</p>
              <List.Description>
                This product is <b>--discount percentage--</b> off on purchase
                <b>--product/category--</b> or more!
              </List.Description>
            </List.Content>
          </List.Item>
          <List.Item>
            <Image
              size="tiny"
              src="https://react.semantic-ui.com/images/avatar/small/rachel.png"
            />
            <p>if todays deal ?</p>
            <Label attached="top right" color="red" tag>
              Todays deal!
            </Label>
            <List.Content>
              <Button floated="right">See details</Button>
              <List.Header as="a">Product Name</List.Header>
              <p>Ratings</p>
              <List.Description>
                This product is <b>--discount percentage--</b> off on purchase
                <b>--product/category--</b> or more!
              </List.Description>
            </List.Content>
          </List.Item>
        </List>
      </Segment>
    </>
  );
}

export default Offers;
