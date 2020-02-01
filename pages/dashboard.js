import Chart from "../components/Dashboard/Chart";
import baseUrl from "../utils/baseUrl";
import axios from "axios";
import { parseCookies } from "nookies";
import { Doughnut } from "react-chartjs-2";
import { Grid, GridColumn } from "semantic-ui-react";

function Dashboard({ topViewedProducts }) {
  console.log(topViewedProducts);
  const data = {
    labels: topViewedProducts.map(
      category => `${category.products[0].name} (${category._id})`
    ),
    datasets: [
      {
        label: "# of Views",
        data: topViewedProducts.map(
          category => category.products[0].numberOfViews
        ),
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(255, 159, 64, 0.2)"
        ],

        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)"
        ],
        borderWidth: 1
      }
    ]
  };

  return (
    <>
      <h2>Most Viewed Chart</h2>
      <Chart data={data} />
      <Grid container stackable columns={2} style={{ margintop: "40px" }}>
        {topViewedProducts.map(data => {
          const dataDonut = {
            labels: data.products.map(product => {
              return `${product.name}`;
            }),
            datasets: [
              {
                data: data.products.map(product => product.numberOfViews),
                backgroundColor: ["#ff677d", "#ffae8f", "#6f5a7e"],
                borderColor: [
                  "rgba(255, 99, 132, 1)",
                  "rgba(54, 162, 235, 1)",
                  "rgba(255, 206, 86, 1)"
                ],
                borderWidth: 1
              }
            ]
          };

          return (
            <GridColumn textAlign="center">
              <div className="chart">
                <h2>{`${data._id} chart`}</h2>
                <Doughnut
                  data={dataDonut}
                  width={100}
                  height={50}
                  margin={{ top: 10, bottom: 28, left: 50, right: 10 }}
                />
              </div>
            </GridColumn>
          );
        })}
      </Grid>
    </>
  );
}
Dashboard.getInitialProps = async ctx => {
  const { token } = parseCookies(ctx);
  const payload = { headers: { Authorization: token } };
  const url = `${baseUrl}/api/view`;
  const response = await axios.get(url, payload);
  return { topViewedProducts: response.data };
};
export default Dashboard;
