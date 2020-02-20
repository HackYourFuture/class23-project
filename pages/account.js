import AccountHeader from '../components/Account/AccountHeader';
import AccountOrders from '../components/Account/AccountOrders';
import AccountPermissions from '../components/Account/AccountPermissions';
import AccountDelete from '../components/Account/AccountDelete';
import SetOrUpdatePassword from '../components/Account/SetOrUpdatePassword';
import { parseCookies } from 'nookies';
import baseUrl from '../utils/baseUrl';
import axios from 'axios';

function Account({ user, orders, ratings, currency }) {
  return (
    <>
      <AccountHeader {...user} />
      <SetOrUpdatePassword {...user} />
      <AccountOrders orders={orders} {...user} currency={currency} />
      {user.role === 'root' && <AccountPermissions />}
      {!(user.role === 'root') && <AccountDelete {...user} />}
    </>
  );
}

Account.getInitialProps = async ctx => {
  const { token } = parseCookies(ctx);
  if (!token) {
    return { orders: [] };
  }
  const payload = { headers: { Authorization: token } };
  const url = `${baseUrl}/api/orders`;
  const response = await axios.get(url, payload);
  return response.data;
};

export default Account;
