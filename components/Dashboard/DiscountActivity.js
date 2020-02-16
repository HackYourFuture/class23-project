import {
  Table,
  Checkbox,
  Header,
  Icon,
  Image,
  Message
} from "semantic-ui-react";
import formateDate from "../../utils/formatDate";
import baseUrl from "../../utils/baseUrl";
import axios from "axios";
import cookie from "js-cookie";
import { useState } from "react";
import { UNIT_TYPES } from "../../utils/discount";
import mongoose from "mongoose";

function DiscountActivity({ totalDiscounts }) {
  const [discounts, setDiscounts] = useState(totalDiscounts);

  async function handleToggleChange(discount, activeSetter, activityIndicator) {
    activityIndicator(true);
    const url = `${baseUrl}/api/discount`;
    const token = cookie.get("token");
    const headers = { headers: { Authorization: token } };
    const payload = { discountId: discount._id, isActive: !discount.isActive };
    try {
      await axios.put(url, payload, headers);
      discount.isActive = !discount.isActive;
      activeSetter(!discount.isActive);
      setDiscounts(discounts);
    } catch (error) {
      console.warn(error);
      console.log(error.message);
      activeSetter(discount.isActive);
    } finally {
      activityIndicator(false);
    }
  }

  async function handleDelete(discount, activityIndicator) {
    activityIndicator(true);
    const url = `${baseUrl}/api/discount`;
    const token = cookie.get("token");
    const payload = {
      params: { discountId: discount._id },
      headers: { Authorization: token }
    };
    try {
      await axios.delete(url, payload);
      setDiscounts(discounts.filter(disc => !mongoose.Types.ObjectId(disc._id).equals(discount._id)));
    } catch (error) {
      console.warn(error);
    } finally {
      //activityIndicator(false);
    }
  }

  if (discounts.length === 0) {
    return <Message header="Empty set!" content="You have not created any discounts yet!" />
  }
  return (
    <div style={{ margin: "2em 0" }}>

      <Header as="h2">
        <Icon name="bolt" />
        Discount Activity
      </Header>
      {discounts.filter(disc => disc.unitType === UNIT_TYPES.product).length > 0 &&
        <>
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
              {discounts.filter(disc => disc.unitType === UNIT_TYPES.product).map(
                discount => (
                  <ProductDiscountDetails
                    key={`dashboard_product_discount_${discount._id}`}
                    discount={discount}
                    handleDelete={handleDelete}
                    handleToggleChange={handleToggleChange}
                  />
                )
              )}
            </Table.Body>
          </Table>
        </>
      }
      {discounts.filter(disc => disc.unitType === UNIT_TYPES.category).length > 0 &&
        <>
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
              {discounts.filter(disc => disc.unitType === UNIT_TYPES.category).map(
                discount => (
                  <CategoryDiscountDetails
                    key={`dashboard_category_discount_${discount._id}`}
                    discount={discount}
                    handleDelete={handleDelete}
                    handleToggleChange={handleToggleChange}
                  />
                )
              )}
            </Table.Body>
          </Table>
        </>
      }
    </div >
  );
  function ProductDiscountDetails({ discount, handleDelete, handleToggleChange }) {
    const [active, setActive] = React.useState(discount.isActive);
    const [toggling, setToggling] = useState(false);
    const [removing, setRemoving] = useState(false);
    if (discount.product) console.log({ product: discount.product.name });
    return (
      <Table.Row>
        <Table.Cell collapsing>
          <Checkbox
            checked={active}
            toggle
            disabled={toggling}
            onChange={() => handleToggleChange(discount, setActive, setToggling)}
          />
        </Table.Cell>
        <Table.Cell>
          {discount.multipleUnits ? discount.products.map(p => (
            <Header key={`table_header_discount_product_${p._id}`} as="h4" image>
              <Image src={p.mediaUrl} rounded size="mini" />
              <Header.Content>{p.name}</Header.Content>
            </Header>
          )) :
            <Header as="h4" image>
              <Image src={discount.product.mediaUrl} rounded size="mini" />
              <Header.Content>{discount.product.name}</Header.Content>
            </Header>
          }
        </Table.Cell>
        <Table.Cell>{`%${discount.discountPercentage}`}</Table.Cell>
        <Table.Cell>{formateDate(discount.startDate)}</Table.Cell>
        <Table.Cell>{formateDate(discount.endDate)}</Table.Cell>
        <Table.Cell>{active ? "Yes" : "No"}</Table.Cell>
        <Table.Cell>
          <Icon name="delete" disabled={removing} onClick={() => handleDelete(discount, setRemoving)} />
        </Table.Cell>
      </Table.Row>
    );
  }

  function CategoryDiscountDetails({ discount, handleDelete, handleToggleChange }) {
    const [active, setActive] = React.useState(discount.isActive);
    const [toggling, setToggling] = useState(false);
    const [removing, setRemoving] = useState(false);

    return (
      <Table.Row>
        <Table.Cell collapsing>
          <Checkbox disabled={toggling} checked={active} toggle onChange={() => handleToggleChange(discount, setActive, setToggling)} />
        </Table.Cell>
        <Table.Cell>
          <Header as="h4">
            <Header.Subheader>
              {discount.multipleUnits ? discount.categories.toString().toUpperCase() : discount.category.toUpperCase()}
            </Header.Subheader>
          </Header>
        </Table.Cell>
        <Table.Cell>{`%${discount.discountPercentage}`}</Table.Cell>
        <Table.Cell>{formateDate(discount.startDate)}</Table.Cell>
        <Table.Cell>{formateDate(discount.endDate)}</Table.Cell>
        <Table.Cell>{active ? "Yes" : "No"}</Table.Cell>
        <Table.Cell>
          <Icon disabled={removing} name="x" onClick={() => handleDelete(discount, setRemoving)} />
        </Table.Cell>
      </Table.Row>
    );
  }
}

export default DiscountActivity;
