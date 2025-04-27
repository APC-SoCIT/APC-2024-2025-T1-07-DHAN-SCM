import { useEffect, useState } from "react";
import { Row, Col, Table, Card, Skeleton, Statistic } from "antd";
import { PlusCircleOutlined, MinusCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import ErrorContent from "../../../../../components/common/ErrorContent";

import http from "../../../../../services/httpService";

function ProductLogs({ product }) {
  const [productLogs, setProductLogs] = useState([]);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const getProductLogs = async () => {
    const { data } = await http.get(`/api/products/${product.id}/logs/`);
    setProductLogs(data);
  };

  useEffect(() => {
    const fetchProductLogs = async () => {
      try {
        setIsContentLoading(true);
        await getProductLogs();
      } catch (error) {
        setErrorMsg(error.message || "Something went wrong!");
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchProductLogs();
  }, []);

  if (errorMsg) {
    return <ErrorContent errorMessage={errorMsg} />;
  }

  if (isContentLoading) {
    return <Skeleton />;
  }

  const tableColumns = [
    {
      title: "Adjustment",
      dataIndex: "Adjustment",
      render: (text) => {
        if (text === "Decrease (-)") {
          return <span style={{ color: "#cf1322" }}>{text}</span>;
        } else {
          return <span style={{ color: "#3f8600" }}>{text}</span>;
        }
      },
    },
    {
      title: "Type",
      dataIndex: "type",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
    },
    {
      title: "Reference Number",
      dataIndex: "reference_number",
    },
    {
      title: "Transaction Date",
      dataIndex: "timestamp",
      render: (text) => dayjs(text).format("MMMM, DD YYYY HH:mm A"),
    },
  ];

  let totalIncrease = productLogs
    .filter((log) => log.Adjustment === "Increase (+)")
    .reduce((acc, item) => {
      acc += item.quantity;
      return acc;
    }, 0);
  let totalDecrease = productLogs
    .filter((log) => log.Adjustment === "Decrease (-)")
    .reduce((acc, item) => {
      acc += item.quantity;
      return acc;
    }, 0);

  return (
    <>
      <Row style={{ marginBottom: 16 }} gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Increase"
              value={totalIncrease}
              valueStyle={{ color: "#3f8600" }}
              prefix={<PlusCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Decrease"
              value={totalDecrease}
              valueStyle={{ color: "#cf1322" }}
              prefix={<MinusCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>
      <Table
        rowKey="timestamp"
        columns={tableColumns}
        dataSource={productLogs}
        pagination={false}
      />
    </>
  );
}

export default ProductLogs;
