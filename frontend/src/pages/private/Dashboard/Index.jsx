import React, { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Typography, Skeleton } from "antd";
import dayjs from "dayjs";
import {
  ShoppingCartOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  HourglassOutlined,
} from "@ant-design/icons";

import ErrorContent from "../../../components/common/ErrorContent";
import http from "../../../services/httpService";

import "./style.css";

// import Piechart from "./Chart/Piechart";
// import Barchart from "./Chart/Barchart";

import useUserStore from "../../../store/UserStore";

const { Title } = Typography;

function Dashboard() {
  const [productReports, setProductReports] = useState(null);
  const [orderReports, setOrderReports] = useState(null);
  const [amountPerUser, setAmountPerUser] = useState([]);
  const [categoryReport, setCategoryReport] = useState([]);

  const [data, setData] = useState({
    outOfStocks: 0,
    belowMinimumStocks: 0,
    demoUnit: 0,
    demoUnitOverDueNearExpire: 0,
  });

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [error, setError] = useState(null);

  const { name, roles } = useUserStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsContentLoading(true);

        const { data: outOfStocks } = await http.get("/api/report/outOfStocks");
        const { data: belowMinimumStocks } = await http.get(
          "/api/report/belowMinimumStocks"
        );
        const { data: getAllDemoUnits } = await http.get(
          "/api/report/getAllDemoUnits"
        );
        const { data: demoUnitOverDueNearExpire } = await http.get(
          "/api/report/demoUnitOverDueNearExpire"
        );

        setData({
          outOfStocks: outOfStocks.below_minimum_count,
          belowMinimumStocks: belowMinimumStocks.demo_unit_count,
          demoUnit: getAllDemoUnits.demo_unit_count,
          demoUnitOverDueNearExpire:
            demoUnitOverDueNearExpire.out_of_stock_count,
        });

        // const { data: amountPerUser } = await http.get(
        //   "/api/report/getTotalAmountPerUser"
        // );
        // const { data: categoryReport } = await http.get(
        //   "/api/report/getProductTotalsByCategory"
        // );

        // setProductReports(productReports);
        // setOrderReports(orderReports);
        // setAmountPerUser(amountPerUser);
        // setCategoryReport(categoryReport);
      } catch (error) {
        setError(error);
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <ErrorContent />;
  }

  if (isContentLoading) {
    return <Skeleton />;
  }

  // if (!productReports) {
  //   return "";
  // }

  let bgImg =
    "https://images.pexels.com/photos/5014950/pexels-photo-5014950.jpeg?cs=srgb&dl=pexels-chris-f-5014950.jpg&fm=jpg";

  const cardStyle = {
    backgroundColor: "#f0f2f5",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    height: "100%",
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <h1>Hello {name}!</h1>
          <div>
            <Card
              cover={
                <div
                  className="container background"
                  style={{ backgroundImage: `url("${bgImg}")` }}
                >
                  <div className="modal">
                    <Title
                      level={3}
                      className="modal-text"
                      style={{ marginBottom: 0 }}
                    >
                      <div>{dayjs().format("MMMM DD, YYYY")}</div>
                      <div>{dayjs().format("dddd")}</div>
                    </Title>
                  </div>
                </div>
              }
              style={{ marginBottom: 16 }}
            >
              <Title level={4}>
                <div style={{ textAlign: "center" }}>
                  ☀️ {dayjs().format("hh:mm A")}
                </div>
              </Title>
            </Card>
          </div>

          {/*<h1>Products</h1>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Card style={cardStyle}>
                <Statistic
                  title="Below Minimum Quantity Count"
                  value={productReports.below_min_qty_count}
                  prefix={<WarningOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card style={cardStyle}>
                <Statistic
                  title="Zero Stock"
                  value={productReports.zero_stock}
                  prefix={<ExclamationCircleOutlined />}
                />
              </Card>
            </Col>

            <Col span={8}>
              <Card style={cardStyle}>
                <Statistic
                  title="Pending Calibrations"
                  value={productReports.count_of_pending_calibrations}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card style={cardStyle}>
                <Statistic
                  title="For Maintenance (< 2 months)"
                  value={
                    productReports.count_of_items_with_less_than_1_month_remaining
                  }
                  prefix={<HourglassOutlined />}
                />
              </Card>
            </Col>
          </Row> */}
        </Col>
        <Col span={12}>
          {/* <h1>Sales by Company</h1>
          <div style={{ height: 400, padding: 50 }}>
            <Barchart data={amountPerUser} />
          </div>
          <h1>Product by Category</h1>
          <div style={{ height: 400, marginTop: 100 }}>
            <Piechart data={categoryReport} />
          </div> */}
          {!roles.includes("Customer") && (
            <Row gutter={[16, 16]} style={{ marginTop: 80 }}>
              <Col span={24}>
                <Card style={cardStyle}>
                  <Statistic
                    title="Out of Stocks"
                    value={data.outOfStocks}
                    prefix={<ExclamationCircleOutlined />}
                  />
                </Card>
              </Col>
              <Col span={24}>
                <Card style={cardStyle}>
                  <Statistic
                    title="Processing"
                    value={data.belowMinimumStocks}
                    prefix={<SyncOutlined />}
                  />
                </Card>
              </Col>
              <Col span={24}>
                <Card style={cardStyle}>
                  <Statistic
                    title="In-Transit"
                    value={data.demoUnit}
                    prefix={<ShoppingCartOutlined />}
                  />
                </Card>
              </Col>
              <Col span={24}>
                <Card style={cardStyle}>
                  <Statistic
                    title="Delivered"
                    value={data.demoUnitOverDueNearExpire}
                    prefix={<CheckCircleOutlined />}
                  />
                </Card>
              </Col>
            </Row>
          )}
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
