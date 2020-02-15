import {
  Table,
  Checkbox,
  Header,
  Icon,
  Image,
  Rating
} from "semantic-ui-react";
import formateDate from "../../utils/formatDate";
import baseUrl from "../../utils/baseUrl";
import axios from "axios";
import cookie from "js-cookie";

function DiscountActivity({ totalDiscounts }) {
  console.log(totalDiscounts);

  return (
    <div style={{ margin: "2em 0" }}>
      <Header as="h2">
        <Icon name="bolt" />
        Discount Activity
      </Header>
      <Table compact celled definition>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell />
            <Table.HeaderCell>Products</Table.HeaderCell>
            <Table.HeaderCell>Discount </Table.HeaderCell>
            <Table.HeaderCell>Start Date</Table.HeaderCell>
            <Table.HeaderCell>End Date</Table.HeaderCell>
            <Table.HeaderCell>Active</Table.HeaderCell>
            <Table.HeaderCell>Delete</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {totalDiscounts.map(
            discount =>
              discount.unitType === "product" && (
                <ProductDiscountDetails
                  key={discount._id}
                  discounts={discount}
                  allDiscounts={totalDiscounts}
                />
              )
          )}
        </Table.Body>
      </Table>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell />
            <Table.HeaderCell>Categories/Category</Table.HeaderCell>
            <Table.HeaderCell>Discount </Table.HeaderCell>
            <Table.HeaderCell>Start Date</Table.HeaderCell>
            <Table.HeaderCell>End Date</Table.HeaderCell>
            <Table.HeaderCell>Active</Table.HeaderCell>
            <Table.HeaderCell>Delete</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {totalDiscounts.map(
            discount =>
              discount.unitType === "category" && (
                <CategoryDiscountDetails
                  key={discount._id}
                  discounts={discount}
                  allDiscounts={totalDiscounts}
                />
              )
          )}
        </Table.Body>
      </Table>
    </div>
  );
  function ProductDiscountDetails({ discounts, allDiscounts }) {
    const [discountList, setDiscountList] = React.useState(allDiscounts);
    const {
      products,
      isActive,
      _id,
      discountPercentage,
      startDate,
      endDate
    } = discounts;
    console.log(_id);
    const [active, setActive] = React.useState(discounts.isActive);
    // const averageRating = calculateRatingMedian(products.ratings);
    const isFirstRunPermission = React.useRef(true);
    const isFirstRunDelete = React.useRef(true);

    React.useEffect(() => {
      if (isFirstRunPermission.current) {
        isFirstRunPermission.current = false;
        return;
      }
      updateActivePermission();
    }, [active]);

    React.useEffect(() => {
      if (isFirstRunDelete.current) {
        isFirstRunDelete.current = false;
        return;
      }
      handleDelete();
    }, [discountList]);

    function handleToggleChange() {
      setActive(prevState => !prevState);
    }

    async function updateActivePermission() {
      const url = `${baseUrl}/api/discount`;
      const payload = { discountId: _id, isActive: active ? true : false };
      await axios.put(url, payload);
    }

    async function handleDelete(id) {
      const url = `${baseUrl}/api/discount`;
      const token = cookie.get("token");
      const headers = { Authorization: token };
      const params = { discountId: id };
      const response = axios.delete(url, params, headers);
      setDiscountList(response.data);
    }

    return (
      <Table.Row>
        <Table.Cell collapsing>
          <Checkbox checked={active} toggle onChange={handleToggleChange} />
        </Table.Cell>
        <Table.Cell>
          {products.map(p => (
            <Header as="h4" image>
              <Image src={p.mediaUrl} rounded size="mini" />
              <Header.Content>{p.name}</Header.Content>
              <Header.Subheader>
                <Rating size="tiny" icon="star" disabled maxRating={5} />
              </Header.Subheader>
            </Header>
          ))}
        </Table.Cell>
        <Table.Cell>{`%${discountPercentage}`}</Table.Cell>
        <Table.Cell>{formateDate(startDate)}</Table.Cell>
        <Table.Cell>{formateDate(endDate)}</Table.Cell>
        <Table.Cell>{active ? "Yes" : "No"}</Table.Cell>
        <Table.Cell>
          <Icon name="delete" onClick={() => handleDelete(_id)} />
        </Table.Cell>
      </Table.Row>
    );
  }

  function CategoryDiscountDetails({ discounts, allDiscounts }) {
    const [discountList, setDiscountList] = React.useState(allDiscounts);
    const {
      categories,
      products,
      _id,
      discountPercentage,
      startDate,
      endDate
    } = discounts;
    // const { categories } = discounts;
    const [active, setActive] = React.useState(discounts.isActive);
    // const averageRating = calculateRatingMedian(products.ratings);
    const isFirstRunPermission = React.useRef(true);
    const isFirstRunDelete = React.useRef(true);

    React.useEffect(() => {
      if (isFirstRunPermission.current) {
        isFirstRunPermission.current = false;
        return;
      }
      updateActivePermission();
    }, [active]);

    React.useEffect(() => {
      if (isFirstRunDelete.current) {
        isFirstRunDelete.current = false;
        return;
      }
    }, [discountList]);

    function handleToggleChange() {
      setActive(prevState => !prevState);
    }

    async function updateActivePermission() {
      const url = `${baseUrl}/api/discount`;
      const payload = { discountId: _id, isActive: active ? true : false };
      await axios.put(url, payload);
    }

    async function handleDelete(id) {
      const url = `${baseUrl}/api/discount`;
      console.log(id);
      const payload = { discountId: id };
      const response = await axios.delete(url, payload);
      setDiscountList(response.data);
    }

    console.log(products.map(p => p.categories.map(c => c)));

    return (
      <Table.Row>
        <Table.Cell collapsing>
          <Checkbox checked={active} toggle onChange={handleToggleChange} />
        </Table.Cell>
        <Table.Cell>
          <Header as="h4">
            <Header.Subheader>
              {categories.toString().toUpperCase()}
            </Header.Subheader>
          </Header>
        </Table.Cell>
        <Table.Cell>{`%${discountPercentage}`}</Table.Cell>
        <Table.Cell>{formateDate(startDate)}</Table.Cell>
        <Table.Cell>{formateDate(endDate)}</Table.Cell>
        <Table.Cell>{active ? "Yes" : "No"}</Table.Cell>
        <Table.Cell>
          <Icon name="x" onClick={_id => handleDelete(_id)} />
        </Table.Cell>
      </Table.Row>
    );
  }
}

export default DiscountActivity;
