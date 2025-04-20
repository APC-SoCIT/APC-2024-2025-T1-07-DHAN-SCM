import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Spin,
  Row,
  Col,
  Button,
  Drawer,
  Table,
  Modal,
  Dropdown,
  Select,
  Typography,
  Space,
  Descriptions,
  Input,
  Empty,
  Skeleton,
  Tag,
  List,
  Card,
} from "antd";
import { MoreOutlined, TruckOutlined } from "@ant-design/icons";
import Barcode from "react-barcode";

import ErrorContent from "../../../../components/common/ErrorContent";

import http from "../../../../services/httpService";
import { formatWithComma } from "../../../../helpers/numbers";

import useDataStore from "../../../../store/DataStore";
import useUserStore from "../../../../store/UserStore";

import FormAllocation from "./components/FormAllocation";

import OrderTracking from "../../../../components/common/OrderTracking";

const { Title, Text } = Typography;

function ViewOrder() {
  const [order, setOrder] = useState(null);
  const [selectedOrderItem, setSelectedOrderItem] = useState(null);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isFormAllocationOpen, setIsFormAllocationOpen] = useState(false);

  const { orderId } = useParams();
  const { statuses } = useDataStore();
  const { roles } = useUserStore();

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

  const toggleFormAllocationOpen = () => {
    setIsFormAllocationOpen(!isFormAllocationOpen);
  };

  const handleFormAllocationSubmit = (formData) => {
    toggleFormAllocationOpen();
    const { forInsertOrderAllocation, forInsertInventory } = formData;

    const newOrderItems = order.order_items.map((orderItem) => {
      if (orderItem.id === selectedOrderItem.id) {
        return {
          ...orderItem,
          orderItemAllocations: forInsertOrderAllocation,
          forInsertInventory,
        };
      }
      return orderItem;
    });

    order.order_items = newOrderItems;

    setOrder(order);
  };

  function hasEmptyAllocation(order) {
    return order
      ? order.order_items.some((item) => item.orderItemAllocations.length === 0)
      : true;
  }

  const handleProcess = async () => {
    try {
      setIsContentLoading(true);
      let forInsertInventory = [];
      let forOrderItemsAllocationInsert = [];

      order.order_items.forEach((orderItem) => {
        forInsertInventory = [
          ...forInsertInventory,
          ...orderItem.forInsertInventory,
        ];
        forOrderItemsAllocationInsert = [
          ...forOrderItemsAllocationInsert,
          ...orderItem.orderItemAllocations,
        ];
      });

      await http.post("/api/saveOrderAllocation", {
        order_id: order.id,
        forInventoryInsert: forInsertInventory,
        forOrderItemsAllocationInsert,
      });
      await getOrder();
    } catch (error) {
      setError(true);
    } finally {
      setIsContentLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("barcode").innerHTML;
    const printWindow = window.open("", "", "height=600,width=800");
    printWindow.document.write("<html><head><title>Print</title>");
    printWindow.document.write("</head><body >");
    printWindow.document.write(printContent);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

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

  if (roles.includes("Sales") || roles.includes("Admin")) {
    tableColumns.push({
      title: "Action",
      width: 50,
      render: (_, record) => {
        return (
          <Button
            onClick={() => {
              setSelectedOrderItem({ order, ...record });
              toggleFormAllocationOpen();
            }}
          >
            Allocate
          </Button>
        );
      },
    });
  }

  if (order.latest_status.status.id !== 9) {
    tableColumns.pop();
  }

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
            defaultExpandAllRows
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
            <Col>
              <div id="barcode">
                <Barcode
                  value={order.barcode}
                  height={50}
                  displayValue={true}
                />
              </div>
              <Button onClick={handlePrint}>Print Barcode</Button>
            </Col>
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

          {order.latest_status.status.id === 9 && (
            <div style={{ textAlign: "right" }}>
              {(roles.includes("Sales") || roles.includes("Admin")) && (
                <Button
                  size="large"
                  type="primary"
                  disabled={hasEmptyAllocation(order)}
                  onClick={handleProcess}
                >
                  Process
                </Button>
              )}
            </div>
          )}
        </Col>
        <Col span={8}>
          <div style={{ width: "100%", paddingLeft: 50, color: "#eb2f96" }}>
            <OrderTracking orderId={order.id} />
          </div>
        </Col>
      </Row>

      <Drawer
        title="Select Product"
        open={isFormAllocationOpen}
        destroyOnClose
        width={600}
        onClose={toggleFormAllocationOpen}
      >
        <FormAllocation
          supportingData={{ selectedOrderItem }}
          onSubmit={handleFormAllocationSubmit}
        />
      </Drawer>
    </>
  );
}

export default ViewOrder;
