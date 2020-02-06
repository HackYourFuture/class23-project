import React from 'react';
import { Button, Form, Message, Segment } from 'semantic-ui-react';
import axios from 'axios';
import catchErrors from '../utils/catchErrors';
import baseUrl from '../utils/baseUrl';
import { logEvent } from '../utils/analytics';

function Resend() {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [emailSent, setEmailSent] = React.useState('');

  function handleChange(event) {
    const { value } = event.target;
    setEmail(value);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      const url = `${baseUrl}/api/resend`;
      const payload = { email };
      const response = await axios.post(url, payload);
      setEmailSent(response.data);
      logEvent('User', 'Resent activation email');
    } catch (error) {
      catchErrors(error, setError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Message attached icon="envelope" content="Resend activation mail" color="teal" />
      <Form error={Boolean(error)} loading={loading} onSubmit={handleSubmit}>
        <Message error header="Oops!" content={error} />
        {Boolean(emailSent) ? (
          <Message positive header="Success" content={emailSent} />
        ) : (
          <Segment>
            <Form.Input
              fluid
              icon="envelope"
              iconPosition="left"
              label="Email"
              placeholder="Email"
              name="email"
              type="email"
              value={email}
              onChange={handleChange}
            />
            <Button
              icon="send"
              type="submit"
              color="orange"
              content="Send"
            />
          </Segment>
        )}
      </Form>
    </>
  );
}

export default Resend;
