import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Row,
  Col,
  Button,
  Table,
  Modal,
  Typography,
  Descriptions,
  Empty,
  Skeleton,
  Tag,
  App,
} from "antd";
import Barcode from "react-barcode";

import ErrorContent from "../../../components/common/ErrorContent";

import http from "../../../services/httpService";
import { formatWithComma } from "../../../helpers/numbers";

import useUserStore from "../../../store/UserStore";

import ViewAllocation from "./components/ViewAllocation";

import OrderTracking from "../../../components/common/OrderTracking";

const { Title, Text } = Typography;

function OrdersView() {
  const [order, setOrder] = useState(null);
  const [selectedOrderItem, setSelectedOrderItem] = useState(null);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [isViewAllocationOpen, setIsViewAllocationOpen] = useState(false);

  const { orderId } = useParams();
  const { roles } = useUserStore();
  const { modal } = App.useApp();

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

  const handleUpdateOrder = async (order, newStatusId) => {
    try {
      setIsContentLoading(true);
      await http.patch(`/api/orders/${order.id}/status`, {
        status_id: Number(newStatusId),
      });
      await getOrder();
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleAction = async (key, text) => {
    modal.confirm({
      title: `${text} Order`,
      content: `Are you sure you want to ${text.toLowerCase()} this order?`,
      onOk: async () => {
        handleUpdateOrder(order, key);
      },
    });
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
    {
      title: "Action",
      render: (text) => <Button>View Allocated</Button>,
      width: 150,
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

  let actionText = "";
  let actionKey = "";
  let showCancelButton = false;

  if (statusName === "Pending") {
    if (roles.includes("Sales Manager") || roles.includes("Admin")) {
      showCancelButton = true;
      actionKey = 2;
      actionText = "Approve";
    }
  }

  if (statusName === "Approved") {
    if (roles.includes("Warehouse Staff") || roles.includes("Admin")) {
      actionKey = 34;
      actionText = "Ready to Deliver";
    }
  }

  if (statusName === "Ready to Deliver") {
    if (roles.includes("Logistics Manager") || roles.includes("Admin")) {
      actionKey = 35;
      actionText = "In-Transit";
    }
  }

  if (statusName === "In-Transit") {
    if (roles.includes("Logistics Manager") || roles.includes("Admin")) {
      actionKey = 11;
      actionText = "Delivered";
    }
  }

  if (statusName === "Delivered") {
    if (roles.includes("Finance") || roles.includes("Admin")) {
      actionKey = 14;
      actionText = "Paid";
    }
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
              <div id="barcode" style={{ display: "none" }}>
                <Barcode
                  value={order.megaion_order_number}
                  height={30}
                  displayValue={true}
                />
              </div>
              <Button
                color="primary"
                size="large"
                variant="dashed"
                onClick={handlePrint}
                style={{ marginTop: 8 }}
              >
                Print Barcode
              </Button>
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

          <div style={{ textAlign: "right" }}>
            {showCancelButton && (
              <Button
                size="large"
                danger
                onClick={() => handleAction(12, "Cancel")}
                style={{ marginRight: 8 }}
              >
                Cancel
              </Button>
            )}
            {actionKey !== "" && (
              <Button
                size="large"
                type="primary"
                onClick={() => handleAction(actionKey, actionText)}
              >
                {actionText}
              </Button>
            )}
          </div>
        </Col>
        <Col span={8}>
          <div style={{ width: "100%", paddingLeft: 50, color: "#eb2f96" }}>
            <OrderTracking order={order} />
          </div>
        </Col>
      </Row>

      <Modal
        title="View Allocated Items"
        style={{ top: 20 }}
        open={isViewAllocationOpen}
        onCancel={toggleViewAllocationOpen}
        onOk={toggleViewAllocationOpen}
        destroyOnClose
        width={1000}
      >
        <ViewAllocation order={order} orderItem={selectedOrderItem} />
      </Modal>
    </>
  );
}

export default OrdersView;
