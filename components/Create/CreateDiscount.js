import React from "react";
import { Form, Input, Button, Message, Header, Icon } from "semantic-ui-react";
import TextField from "@material-ui/core/TextField";
import { categoryOptions } from "./ProductCreation";
import { universalFormatDate } from "../../utils/formatDate";
import {
  checkDiscountIsOK,
  DISCOUNT_TYPES,
  UNIT_TYPES,
  getRequiredPropsListForDiscount
} from "../../utils/discount";
import axios from "axios";
import baseUrl from "../../utils/baseUrl";
import catchErrors from "../../utils/catchErrors";
import DiscountUnitsList from "./DiscountUnitsList";
import DiscountSingleUnit from "./DiscountSingleUnit";
import cookie from "js-cookie";

const discountOptions = [
  {
    text: "Amount Based Discount",
    key: DISCOUNT_TYPES.amountBased,
    value: DISCOUNT_TYPES.amountBased,
    name: "discountType"
  },
  {
    text: "Relation Based Discount",
    key: DISCOUNT_TYPES.relationBased,
    value: DISCOUNT_TYPES.relationBased,
    name: "discountType"
  }
];

const spectrumOptions = [
  {
    text: "Between Multiple Units",
    key: "multiple_unit",
    value: true,
    name: "multipleUnits"
  },
  {
    text: "Just Single Unit",
    key: "single_unit",
    value: false,
    name: "multipleUnits"
  }
];

const unitOptions = [
  {
    text: "Product",
    key: "unit_product",
    value: UNIT_TYPES.product,
    name: "unitType"
  },
  {
    text: "Category",
    key: "unit_category",
    value: UNIT_TYPES.category,
    name: "unitType"
  }
];

// Default Discount Properties
const NEW_DISCOUNT = {
  products: [], // For multiple units selection - product
  categories: [], // For multiple units selection - category
  product: null, // For single unit selection
  category: "", // For single unit selection
  discountType: DISCOUNT_TYPES.amountBased,
  discountPercentage: 5,
  requiredAmount: 1,
  startDate: universalFormatDate(Date.now()),
  endDate: universalFormatDate(Date.now()),
  multipleUnits: true,
  unitType: UNIT_TYPES.product
};

const UNIT = {
  product: null,
  category: ""
};

