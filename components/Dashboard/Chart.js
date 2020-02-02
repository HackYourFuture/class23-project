import React from "react";

import { Bar } from "react-chartjs-2";

function Chart({ data }) {
  return (
    <>
      <div className="chart">
        <Bar
          data={data}
          width={100}
          height={50}
          margin={{ top: 10, bottom: 28, left: 50, right: 10 }}
        />
      </div>
    </>
  );
}

export default Chart;
