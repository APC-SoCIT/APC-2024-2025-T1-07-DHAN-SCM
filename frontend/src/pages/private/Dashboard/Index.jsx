import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Skeleton,
  Divider,
  Table,
  Button,
} from "antd";
import dayjs from "dayjs";
import {
  ShoppingCartOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  HourglassOutlined,
  ArrowDownOutlined,
  DesktopOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
  UserOutlined,
} from "@ant-design/icons";

import ErrorContent from "../../../components/common/ErrorContent";
import http from "../../../services/httpService";

import MyBarChart from "./Chart/Barchart";

import "./style.css";

// import Piechart from "./Chart/Piechart";
// import Barchart from "./Chart/Barchart";

import useUserStore from "../../../store/UserStore";

const { Title } = Typography;

function Dashboard() {
  const [data, setData] = useState({
    outOfStocks: 0,
    belowMinimumStocks: 0,
    demoUnit: 0,
    demoUnitOverDueNearExpire: 0,
    monthRevenue: 0,
    totalCustomer: 0,
    maintenanceCount: 0,
  });

  const [topSellingProduct, setTopSellingProduct] = useState([]);
  const [recentTransaction, setRecentTransaction] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

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
        const { data: getThisMonthRevenue } = await http.get(
          "/api/report/getThisMonthRevenue"
        );
        const { data: getTotalCustomer } = await http.get(
          "/api/report/getTotalCustomer"
        );
        const { data: getMaintenanceCountForThisMonth } = await http.get(
          "/api/report/getMaintenanceCountForThisMonth"
        );

        const { data: getTopSellingProducts } = await http.get(
          "/api/report/getTopSellingProducts"
        );
        const { data: getRecentTransactions } = await http.get(
          "/api/report/getRecentTransactions"
        );

        const { data: getMonthlyRevenue } = await http.get(
          "/api/report/getMonthlyRevenue"
        );

        const monthlyRevenue = getMonthlyRevenue.monthly_revenue;

        const monthlyRevenueArray = Object.entries(monthlyRevenue).map(
          ([month, revenue]) => ({
            month,
            // revenue: (Math.random() * 10000).toFixed(2),
            revenue: Number(revenue),
          })
        );

        setData({
          outOfStocks: outOfStocks.out_of_stock_count,
          belowMinimumStocks: belowMinimumStocks.below_minimum_count,
          demoUnit: getAllDemoUnits.demo_unit_count,
          demoUnitOverDueNearExpire: demoUnitOverDueNearExpire.demo_unit_count,
          monthRevenue: getThisMonthRevenue.total_revenue,
          totalCustomer: getTotalCustomer.total_customers,
          maintenanceCount: getMaintenanceCountForThisMonth.maintenance_count,
        });

        setTopSellingProduct(getTopSellingProducts.products);
        setRecentTransaction(getRecentTransactions.transactions);
        setMonthlyRevenue(monthlyRevenueArray);
      } catch (error) {
        setErrorMsg(error.message);
      } finally {
        setIsContentLoading(false);
      }
    };

    if (!roles.includes("Customer")) {
      fetchData();
    }
  }, []);

  if (errorMsg) {
    return <ErrorContent errorMessage={errorMsg} />;
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

  const cardStyleRed = {
    backgroundColor: "#f5222d",
  };

  const cardStyleOrange = {
    backgroundColor: "#ff7a45",
  };

  const cardStyleGreen = {
    backgroundColor: "#52c41a",
  };

  const cardStylePurple = {
    backgroundColor: "#722ed1",
  };

  const topSellingTable = [
    {
      title: "Product Name",
      dataIndex: "name",
      render: (_, record) => {
        return (
          <div>
            <div>{record.name}</div>
            {record.model && <div>{record.model}</div>}
          </div>
        );
      },
    },
    {
      title: "Available Quantity",
      dataIndex: "available_quantity",
    },
    {
      title: "Selling Price",
      dataIndex: "selling_price",
    },
    {
      title: "Total Sold",
      dataIndex: "total_quantity_sold",
    },
  ];

  const recentTransactionTable = [
    {
      title: "Order Number",
      dataIndex: "megaion_order_number",
    },
    {
      title: "Customer",
      dataIndex: "customer",
    },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
    },
    {
      title: "Status",
      dataIndex: "status",
    },
    {
      title: "created_at",
      dataIndex: "created_at",
    },
  ];

  if (roles.includes("Customer")) {
    return (
      <Row>
        <Col span={12}>
          <h1>Hello {name}!</h1>
          <Divider />
          {/* Clock */}
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
        </Col>
      </Row>
    );
  }

  return (
    <>
      <h1>Hello {name}!</h1>
      <Divider />

      <div>
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <Card style={{ ...cardStyle, ...cardStyleRed }}>
              <Statistic
                title={
                  <Row justify="space-between">
                    <Col>
                      <span style={{ color: "#fff" }}>Out of Stocks</span>
                    </Col>
                    <Col>
                      <Link
                        to="/products?defaultFilter=no_stock"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="small">View</Button>
                      </Link>
                    </Col>
                  </Row>
                }
                value={data.outOfStocks}
                prefix={<ExclamationCircleOutlined style={{ color: "#fff" }} />}
                className="stat-font-white"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card style={{ ...cardStyle, ...cardStyleOrange }}>
              <Statistic
                title={
                  <Row justify="space-between">
                    <Col>
                      <span style={{ color: "#fff" }}>
                        Below Minimum Stocks
                      </span>
                    </Col>
                    <Col>
                      <Link
                        to="/products?defaultFilter=below_minimum"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="small">View</Button>
                      </Link>
                    </Col>
                  </Row>
                }
                value={data.belowMinimumStocks}
                prefix={<ArrowDownOutlined style={{ color: "#fff" }} />}
                className="stat-font-white"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card style={{ ...cardStyle, ...cardStylePurple }}>
              <Statistic
                title={
                  <Row justify="space-between">
                    <Col>
                      <span style={{ color: "#fff" }}>Total Customer</span>
                    </Col>
                    <Col>
                      <Link
                        to="/customers"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="small">View</Button>
                      </Link>
                    </Col>
                  </Row>
                }
                value={data.totalCustomer}
                prefix={<UserOutlined style={{ color: "#fff" }} />}
                className="stat-font-white"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card style={{ ...cardStyle, ...cardStyleGreen }}>
              <Statistic
                title={
                  <Row justify="space-between">
                    <Col>
                      <span style={{ color: "#fff" }}>This Month Revenue</span>
                    </Col>
                    <Col></Col>
                  </Row>
                }
                value={data.monthRevenue}
                prefix={<CreditCardOutlined style={{ color: "#fff" }} />}
                className="stat-font-white"
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card style={cardStyle}>
              <Statistic
                title={
                  <Row justify="space-between">
                    <Col>Demo Unit</Col>
                    <Col>
                      <Link
                        to="/demoUnits"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="small">View</Button>
                      </Link>
                    </Col>
                  </Row>
                }
                value={data.demoUnit}
                prefix={<DesktopOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card style={cardStyle}>
              <Statistic
                title={
                  <Row justify="space-between">
                    <Col>Demo Unit Overdue / Near Expire</Col>
                    <Col>
                      <Link
                        to="/demoUnits"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="small">View</Button>
                      </Link>
                    </Col>
                  </Row>
                }
                value={data.demoUnitOverDueNearExpire}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card style={cardStyle}>
              <Statistic
                title={
                  <Row justify="space-between">
                    <Col>Maintenance Count</Col>
                    <Col>
                      <Link
                        to="/servicing"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button>View</Button>
                      </Link>
                    </Col>
                  </Row>
                }
                value={data.maintenanceCount}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        <h3 style={{ marginTop: 52 }}>Monthly Revenue</h3>
        <Divider />
        <div style={{ height: 500 }}>
          <MyBarChart data={monthlyRevenue} />
        </div>

        <h3 style={{ marginTop: 52 }}>Top Selling Products</h3>
        <Divider />
        <Table
          columns={topSellingTable}
          dataSource={topSellingProduct}
          rowKey="product_id"
        />

        <h3 style={{ marginTop: 52 }}>Recent Transaction</h3>
        <Divider />
        <Table
          columns={recentTransactionTable}
          dataSource={recentTransaction}
          rowKey="megaion_order_number"
        />
      </div>
    </>
  );
}

export default Dashboard;