function CreateDiscount({ products }) {
  const [newDiscount, setNewDiscount] = React.useState(NEW_DISCOUNT);
  const [unit, setUnit] = React.useState(UNIT);
  const [success, setSuccess] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [disabled, setDisabled] = React.useState(true);

  React.useEffect(() => {
    setDisabled(!checkDiscountIsOK(newDiscount));
  }, [newDiscount]);

  function mapProductToItems() {
    return products.map(p => ({
      key: `search_unit_${p._id}`,
      name: "product",
      text: `${p.name} - ${p.category}`,
      value: p._id,
      image: {
        avatar: true,
        src: p.mediaUrl
      }
    }));
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setNewDiscount(prevState => ({ ...prevState, [name]: value }));
  }

  function handleChangeUnit(_event, data) {
    const { name, value } = data;
    setNewDiscount(prevState => ({ ...prevState, [name]: value }));
  }

  function handleAddUnitChange(_event, data) {
    const { name, value } = data;
    const unit =
      name === UNIT_TYPES.product ? products.find(p => p._id === value) : value;
    setUnit(prevState => ({ ...prevState, [name]: unit }));
    setNewDiscount(prevState => ({ ...prevState, [name]: unit }));
  }

  function handleAddUnit() {
    event.preventDefault();
    const name =
      newDiscount.unitType === UNIT_TYPES.product ? "products" : "categories";
    const value =
      newDiscount.unitType === UNIT_TYPES.product
        ? unit.product
        : unit.category;
    if (!value) return;
    const hasUnit =
      newDiscount[name].filter(unit => {
        if (unit._id) return unit._id === value._id;
        return unit === value;
      }).length > 0;
    const newUnits = [value, ...newDiscount[name]];
    const hasLeastRequiredAmount =
      newDiscount.requiredAmount >= newUnits.length;
    if (!hasUnit) {
      hasLeastRequiredAmount
        ? setNewDiscount(prevState => ({ ...prevState, [name]: newUnits }))
        : setNewDiscount(prevState => ({
            ...prevState,
            [name]: newUnits,
            requiredAmount: newUnits.length
          }));
    }
  }

  function handleRemoveFromUnitsList(unit, type) {
    if (unit && type) {
      if (type === UNIT_TYPES.product) {
        // unit => product._id
        const newUnits = newDiscount.products.filter(p => p._id !== unit);
        setNewDiscount(prevState => ({ ...prevState, products: newUnits }));
      } else {
        // unit => category
        const newUnits = newDiscount.categories.filter(c => c !== unit);
        setNewDiscount(prevState => ({ ...prevState, categories: newUnits }));
      }
    }
  }

  async function handleSubmit(event) {
    try {
      event.preventDefault();
      setLoading(true);
      setError("");
      setSuccess("");
      const url = `${baseUrl}/api/discount`;
      const requiredProps = getRequiredPropsListForDiscount(newDiscount);
      const payload = requiredProps.reduce(
        (discount, prop) => ({ ...discount, [prop]: newDiscount[prop] }),
        {}
      );
      const token = cookie.get("token");
      const headers = { headers: { Authorization: token } };
      const response = await axios.post(url, payload, headers);
      setSuccess(response.data);
    } catch (error) {
      catchErrors(error, setError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header as="h2" block>
        <Icon name="add" color="orange" />
        Create New Discount
      </Header>
      <Form
        loading={loading}
        error={Boolean(error)}
        success={Boolean(success)}
        onSubmit={handleSubmit}
      >
        <Message error header="Oops!" content={error} />
        <Message success icon="check" header="Success!" content={success} />
        <Form.Group widths="equal">
          <Form.Dropdown
            selection
            options={discountOptions}
            name="discountType"
            label="Discount Type"
            placeholder="Discount Type"
            value={newDiscount.discountType}
            onChange={handleChangeUnit}
          />
          <Form.Dropdown
            selection
            options={spectrumOptions}
            name="multipleUnits"
            label="Discount Spectrum"
            placeholder="Discount Spectrum"
            value={newDiscount.multipleUnits}
            onChange={handleChangeUnit}
          />
          <Form.Dropdown
            selection
            options={unitOptions}
            name="unitType"
            label="Discount Unit"
            placeholder="Discount Unit"
            value={newDiscount.unitType}
            onChange={handleChangeUnit}
          />
        </Form.Group>

        <Form.Group widths="equal">
          {newDiscount.discountType === DISCOUNT_TYPES.amountBased && (
            <Form.Field
              control={Input}
              name="requiredAmount"
              label="Required Amount"
              placeholder="Amount"
              min="1.00"
              step="1.00"
              type="number"
              value={newDiscount.requiredAmount}
              onChange={handleChange}
            />
          )}
          <Form.Field
            control={Input}
            name="discountPercentage"
            label="Discount Percentage"
            placeholder="Percentage"
            min="5.00"
            max="100.00"
            step="5.00"
            type="number"
            value={newDiscount.discountPercentage}
            onChange={handleChange}
          />
        </Form.Group>
        {newDiscount.multipleUnits ? (
          <>
            <Form.Group style={{ alignItems: "flex-end" }} widths="equal">
              <Form.Dropdown
                options={
                  newDiscount.unitType === UNIT_TYPES.product
                    ? mapProductToItems()
                    : categoryOptions.map(c => ({ ...c, name: "category" }))
                }
                name={newDiscount.unitType}
                label={`Add ${newDiscount.unitType}`}
                placeholder={`Add ${newDiscount.unitType}`}
                search
                selection
                onChange={handleAddUnitChange}
              />
              <Form.Button
                content="Add"
                icon="plus"
                color="green"
                type="submit"
                onClick={handleAddUnit}
              />
            </Form.Group>
            <DiscountUnitsList
              unitType={newDiscount.unitType}
              units={
                newDiscount.unitType === UNIT_TYPES.product
                  ? newDiscount.products
                  : newDiscount.categories
              }
              discountPercentage={newDiscount.discountPercentage}
              handleRemove={handleRemoveFromUnitsList}
            />
          </>
        ) : (
          <>
            <Form.Dropdown
              options={
                newDiscount.unitType === UNIT_TYPES.product
                  ? mapProductToItems()
                  : categoryOptions.map(c => ({ ...c, name: "category" }))
              }
              name={newDiscount.unitType}
              label={`Select ${newDiscount.unitType}`}
              placeholder={`Select ${newDiscount.unitType}`}
              search
              selection
              onChange={handleAddUnitChange}
            />
            <DiscountSingleUnit
              unit={unit}
              unitType={newDiscount.unitType}
              discountPercentage={newDiscount.discountPercentage}
            />
          </>
        )}
        <TextField
          name="startDate"
          id="date"
          label="Start Date"
          type="date"
          InputLabelProps={{
            shrink: true
          }}
          value={newDiscount.startDate}
          onChange={handleChange}
          required
          style={{ marginBottom: 20 }}
          fullWidth
          min={universalFormatDate(Date.now())}
        />
        <TextField
          name="endDate"
          id="date"
          label="End Date"
          type="date"
          InputLabelProps={{
            shrink: true
          }}
          onChange={handleChange}
          value={newDiscount.endDate}
          style={{ marginBottom: 20 }}
          fullWidth
          min={newDiscount.startDate}
        />

        <Form.Field
          control={Button}
          disabled={disabled || loading}
          color="blue"
          icon="pencil alternate"
          content="Submit"
          type="submit"
          style={{ marginBottom: 20 }}
        />
      </Form>
    </>
  );
}

export default CreateDiscount;
