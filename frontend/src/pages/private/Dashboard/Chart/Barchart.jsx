import React, { PureComponent } from "react";
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// const data = [
//   {
//     company_name: "Megaion",
//     total_amount: "171227349.00",
//   },
//   {
//     company_name: "Company 33",
//     total_amount: "11176.00",
//   },
//   {
//     company_name: "Chippy",
//     total_amount: "0.00",
//   },
//   {
//     company_name: "Company 3",
//     total_amount: "0.00",
//   },
//   {
//     company_name: "Compamy 6",
//     total_amount: "0.00",
//   },
// ];

const MyBarChart = ({ data }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart
      width={500}
      height={300}
      data={data}
      margin={{
        top: 5,
        right: 30,
        left: 20,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="company_name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar
        dataKey="total_amount"
        fill="#82ca9d"
        activeBar={<Rectangle fill="pink" stroke="blue" />}
      />
      {/* <Bar
        dataKey="uv"
        fill="#82ca9d"
        activeBar={<Rectangle fill="gold" stroke="purple" />}
      /> */}
    </BarChart>
  </ResponsiveContainer>
);

export default MyBarChart;
