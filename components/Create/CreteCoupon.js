import React from "react";
import { Form, Input, Button, Message, Header, Icon } from "semantic-ui-react";
import axios from "axios";
import baseUrl from "../../utils/baseUrl";
import cookie from "js-cookie";
import catchErrors from '../../utils/catchErrors';

const INITIAL_CODE = {
  code: '',
  amount: 0
};

function CreateCoupon() {
  const [success, setSuccess] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [code, setCode] = React.useState(INITIAL_CODE);
  const [disabled, setDisabled] = React.useState(true);

  React.useEffect(() => {
    setDisabled(code.code.length < 8 || !code.amount);
  }, [code]);

  function handleChange(event) {
    const { name, value } = event.target;
    setCode(prevState => ({ ...prevState, [name]: value }));
  }

  async function handleSubmit(event) {
    try {
      event.preventDefault();
      setLoading(true);
      setError("");
      setSuccess("");
      const url = `${baseUrl}/api/code`;
      const token = cookie.get("token");
      const headers = { headers: { Authorization: token } };
      const payload = { ...code };
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
        Create New Coupon
      </Header>
      <Form
        loading={loading}
        error={Boolean(error)}
        success={Boolean(success)}
        onSubmit={handleSubmit}
      >
        <Message error header="Oops!" content={error} />
        <Message success icon="check" header="Success!" content={success} />
        <Form.Field
          control={Input}
          name="code"
          label="Code"
          placeholder="Coupon code (min 8 characters)"
          minLength='8'
          type="text"
          value={code.code}
          onChange={handleChange}
        />
        <Form.Field
          control={Input}
          name="amount"
          label="Coupon Discount Amount ($)"
          placeholder="Amount ($)"
          min="1.00"
          step="1.00"
          type="number"
          value={code.amount}
          onChange={handleChange}
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

export default CreateCoupon;
