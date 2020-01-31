import React from "react";

import { Doughnut } from "react-chartjs-2";

function ChartDoughnut({ data }) {
  return (
    <>
      <div className="chart">
        <Doughnut
          data={data}
          width={100}
          height={50}
          margin={{ top: 10, bottom: 28, left: 50, right: 10 }}
        />
      </div>
    </>
  );
}

export default ChartDoughnut;
