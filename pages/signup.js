import React from 'react';
import { Button, Form, Icon, Message, Segment } from 'semantic-ui-react';
import Link from 'next/link';
import axios from 'axios';
import catchErrors from '../utils/catchErrors';
import baseUrl from '../utils/baseUrl';
import handleSocialSignIn from '../utils/socialSignIn';
import { logEvent } from '../utils/analytics';

const INITIAL_USER = {
  name: '',
  email: '',
  password: '',
  rePassword: '',
};

function Signup() {
  const [user, setUser] = React.useState(INITIAL_USER);
  const [disabled, setDisabled] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [passwordErrors, setPasswordErrors] = React.useState([]);
  const [emailSent, setEmailSent] = React.useState('');

  React.useEffect(() => {
    const isUser = Object.values(user).every(el => Boolean(el));
    isUser ? setDisabled(false) : setDisabled(true);
  }, [user]);

  function handleChange(event) {
    const { name, value } = event.target;
    setUser(prevState => ({ ...prevState, [name]: value }));
  }

  const validatePasswordMatch = user => user.password === user.rePassword;

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      setPasswordErrors([]);
      const isMatch = validatePasswordMatch(user);
      if (!isMatch) {
        throw new Error('Passwords do not match.');
      }
      const url = `${baseUrl}/api/signup`;
      const payload = { ...user };
      const response = await axios.post(url, payload);
      setEmailSent(response.data);
      logEvent("User", "Created an Account");
    } catch (error) {
      if (error.response && typeof error.response.data === 'object') {
        setPasswordErrors(error.response.data);
      } else {
        catchErrors(error, setError);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Message
        attached
        icon="settings"
        header="Get Started!"
        content="Create a new account"
        color="teal"
      />
      <Form
        error={Boolean(error) || Boolean(passwordErrors.length)}
        loading={loading}
        onSubmit={handleSubmit}
      >
        {error && <Message error header="Oops!" content={error} />}
        {Boolean(passwordErrors.length) && (
          <Message error header="Password should contain: " list={passwordErrors} />
        )}
        {Boolean(emailSent) ? (
          <Message positive header="Success" content={emailSent} />
        ) : (
            <>
              <Segment>
                <Form.Input
                  fluid
                  icon="user"
                  iconPosition="left"
                  label="Name"
                  placeholder="Name"
                  name="name"
                  value={user.name}
                  onChange={handleChange}
                />
                <Form.Input
                  fluid
                  icon="envelope"
                  iconPosition="left"
                  label="Email"
                  placeholder="Email"
                  name="email"
                  type="email"
                  value={user.email}
                  onChange={handleChange}
                />
                <Form.Input
                  fluid
                  icon="lock"
                  iconPosition="left"
                  label="Password"
                  placeholder="Password"
                  name="password"
                  type="password"
                  value={user.password}
                  onChange={handleChange}
                />
                <Form.Input
                  fluid
                  icon="lock"
                  iconPosition="left"
                  label="Confirm Password"
                  placeholder="Confirm Password"
                  name="rePassword"
                  type="password"
                  value={user.rePassword}
                  onChange={handleChange}
                />
                <Button
                  disabled={disabled || loading}
                  icon="signup"
                  type="submit"
                  color="orange"
                  content="Signup"
                />
              </Segment>
              <Button
                title="google"
                attached
                style={{
                  margin: '1em',
                  padding: '11px 40px',
                }}
                color="google plus"
                onClick={(event) => handleSocialSignIn(event, setError, setLoading)}
              >
                <Icon name="google" />
                Sign In with Google
      </Button>
              <Button
                title="facebook"
                attached
                style={{
                  margin: '1em',
                  padding: '12px 32px',
                }}
                color="facebook"
                onClick={(event) => handleSocialSignIn(event, setError, setLoading)}
              >
                <Icon name="facebook" />
                Sign In with Facebook
      </Button>
            </>
          )
        }
      </Form>

      {Boolean(!emailSent) && (
        <Message attached="bottom" warning>
          <Icon name="help" />
          Existing user?{' '}
          <Link href="/login">
            <a>Log in here</a>
          </Link>{' '}
          instead.
        </Message>
      )}
    </>
  );
}

export default Signup;
