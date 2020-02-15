const Offer = () => {
  return <>Hello</>;
};

Offers.getInitialProps = async () => {
  const url = `${baseUrl}/api/discount`;
  const isActive = true;
  const payload = { params: { isActive } };
  const response = await axios.get(url);
  return response.data;
};
export default Offer;
