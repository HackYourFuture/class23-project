import React from 'react';
import { Button, Form, Icon, Message, Segment } from 'semantic-ui-react';
import Link from 'next/link';
import axios from 'axios';
import { logEvent } from '../utils/analytics';
import catchErrors from '../utils/catchErrors';
import baseUrl from '../utils/baseUrl';
import { handleLogin } from '../utils/auth';
import firebase from 'firebase';

const INITIAL_USER = {
  name: '',
  email: '',
  password: '',
};
// HackYourShop icin
// if (!firebase.apps.length) {
//   firebase.initializeApp({
//     apiKey: 'AIzaSyCnwkw27zHkVHcwGlcylQvAKW_BQfsyyzo',
//     authDomain: 'hackyourshop-267318.firebaseapp.com',
//   });
// }
//hackyourshoplets icin
if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: 'AIzaSyBRM75TC1eGfRlN6jguGv3jReDF-1orzVM',
    authDomain: 'hackyourshoplets.firebaseapp.com',
  });
}

function Signup() {
  const [user, setUser] = React.useState(INITIAL_USER);
  const [disabled, setDisabled] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [isEmail, setIsEmail] = React.useState(true);

  React.useEffect(() => {
    const isUser = Object.values(user).every(el => Boolean(el));
    isUser ? setDisabled(false) : setDisabled(true);
  }, [user]);

  function handleChange(event) {
    const { name, value } = event.target;
    setUser(prevState => ({ ...prevState, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError('');
      const url = `${baseUrl}/api/signup`;
      const payload = { ...user };
      const response = await axios.post(url, payload);
      handleLogin(response.data);
      logEvent('User', 'Created an Account');
    } catch (error) {
      catchErrors(error, setError);
    } finally {
      setLoading(false);
    }
  }

  async function handleSocialSignup(event) {
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    const facebookProvider = new firebase.auth.FacebookAuthProvider();
    let result;
    if (event.target.innerText === 'Google') {
      try {
        result = await firebase.auth().signInWithPopup(googleProvider);
        console.log('google');
        console.log('result.user', result.user);
      } catch (error) {}
    }
    if (event.target.innerText === 'Facebook') {
      try {
        result = await firebase.auth().signInWithPopup(facebookProvider);
        console.log('facebook');
      } catch (error) {}
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
      {isEmail ? (
        <div>
          <Button
            attached
            style={{
              margin: '1em',
              padding: '11px 45px',
            }}
            color="orange"
            onClick={() => setIsEmail(false)}
          >
            <Icon name="mail" />
            Email
          </Button>
        </div>
      ) : (
        <Form error={Boolean(error)} loading={loading} onSubmit={handleSubmit}>
          <Message error header="Oops!" content={error} />
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
            <Button
              disabled={disabled || loading}
              icon="signup"
              type="submit"
              color="orange"
              content="Signup"
            />
          </Segment>
        </Form>
      )}
      <div>
        <Button
          attached
          style={{
            margin: '1em',
            padding: '11px 40px',
          }}
          color="google plus"
          onClick={() => handleSocialSignup(event)}
        >
          <Icon name="google" />
          Google
        </Button>
      </div>
      <div>
        <Button
          attached
          style={{
            margin: '1em',
            padding: '12px 32px',
          }}
          color="facebook"
          onClick={() => handleSocialSignup(event)}
        >
          <Icon name="facebook" />
          Facebook
        </Button>
      </div>
      <Message attached="bottom" warning>
        <Icon name="help" />
        Existing user?{' '}
        <Link href="/login">
          <a>Log in here</a>
        </Link>{' '}
        instead.
      </Message>
    </>
  );
}

export default Signup;
