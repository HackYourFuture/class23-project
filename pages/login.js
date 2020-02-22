import React from 'react';
import { useRouter } from 'next/router';
import {
  Button,
  Form,
  Icon,
  Message,
  Segment,
  Breadcrumb,
  Modal,
  Header,
} from 'semantic-ui-react';
import Link from 'next/link';
import axios from 'axios';
import catchErrors from '../utils/catchErrors';
import baseUrl from '../utils/baseUrl';
import { handleLogin } from '../utils/auth';
import handleSocialSignIn from '../utils/socialSignIn';

const INITIAL_USER = {
  email: '',
  password: '',
};
const INITIAL_EMAIL = {
  confirmEmail: '',
};

function Login(pageProps, ctx) {

  const [user, setUser] = React.useState(INITIAL_USER);
  const [confirmEmail, setConfirmEmail] = React.useState(INITIAL_EMAIL);
  const [disabled, setDisabled] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState('');
  const [error, setError] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);
  const sections = [
    { key: 'Forget password?', content: 'Forget password?', link: true },
  ];
  const [verificationError, setVerificationError] = React.useState('');

  React.useEffect(() => {
    const isUser = Object.values(user).every(el => Boolean(el));
    isUser ? setDisabled(false) : setDisabled(true);
  }, [user]);

  function handleChange(event) {
    const { name, value } = event.target;
    setUser(prevState => ({ ...prevState, [name]: value }));
    setConfirmEmail(prevState => ({ ...prevState, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      setVerificationError('');
      const url = `${baseUrl}/api/login`;
      const payload = { ...user };
      const response = await axios.post(url, payload);
      handleLogin(response.data, ctx);
    } catch (error) {
      if (typeof error.response.data === 'object') {
        setVerificationError(error.response.data.msg);
        setDisabled(true);
      } else {
        catchErrors(error, setError);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitEmail(event) {
    event.preventDefault();
    try {
      setLoading(true);
      setError('');
      const payload = { ...confirmEmail };
      const url = `${baseUrl}/api/reset-password`;
      const response = await axios.post(url, payload);
      setSuccess(response.data);
    } catch (error) {
      setSuccess('');
      catchErrors(error, setError);
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  }

  return (
    <>
      <Message
        attached
        icon="privacy"
        header="Welcome Back!"
        content="Log in with email and password or social accounts"
        color="blue"
      />
      <Form
        error={Boolean(error) || Boolean(verificationError)}
        success={Boolean(success)}
        loading={loading}
        onSubmit={handleSubmit}
      >
        {error && <Message error header="Oops!" content={error} />}
        {verificationError && (
          <Message error size='big'>
            {verificationError}
            <Link href="/resend">
              <a> Resend activation email.</a>
            </Link>
          </Message>
        )}
        <Segment>
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
          <Button
            disabled={disabled || loading}
            icon="sign in"
            type="submit"
            color="orange"
            content="Login"
          />
          <Breadcrumb
            style={{ marginTop: '10px', float: 'right' }}
            sections={sections}
            onClick={() => {
              setIsOpen(true);
            }}
          ></Breadcrumb>
        </Segment>
        <Button
          title="google"
          attached
          style={{
            margin: '1em',
            padding: '11px 40px',
          }}
          color="google plus"
          onClick={event => handleSocialSignIn(event, setError, setLoading, ctx)}
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
          onClick={event => handleSocialSignIn(event, setError, setLoading, ctx)}
        >
          <Icon name="facebook" />
          Sign In with Facebook
        </Button>
      </Form>
      <Message attached="bottom" warning>
        <Icon name="help" />
        New user?{' '}
        <Link href="/signup">
          <a>Sign up here</a>
        </Link>{' '}
        instead.
      </Message>
      {isOpen && (
        <Modal
          // centered
          closeIcon
          onClose={() => {
            setIsOpen(false);
            setConfirmEmail('');
          }}
          dimmer="blurring"
          open={isOpen}
          size="mini"
          style={{ transform: 'translateY(-50%)' }}
        >
          <Header content="Please put your email here!" />
          <Form loading={loading} onSubmit={handleSubmitEmail}>
            <Modal.Content>
              <Segment>
                <Form.Input
                  fluid
                  icon="envelope"
                  iconPosition="left"
                  label="Email"
                  name="confirmEmail"
                  value={confirmEmail.confirmEmail}
                  onChange={handleChange}
                />
                <Button color="blue" type="submit">
                  Send!
                </Button>
              </Segment>
            </Modal.Content>
          </Form>
        </Modal>
      )}
    </>
  );
}

export default Login;
