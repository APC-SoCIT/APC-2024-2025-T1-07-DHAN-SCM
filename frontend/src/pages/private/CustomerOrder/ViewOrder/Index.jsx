import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Row,
  Col,
  Table,
  Typography,
  Space,
  Descriptions,
  Empty,
  Skeleton,
  Tag,
  List,
} from "antd";

import ErrorContent from "../../../../components/common/ErrorContent";
import OrderTracking from "../../../../components/common/OrderTracking";

import http from "../../../../services/httpService";
import { formatWithComma } from "../../../../helpers/numbers";

import useDataStore from "../../../../store/DataStore";

const { Title, Text } = Typography;

function ViewOrder() {
  const [order, setOrder] = useState(null);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [error, setError] = useState(null);

  const { orderId } = useParams();
  const { statuses } = useDataStore();

  const getOrder = async () => {
    const { data: order } = await http.get(`/api/orders/${orderId}`);

    const newOrderItems = order.order_items.map((orderItem) => ({
      ...orderItem,
      orderItemAllocations: orderItem.order_items_allocation,
    }));

    order.order_items = newOrderItems;
    setOrder(order);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsContentLoading(true);
        await getOrder();
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

  if (!order) {
    return <Empty />;
  }

  const tableColumns = [
    {
      title: "Name",
      dataIndex: "name",
      render: (_, record) => {
        return record.product.name;
      },
    },
    {
      title: "Quantity",
      dataIndex: "qty",
      width: 100,
      render: (text) => formatWithComma(text),
    },
    {
      title: "Price",
      dataIndex: "price",
      width: 100,
      render: (text) => formatWithComma(text),
    },
    {
      title: "Amount",
      dataIndex: "total_amount",
      width: 100,
      render: (text) => formatWithComma(text),
    },
  ];

  const { order_number, order_items, total_amount, latest_status } = order;

  const status_id = latest_status.status.id;

  let statusColor = "orange";
  if (status_id === 11 || status_id === 12) {
    statusColor = "purple";
  } else if (status_id === 8) {
    statusColor = "red";
  }

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Row type="flex" justify="space-between" style={{ marginBottom: 16 }}>
            <Col>
              <Title level={5} style={{ margin: 0 }}>
                Order Number: {order_number}
              </Title>
            </Col>
            <Col>
              <Tag color={statusColor}>{statuses[status_id]}</Tag>
            </Col>
          </Row>

          <div style={{ marginBottom: 16 }}>
            <Title level={5} style={{ marginBottom: 0 }}>
              {order?.user?.company_members[0]?.company.name || "-"}
            </Title>
            <div>
              <Text type="secondary">
                {order?.user?.company_members[0]?.company?.phone_number || ""}
              </Text>
            </div>
            <div>
              <Text type="secondary">
                {order?.user?.company_members[0]?.company?.physical_address ||
                  ""}
              </Text>
            </div>
          </div>

          <Table
            columns={tableColumns}
            dataSource={order_items}
            rowKey="product_id"
            pagination={false}
            expandable={{
              expandedRowRender: (record) => (
                <>
                  <List
                    size="small"
                    bordered
                    dataSource={record.orderItemAllocations}
                    renderItem={(item) => (
                      <List.Item>
                        <div style={{ fontSize: 11 }}>
                          <Space>
                            <span>
                              <strong>Quantity Allocated</strong>: {item.qty}
                            </span>
                          </Space>
                        </div>
                      </List.Item>
                    )}
                  />
                </>
              ),
            }}
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
            <OrderTracking orderId={order.id} />
          </div>
        </Col>
      </Row>
    </>
  );
}

export default ViewOrder;
