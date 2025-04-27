import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Row,
  Col,
  Table,
  Typography,
  Descriptions,
  Empty,
  Skeleton,
  Tag,
} from "antd";

import ErrorContent from "../../../components/common/ErrorContent";

import http from "../../../services/httpService";
import { formatWithComma } from "../../../helpers/numbers";

import OrderTracking from "../../../components/common/OrderTracking";

const { Title, Text } = Typography;

function CustomerOrdersView() {
  const [order, setOrder] = useState(null);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [isViewAllocationOpen, setIsViewAllocationOpen] = useState(false);

  const { orderId } = useParams();

  const getOrder = async () => {
    const { data: order } = await http.get(`/api/orders/${orderId}`);
    setOrder(order);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsContentLoading(true);
        await getOrder();
      } catch (error) {
        setErrorMsg(error.message);
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchData();
  }, []);

  if (errorMsg) {
    return <ErrorContent errorMessage={errorMsg} />;
  }

  if (isContentLoading) {
    return <Skeleton />;
  }

  if (!order) {
    return <Empty />;
  }

  const toggleViewAllocationOpen = () => {
    setIsViewAllocationOpen(!isViewAllocationOpen);
  };

  const tableColumns = [
    {
      title: "Product",
      render: (_, record) => {
        return record.product.name;
      },
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      width: 100,
      render: (text) => formatWithComma(text),
    },
    {
      title: "Price",
      dataIndex: "unit_price",
      width: 100,
      render: (text) => formatWithComma(text),
    },
    {
      title: "Amount",
      dataIndex: "total_price",
      width: 100,
      render: (text) => formatWithComma(text),
    },
  ];

  const { megaion_order_number, order_items, total_amount, status, company } =
    order;

  let color = "orange";
  const statusName = status.name;
  if (
    statusName === "Approved" ||
    statusName === "Ready to Deliver" ||
    statusName === "In-Transit"
  ) {
    color = "green";
  } else if (statusName === "Delivered") {
    color = "blue";
  } else if (statusName === "Paid") {
    color = "purple";
  } else if (statusName === "Cancelled") {
    color = "red";
  }

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Row type="flex" justify="space-between" style={{ marginBottom: 16 }}>
            <Col>
              <Title level={5} style={{ margin: 0 }}>
                Order Number: {megaion_order_number}
              </Title>
            </Col>
            <Col>
              <Tag style={{ fontSize: 16 }} color={color}>
                {statusName}
              </Tag>
            </Col>
          </Row>

          <div style={{ marginBottom: 16 }}>
            <Title level={5} style={{ marginBottom: 0 }}>
              {company.name}
            </Title>
            <div>
              <Text type="secondary">{company.phone_number || ""}</Text>
            </div>
            <div>
              <Text type="secondary">{company.address}</Text>
            </div>
          </div>

          <Table
            columns={tableColumns}
            dataSource={order_items}
            rowKey="id"
            pagination={false}
            rowClassName="cursor-pointer"
            onRow={(record) => ({
              onClick: () => {
                setSelectedOrderItem(record);
                toggleViewAllocationOpen();
              },
            })}
          />

          <Row
            type="flex"
            justify="space-between"
            style={{ marginTop: 16, marginBottom: 16 }}
          >
            <Col></Col>
            <Col>
              <Descriptions
                bordered
                column={1}
                items={[
                  {
                    label: "Subtotal:",
                    children: formatWithComma(total_amount),
                  },
                  {
                    label: "Total:",
                    children: formatWithComma(total_amount),
                  },
                ]}
                style={{ marginBottom: 16 }}
              />
            </Col>
          </Row>
        </Col>
        <Col span={8}>
          <div style={{ width: "100%", paddingLeft: 50, color: "#eb2f96" }}>
            <OrderTracking order={order} />
          </div>
        </Col>
      </Row>
    </>
  );
}

export default CustomerOrdersView;
