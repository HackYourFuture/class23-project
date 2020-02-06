import React from 'react';
import {
  Button,
  Form,
  Icon,
  Message,
  Segment,
  Divider,
  Grid,
} from 'semantic-ui-react';
import Link from 'next/link';
import axios from 'axios';
import catchErrors from '../utils/catchErrors';
import baseUrl from '../utils/baseUrl';
import { handleLogin } from '../utils/auth';
import firebase from 'firebase';

const INITIAL_USER = {
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

function Login() {
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
      const url = `${baseUrl}/api/login`;
      const payload = { ...user };
      const response = await axios.post(url, payload);
      handleLogin(response.data);
    } catch (error) {
      catchErrors(error, setError);
    } finally {
      setLoading(false);
    }
  }
  async function handleSocialLogin(event) {
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    const facebookProvider = new firebase.auth.FacebookAuthProvider();
    let result;
    if (event.target.innerText === 'Sign In with Google') {
      try {
        result = await firebase.auth().signInWithPopup(googleProvider);
        console.log('google');
        console.log('result.user', result.user);
        console.log('result', result);
        // post request api/social
        // refreshToken,idToken,username,email,provider
        //
      } catch (error) {}
    }
    if (event.target.innerText === 'Sign In with Facebook') {
      try {
        result = await firebase.auth().signInWithPopup(facebookProvider);
        console.log('facebook');
        console.log('result.user', result.user);
      } catch (error) {}
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
            Login with Email
          </Button>
        </div>
      ) : (
        <Form error={Boolean(error)} loading={loading} onSubmit={handleSubmit}>
          <Message error header="Oops!" content={error} />
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
          </Segment>
        </Form>
      )}
      <Button
        name="google"
        attached
        style={{
          margin: '1em',
          padding: '11px 40px',
        }}
        color="google plus"
        onClick={() => handleSocialLogin(event)}
      >
        <Icon name="google" />
        Sign In with Google
      </Button>
      <Button
        name="facebook"
        attached
        style={{
          margin: '1em',
          padding: '12px 32px',
        }}
        color="facebook"
        onClick={() => handleSocialLogin(event)}
      >
        <Icon name="facebook" />
        Sign In with Facebook
      </Button>

      <Message attached="bottom" warning>
        <Icon name="help" />
        New user?{' '}
        <Link href="/signup">
          <a>Sign up here</a>
        </Link>{' '}
        instead.
      </Message>
    </>
    // <>
    //   <Segment placeholder>
    //     <Grid columns={2} relaxed="very" stackable>
    //       <Grid.Column>
    //         <Form
    //           error={Boolean(error)}
    //           loading={loading}
    //           onSubmit={handleSubmit}
    //         >
    //           <Message error header="Oops!" content={error} />
    //           <Segment>
    //             <Form.Input
    //               fluid
    //               icon="envelope"
    //               iconPosition="left"
    //               label="Email"
    //               placeholder="Email"
    //               name="email"
    //               type="email"
    //               value={user.email}
    //               onChange={handleChange}
    //             />
    //             <Form.Input
    //               fluid
    //               icon="lock"
    //               iconPosition="left"
    //               label="Password"
    //               placeholder="Password"
    //               name="password"
    //               type="password"
    //               value={user.password}
    //               onChange={handleChange}
    //             />
    //             <Button
    //               disabled={disabled || loading}
    //               icon="sign in"
    //               type="submit"
    //               color="orange"
    //               content="Login"
    //             />
    //           </Segment>
    //         </Form>
    //       </Grid.Column>

    //       <Grid.Column verticalAlign="middle">
    //         {/* <div> */}
    //         <Button
    //           name="google"
    //           // attached
    //           style={{
    //             margin: '1em',
    //             padding: '11px 40px',
    //           }}
    //           color="google plus"
    //           onClick={() => handleSocialLogin(event)}
    //         >
    //           <Icon name="google" />
    //           Google
    //         </Button>
    //         {/* </div>
    //         <div> */}
    //         <Button
    //           name="facebook"
    //           // attached
    //           style={{
    //             margin: '1em',
    //             padding: '12px 32px',
    //           }}
    //           color="facebook"
    //           onClick={() => handleSocialLogin(event)}
    //         >
    //           <Icon name="facebook" />
    //           Facebook
    //         </Button>
    //         {/* </div> */}
    //       </Grid.Column>
    //     </Grid>
    //     <Divider vertical>OR</Divider>
    //   </Segment>
    //   <Message attached="bottom" warning>
    //     <Icon name="help" />
    //     New user?{' '}
    //     <Link href="/signup">
    //       <a>Sign up here</a>
    //     </Link>{' '}
    //     instead.
    //   </Message>
    // </>
  );
}

export default Login;
