import {
  Message,
  Segment,
  Form,
  Button,
  Modal,
  Loader,
} from 'semantic-ui-react';
import axios from 'axios';
import baseUrl from '../../utils/baseUrl';
import { useRouter } from 'next/router';

const PASSWORDS = {
  requested: '',
  repeated: '',
};
function ResetPassword({ message, token, error: propError }) {
  const router = useRouter();
  const [passwords, setPasswords] = React.useState(PASSWORDS);
  const [disabled, setDisabled] = React.useState(true);
  const [success, setSuccess] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    const hasPasswords =
      passwords.requested &&
      passwords.repeated &&
      passwords.requested === passwords.repeated &&
      passwords.repeated.trim().length >= 6;
    hasPasswords ? setDisabled(false) : setDisabled(true);
  }, [passwords]);

  function handleChange(event) {
    const { name, value } = event.target;
    setPasswords(prevState => ({ ...prevState, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const payload = { ...passwords, token };
      const url = `${baseUrl}/api/reset-password`;
      const response = await axios.put(url, payload);
      setSuccess(response.data);
      setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error) {
      setSuccess('');
      catchErrors(error, setError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {propError ? (
        <Message error={Boolean(propError)} header="Oops!" content={message} />
      ) : (
        <Form
          error={Boolean(error)}
          success={Boolean(success)}
          loading={loading}
          onSubmit={handleSubmit}
        >
          <Message error header="Oops!" content={error} />
          <Message success header="Success!" content={success} />
          <Segment>
            <Form.Input
              fluid
              icon="envelope"
              iconPosition="left"
              label="Email"
              name="name"
              disabled
              value={message}
              onChange={handleChange}
            />
            <Form.Input
              fluid
              icon="lock"
              iconPosition="left"
              label="New password"
              placeholder="New password"
              name="requested"
              type="password"
              value={passwords.requested}
              onChange={handleChange}
            />
            <Form.Input
              fluid
              icon="lock"
              iconPosition="left"
              label="Re-new password"
              placeholder="Re-new password"
              name="repeated"
              type="password"
              value={passwords.repeated}
              onChange={handleChange}
            />
            <Button
              disabled={disabled || loading}
              type="submit"
              color="orange"
              content="Reset Password"
            />
          </Segment>
        </Form>
      )}
      <Modal
        open={isOpen}
        dimmer="blurring"
        style={{ transform: 'translateY(-50%)' }}
      >
        <Loader>Redirecting to Loading page.Please wait.</Loader>
      </Modal>
    </>
  );
}

ResetPassword.getInitialProps = async ({ query: { token } }) => {
  if (!token) {
    return {
      message: 'Invalid or outdated token.',
      error: new Error('Invalid or outdated token.'),
    };
  }
  const url = `${baseUrl}/api/reset-password`;
  const payload = { params: { token } };
  try {
    const response = await axios.get(url, payload);
    return { message: response.data, token };
  } catch (err) {
    return { message: err.response.data, error: err };
  }
};

export default ResetPassword;
