import React from "react";
import {
  Form,
  Input,
  Button,
  Message,
  Header,
  Icon,
  Image,
  Menu,
  Dropdown
} from "semantic-ui-react";
import { makeStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import { categoryOptions } from "./ProductCreation";
import axios from "axios";
import baseUrl from "../../utils/baseUrl";
import catchErrors from "../../utils/catchErrors";

const discountOptions = [
  { key: "amt", text: "amount", value: "amountBased" },
  { key: "rel", text: "content", value: "relationBased" }
];

console.log(categoryOptions);
const NEW_DISCOUNT = {
  productId: "",
  discountType: "",
  discountPercentage: 0,
  requiredAmount: 0,
  isActive: true,
  startDate: "",
  endDate: "",
  category: ""
};

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: "20px",
    marginBottom: "20px"
  },
  textField: {
    width: 340
  }
}));

function CreateDiscount({ products }) {
  const classes = useStyles();
  const [newDiscount, setNewDiscount] = React.useState(NEW_DISCOUNT);
  const [success, setSuccess] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const productSelection = products.map(p => ({
    id: p._id,
    text: p.name,
    value: p._id,
    img: p.mediaUrl
  }));

  console.log(productSelection);

  function handleChange(event) {
    const { name, value } = event.target;
    setNewDiscount(prevState => ({ ...prevState, [name]: value }));
  }

  function handleProductChange(id) {
    setNewDiscount(prevState => ({ ...prevState, productId: id }));
  }

  async function handleSubmit(event) {
    try {
      event.preventDefault();
      setLoading(true);
      setError("");
      const url = `${baseUrl}/api/discount`;
      const {
        productId,
        discountType,
        discountPercentage,
        requiredAmount,
        isActive,
        startDate,
        endDate,
        category
      } = newDiscount;

      const payload = {
        productId,
        discountType,
        discountPercentage,
        requiredAmount,
        isActive,
        startDate,
        endDate,
        category
      };
      await axios.post(url, payload);
      setNewDiscount(NEW_DISCOUNT);
      setSuccess(true);
    } catch (error) {
      catchErrors(error, setError);
    } finally {
      setLoading(false);
    }
  }

  console.log(newDiscount);
  return (
    <>
      <Header as="h2" block>
        <Icon name="add" color="orange" />
        Create New Discount
      </Header>
      <Form
        loading={loading}
        error={Boolean(error)}
        success={success}
        onSubmit={handleSubmit}
      >
        <Message error header="Oops!" content={error} />
        <Message
          success
          icon="check"
          header="Success!"
          content="You created a new discount!"
        />

        <Dropdown
          selection
          name="productId"
          placeholder="Select Product"
          fluid
          options={productSelection}
          onChange={e => handleProductChange(e.target.id)}
        />

        <Form.Group widths="equal">
          <Form.Field control={Input} label="Discount Type">
            <Input
              list="discountType"
              name="discountType"
              onChange={handleChange}
              value={newDiscount.discountType}
            />
            <datalist id="discountType">
              {discountOptions.map(discount => (
                <option key={discount.key} value={discount.value} />
              ))}
            </datalist>
          </Form.Field>
        </Form.Group>
        <Form.Group>
          <Form.Field control={Input} label="Category" width={10}>
            <Input
              name="category"
              list="categories"
              placeholder="Choose category"
              value={newDiscount.category}
              onChange={handleChange}
            />
            <datalist id="categories">
              {categoryOptions.map(category => (
                <option key={category.key} value={category.text} />
              ))}
            </datalist>
          </Form.Field>

          <Form.Field
            control={Input}
            name="requiredAmount"
            label="Required Amount"
            placeholder="Amount"
            min="0.00"
            step="1.00"
            type="number"
            value={newDiscount.requiredAmount}
            onChange={handleChange}
            width={3}
          />
          <Form.Field
            control={Input}
            name="discountPercentage"
            label="Discount Percentage"
            placeholder="Percentage"
            min="0.00"
            step="5.00"
            type="number"
            value={newDiscount.discountPercentage}
            onChange={handleChange}
            width={4}
          />
        </Form.Group>
        <div className={classes.container}>
          <TextField
            name="startDate"
            id="date"
            label="Start Date"
            type="date"
            defaultValue={new Date()}
            className={classes.textField}
            InputLabelProps={{
              shrink: true
            }}
            value={newDiscount.startDate}
            onChange={handleChange}
            required
          />
          <TextField
            name="endDate"
            id="date"
            label="End Date"
            type="date"
            defaultValue={new Date()}
            className={classes.textField}
            InputLabelProps={{
              shrink: true
            }}
            onChange={handleChange}
            value={newDiscount.endDate}
          />
        </div>
        <Form.Field
          control={Button}
          // disabled={disabled || loading}
          color="blue"
          icon="pencil alternate"
          content="Submit"
          type="submit"
          on
        />
      </Form>
    </>
  );
}

export default CreateDiscount;
