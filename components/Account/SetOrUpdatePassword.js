import React from 'react';
import {
  Header,
  Icon,
  Segment,
  Form,
  Message,
  Button,
  Accordion,
} from 'semantic-ui-react';

const PASSWORDS = {
  current: '',
  requested: '',
  repeated: '',
};

function SetOrUpdatePassword({ email, name }) {
  const [passwords, setPasswords] = React.useState(PASSWORDS);
  const [disabled, setDisabled] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [activeIndex, setActiveIndex] = React.useState(0);

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
    console.log(name);
    console.log(value);
    setPasswords(prevState => ({ ...prevState, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      // setError('');
      const url = `${baseUrl}/api/password`;
      const payload = { ...passwords };
      console.log(payload);
      const response = await axios.post(url, payload);
      handleLogin(response.data);
      // logEvent('User', 'Created an Account');
    } catch (error) {
      catchErrors(error, setError);
    } finally {
      setLoading(false);
    }
  }

  const handleClick = (e, { index }) => {
    const newIndex = activeIndex === index ? -1 : index;

    setActiveIndex(newIndex);
  };

  // api/password post request,
  //current,new payload
  //header(token)
  //message after update status
  return (
    <div>
      <Accordion fluid styled>
        <Accordion.Title
          active={activeIndex === 1}
          index={1}
          onClick={handleClick}
        >
          <Header as="h2">
            <Icon name="key" />
            Set-Update Password
          </Header>
          <Icon name="dropdown" />
        </Accordion.Title>
        <Accordion.Content active={activeIndex === 1}>
          <Form
            error={Boolean(error)}
            loading={loading}
            onSubmit={handleSubmit}
          >
            <Message
              error
              header="Oops!"
              // content
            />
            <Segment>
              <Form.Input
                fluid
                icon="envelope"
                iconPosition="left"
                label="Email"
                name="name"
                value={email}
                onChange={handleChange}
              />
              <Form.Input
                fluid
                icon="lock"
                iconPosition="left"
                label="Current password"
                placeholder="If you have"
                name="current"
                type="password"
                value={passwords.current}
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
                content="Set or Update"
              />
            </Segment>
          </Form>
        </Accordion.Content>
      </Accordion>
    </div>
  );
}

export default SetOrUpdatePassword;
