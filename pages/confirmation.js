import { Message } from 'semantic-ui-react';
import Link from 'next/link';
import axios from 'axios';
import baseUrl from '../utils/baseUrl';

function Confirmation({ message }) {
  console.log(message);
  const { msg, type } = message;

  return (
    <>
      {type === 'verified' ? (
        <Message>
          {msg}
          <Link href="/login">
            <a> Log in here</a>
          </Link>
        </Message>
      ) : type === 'not-verified' ? (
        <Message error>
          {msg}
          <Link href="/resend">
            <a> Resend confirmation email.</a>
          </Link>
        </Message>
      ) : (
        <Message error header="Oops!" content={msg} />
      )}
    </>
  );
}

Confirmation.getInitialProps = async ({ query: { token } }) => {
  if (!token) {
    return { message: 'No authentication token, please sign up', status: 401 };
  }
  const url = `${baseUrl}/api/confirmation`;
  const payload = { params: { token } };
  try {
    const response = await axios.get(url, payload);
    return { message: response.data };
  } catch (err) {
    console.log(err.response.data);
    return { message: err.response.data };
  }
};

export default Confirmation;
