import Chart from "../components/Dashboard/Chart";
import ChartDoughnut from "../components/Dashboard/ChartDoughnut";
import baseUrl from "../utils/baseUrl";
import axios from "axios";
import { parseCookies } from "nookies";

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

  const dataDonut0 = {
    labels: topViewedProducts[0].products.map(product => {
      return `${product.name}`;
    }),
    datasets: [
      {
        data: topViewedProducts[0].products.map(
          product => product.numberOfViews
        ),
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
  const dataDonut1 = {
    labels: topViewedProducts[1].products.map(product => {
      return `${product.name}`;
    }),
    datasets: [
      {
        data: topViewedProducts[1].products.map(
          product => product.numberOfViews
        ),
        backgroundColor: ["#eab0d9", "#f7e8f0", "#feb377"],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)"
        ]
      }
    ]
  };
  const dataDonut2 = {
    labels: topViewedProducts[2].products.map(product => {
      return `${product.name}`;
    }),
    datasets: [
      {
        data: topViewedProducts[2].products.map(
          product => product.numberOfViews
        ),
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)"
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)"
        ]
      }
    ]
  };
  const dataDonut3 = {
    labels: topViewedProducts[3].products.map(product => {
      return `${product.name}`;
    }),
    datasets: [
      {
        data: topViewedProducts[3].products.map(
          product => product.numberOfViews
        ),
        backgroundColor: ["#ff677d", "#ffae8f", "#6f5a7e"],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)"
        ]
      }
    ]
  };
  const dataDonut4 = {
    labels: topViewedProducts[4].products.map(product => {
      return `${product.name}`;
    }),
    datasets: [
      {
        data: topViewedProducts[4].products.map(
          product => product.numberOfViews
        ),
        backgroundColor: ["#eab0d9", "#f7e8f0", "#feb377"],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)"
        ]
      }
    ]
  };
  const dataDonut5 = {
    labels: topViewedProducts[5].products.map(product => {
      return `${product.name}`;
    }),
    datasets: [
      {
        data: topViewedProducts[5].products.map(
          product => product.numberOfViews
        ),
        backgroundColor: [
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(255, 159, 64, 0.2)"
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)"
        ]
      }
    ]
  };
  const dataDonut6 = {
    labels: topViewedProducts[6].products.map(product => {
      return `${product.name}`;
    }),
    datasets: [
      {
        data: topViewedProducts[6].products.map(
          product => product.numberOfViews
        ),
        backgroundColor: ["#ff677d", "#ffae8f", "#6f5a7e"],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)"
        ]
      }
    ]
  };
  const dataDonut7 = {
    labels: topViewedProducts[7].products.map(product => {
      return `${product.name}`;
    }),
    datasets: [
      {
        data: topViewedProducts[7].products.map(
          product => product.numberOfViews
        ),
        backgroundColor: ["#eab0d9", "#f7e8f0", "#feb377"],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)"
        ]
      }
    ]
  };
  const dataDonut8 = {
    labels: topViewedProducts[8].products.map(product => {
      return `${product.name}`;
    }),
    datasets: [
      {
        data: topViewedProducts[8].products.map(
          product => product.numberOfViews
        ),
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)"
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)"
        ]
      }
    ]
  };

  return (
    <>
      <h2>Most Viewed Chart</h2>
      <Chart data={data} />
      <h2>{topViewedProducts[0]._id} chart</h2>
      <ChartDoughnut data={dataDonut0} />
      <h2>{topViewedProducts[1]._id} chart</h2>
      <ChartDoughnut data={dataDonut1} />
      <h2>{topViewedProducts[2]._id} chart</h2>
      <ChartDoughnut data={dataDonut2} />
      <h2>{topViewedProducts[3]._id} chart</h2>
      <ChartDoughnut data={dataDonut3} />
      <h2>{topViewedProducts[4]._id} chart</h2>
      <ChartDoughnut data={dataDonut4} />
      <h2>{topViewedProducts[5]._id} chart</h2>
      <ChartDoughnut data={dataDonut5} />
      <h2>{topViewedProducts[6]._id} chart</h2>
      <ChartDoughnut data={dataDonut6} />
      <h2>{topViewedProducts[7]._id} chart</h2>
      <ChartDoughnut data={dataDonut7} />
      <h2>{topViewedProducts[8]._id} chart</h2>
      <ChartDoughnut data={dataDonut8} />
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
