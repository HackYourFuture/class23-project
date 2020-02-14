import {
  Table,
  Checkbox,
  Header,
  Icon,
  Image,
  Rating
} from "semantic-ui-react";
import formateDate from "../../utils/formatDate";
import calculateRatingMedian from "../../utils/calculateRatingMedian";

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
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {totalDiscounts.map(discount => (
            <DiscountDetails key={discount._id} discounts={discount} />
          ))}
        </Table.Body>
      </Table>
    </div>
  );
  function DiscountDetails({ discounts }) {
    const {
      products,
      isActive,
      _id,
      discountPercentage,
      startDate,
      endDate
    } = discounts;
    console.log(_id);
    const [active, setActive] = React.useState(discounts.isActive === true);
    // const averageRating = calculateRatingMedian(products.ratings);
    const isFirstRun = React.useRef(true);

    React.useEffect(() => {
      if (isFirstRun.current) {
        isFirstRun.current = false;
        return;
      }
      updateActivePermission();
    }, [admin]);

    function handleToggleChange() {
      setActive(prevState => !prevState);
    }

    async function updateActivePermission() {
      const url = `${baseUrl}/api/discount`;
      const payload = { discountId: _id, isActive: active ? true : false };
      await axios.put(url, payload);
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
                <Rating
                  size="tiny"
                  icon="star"
                  disabled
                  maxRating={5}
                  // rating={averageRating || 0}
                />
              </Header.Subheader>
            </Header>
          ))}
        </Table.Cell>
        <Table.Cell>{`%${discountPercentage}`}</Table.Cell>
        <Table.Cell>{formateDate(startDate)}</Table.Cell>
        <Table.Cell>{formateDate(endDate)}</Table.Cell>
        <Table.Cell>{isActive ? "Yes" : "No"}</Table.Cell>
      </Table.Row>
    );
  }
}

export default DiscountActivity;
