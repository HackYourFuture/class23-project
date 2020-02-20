import React from 'react';
import { Header, Icon, Segment, Button, Modal } from 'semantic-ui-react';
import axios from 'axios';
import baseUrl from '../../utils/baseUrl';
import catchErrors from '../../utils/catchErrors';
import { handleLogout } from '../../utils/auth';
import cookie from 'js-cookie';

function AccountDelete({ _id }) {
  const [modal, setModal] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState('');

  async function handleDeleteAccount() {
    try {
      const url = `${baseUrl}/api/account`;
      const token = cookie.get('token');
      const payload = { params: { _id }, headers: { Authorization: token } };
      await axios.delete(url, payload);
      setError('');
      setSuccess(true);
    } catch (error) {
      setSuccess(false);
      catchErrors(error, setError);
    }
  }

  return (
    <>
      <Header as="h3">
        <Icon name="setting" />
        Account Settings
      </Header>
      <Segment inverted color="black" textAlign="center" style={{ marginBottom: '5em' }}>
        <Header icon>
          <Icon name="trash alternate outline" />
        </Header>
        <div>
          <Button
            icon="trash alternate outline"
            color="youtube"
            content="Delete Account"
            onClick={() => setModal(true)}
          />
          <Modal open={modal} inverted size="small">
            <Header icon="frown" content="Confirm Delete" />
            <Modal.Content>
              <p>Are you sure you want to delete your account ?</p>
            </Modal.Content>
            <Modal.Actions>
              <Button onClick={() => setModal(false)} content="Cancel" color="orange" />
              <Button
                color="youtube"
                icon="trash"
                labelPosition="right"
                content="Delete"
                onClick={() => {
                  handleDeleteAccount();
                  setModal(false);
                }}
              />
            </Modal.Actions>
          </Modal>
        </div>
      </Segment>
      {success && (
        <Modal open={success} dimmer="blurring" size="small">
          <Header icon="warning circle" content="Your account is deleted" />
          <Modal.Content>
            <p>We're sorry to see you go. You are always welcome back.</p>
          </Modal.Content>
          <Modal.Actions>
            <Button
              onClick={() => {
                setSuccess(false);
                handleLogout();
              }}
              content="Got it"
              color="orange"
            />
          </Modal.Actions>
        </Modal>
      )}
    </>
  );
}

export default AccountDelete;
