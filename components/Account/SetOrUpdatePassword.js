import React from 'react';
import {
  Header,
  Icon,
  Segment,
  Form,
  Message,
  Button,
} from 'semantic-ui-react';

function SetOrUpdatePassword({ email, name }) {
  return (
    // api/password post request,
    //current,new payload
    //header(token)
    //message after update status
    <div>
      <Header as="h2">
        <Icon name="key" />
        New Password
      </Header>
      <Form
        error
        // onSubmit
      >
        {/* <Message error header="Oops!" content /> */}
        <Segment>
          <Form.Input
            fluid
            icon="envelope"
            iconPosition="left"
            label="Email"
            name="name"
            value={email}
            // onChange={handleChange}
          />
          <Form.Input
            fluid
            icon="lock"
            iconPosition="left"
            label="Current password"
            placeholder="If you have"
            name="password"
            type="password"
            // value={user.password}
            // onChange={handleChange}
          />
          <Form.Input
            fluid
            icon="lock"
            iconPosition="left"
            label="New password"
            placeholder="New password"
            name="password"
            type="password"
            // value={user.password}
            // onChange={handleChange}
          />
          <Form.Input
            fluid
            icon="lock"
            iconPosition="left"
            label="New password"
            placeholder="New password"
            name="password"
            type="password"
            // value={user.password}
            // onChange={handleChange}
          />
          <Button
            // disabled={disabled || loading}
            type="submit"
            color="orange"
            content="Set or Update"
          />
        </Segment>
      </Form>
    </div>
  );
}

export default SetOrUpdatePassword;
