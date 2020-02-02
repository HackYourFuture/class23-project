import { Grid, Tab } from 'semantic-ui-react';
import { Doughnut } from 'react-chartjs-2';
import { parseCookies } from 'nookies';
import axios from 'axios';
import uuid from 'uuid';
import baseUrl from '../utils/baseUrl';
import Chart from '../components/Dashboard/Chart';

function Dashboard({ topViewedTenProducts, topProductsOfCategory }) {
  const data = {
    labels: topViewedTenProducts.map(product => product.name),
    datasets: [
      {
        label: '# of Views',
        data: topViewedTenProducts.map(product => product.numberOfViews),
        backgroundColor: [
          '#8dd3c7',
          '#de425b',
          '#bebada',
          '#fb8072',
          '#80b1d3',
          '#fdb462',
          '#ffa600',
          '#f07c5c',
          '#488f31',
        ],
        borderWidth: 1,
      },
    ],
  };

  function getDoughnutData(category) {
    return {
      labels: category.products.map(product => product.name),
      datasets: [
        {
          data: category.products.map(product => product.numberOfViews),
          backgroundColor: ['#8dd3c7', '#fdc086', '#bebada'],
          borderWidth: 1,
        },
      ],
    };
  }

  const panes = [
    {
      menuItem: 'Top viewed products',
      render: () => (
        <Tab.Pane>
          <Chart data={data} />
        </Tab.Pane>
      ),
    },
    {
      menuItem: 'Top three products of each category',
      render: () => (
        <Tab.Pane>
          <Grid container stackable columns={2} style={{ marginTop: '40px' }}>
            {topProductsOfCategory.map(category => {
              return (
                <Grid.Column textAlign="center" key={uuid()}>
                  <h2>{category._id.charAt(0).toUpperCase() + category._id.slice(1)}</h2>
                  <Doughnut
                    data={getDoughnutData(category)}
                    width={100}
                    height={70}
                    margin={{ top: 10, bottom: 28 }}
                  />
                </Grid.Column>
              );
            })}
          </Grid>
        </Tab.Pane>
      ),
    },
  ];

  return <Tab menu={{ color: 'teal', inverted: true }} panes={panes} />;
}

Dashboard.getInitialProps = async ctx => {
  const { token } = parseCookies(ctx);
  const payload = { headers: { Authorization: token } };
  const url = `${baseUrl}/api/view`;
  const response = await axios.get(url, payload);
  const { topViewedTenProducts, topProductsOfCategory } = response.data;
  return { topViewedTenProducts, topProductsOfCategory };
};

export default Dashboard;
