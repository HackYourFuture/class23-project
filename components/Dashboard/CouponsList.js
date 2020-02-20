import {
  Table,
  Checkbox,
  Header,
  Icon,
  Image,
  Message,
  Loader
} from "semantic-ui-react";
import baseUrl from "../../utils/baseUrl";
import axios from "axios";
import cookie from "js-cookie";

function CouponsList({ coupons }) {
  if (!coupons || coupons.length === 0) {
    return <Message header="Empty set!" content="There are no coupons yet!" />
  }
  return (
    <div style={{ margin: "2em 0" }}>

      <Header as="h2">
        <Icon name="bolt" />
        Coupon Codes
      </Header>

      <Table compact celled definition>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Seq. Number</Table.HeaderCell>
            <Table.HeaderCell>Code</Table.HeaderCell>
            <Table.HeaderCell>Amount </Table.HeaderCell>
            <Table.HeaderCell>isUsed</Table.HeaderCell>
            <Table.HeaderCell>Created At</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {coupons.map(
            (coupon, index) => (
              <Table.Row>
                <Table.Cell>{(index + 1).toString().padStart(4, '0')}</Table.Cell>
                <Table.Cell>{coupon.code}</Table.Cell>
                <Table.Cell>${coupon.amount.toFixed(2)}</Table.Cell>
                <Table.Cell>{coupon.isUsed.toString()}</Table.Cell>
                <Table.Cell>{new Date(coupon.createdAt).toDateString()}</Table.Cell>
              </Table.Row>
            )
          )}
        </Table.Body>
      </Table>
    </div>
  )
}

export default CouponsList;
