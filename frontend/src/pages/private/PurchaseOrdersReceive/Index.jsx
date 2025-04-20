import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Row,
  Col,
  Button,
  Table,
  Typography,
  Descriptions,
  Empty,
  Skeleton,
  Tag,
  Modal,
} from "antd";
import dayjs from "dayjs";

import ErrorContent from "../../../components/common/ErrorContent";

import http from "../../../services/httpService";
import { formatWithComma } from "../../../helpers/numbers";

import FormReceive from "./components/FormReceive";
import ViewReceive from "./components/ViewReceive";

const { Title, Text } = Typography;

function PurchaseOrdersReceive() {
  const [purchaseOrder, setPurcaseOrder] = useState(null);
  const [selectedPOItem, setSelectedPOItem] = useState(null);

  const [isFormReceiveOpen, setIsFormReceiveOpen] = useState(false);
  const [isViewReceiveOpen, setIsViewReceiveOpen] = useState(false);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const { purchaseOrderId } = useParams();

  const getPurchaseOrder = async () => {
    const { data: purchaseOrder } = await http.get(
      `/api/purchaseOrders/${purchaseOrderId}`
    );
    setPurcaseOrder(purchaseOrder.purchase_order);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsContentLoading(true);
        await getPurchaseOrder();
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

  if (!purchaseOrder) {
    return <Empty />;
  }

  const toggleFormReceiveOpen = () => {
    setIsFormReceiveOpen(!isFormReceiveOpen);
  };

  const toggleViewReceiveOpen = () => {
    setIsViewReceiveOpen(!isViewReceiveOpen);
  };

  const handleFormReceiveSubmit = async (formData) => {
    try {
      toggleFormReceiveOpen();
      setIsContentLoading(true);

      if (selectedPOItem.product.is_machine) {
        // Extract and count dynamic serials fields
        const serialsKeys = Object.keys(formData).filter((key) =>
          key.startsWith("serial_number_")
        );

        // Prepare API calls for each serial
        const apiCalls = serialsKeys.map((serialKey) => {
          return http.post("/api/purchaseOrderItemDeliveries", {
            ...formData,
            delivered_quantity: 1,
            serial_number: formData[serialKey],
            purchase_order_item_id: selectedPOItem.id,
          });
        });

        // Execute all API calls in parallel
        await Promise.all(apiCalls);
      } else {
        await http.post("/api/purchaseOrderItemDeliveries", {
          ...formData,
          purchase_order_item_id: selectedPOItem.id,
        });
      }

      await getPurchaseOrder();
      setTimeout(() => {
        setSelectedPOItem(purchaseOrder.items[0]);
        toggleViewReceiveOpen();
      }, 10);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setIsContentLoading(false);
    }
  };

  const tableColumns = [
    {
      title: "Name",
      render: (_, record) => {
        return (
          <>
            <div>{record.product.name}</div>
            <div>
              <Text type="secondary">Model: {record.product.model}</Text>
            </div>
          </>
        );
      },
    },
    {
      title: "Unit",
      width: 100,
      render: (_, record) => {
        return record.product.product_unit.name;
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
      title: "Total Items Received",
      render: (_, record) => {
        const deliveredQuantity = record.deliveries.reduce((acc, item) => {
          acc += item.delivered_quantity;
          return acc;
        }, 0);
        return `${deliveredQuantity}/${record.quantity}`;
      },
      width: 200,
    },
    {
      title: "Status",
      render: (_, record) => {
        const deliveredQuantity = record.deliveries.reduce((acc, item) => {
          acc += item.delivered_quantity;
          return acc;
        }, 0);

        if (record.deliveries.length === 0) {
          return "For Receiving";
        } else if (record.quantity === deliveredQuantity) {
          return "Delivered";
        } else if (record.quantity !== deliveredQuantity) {
          return "Partially Received";
        }
      },
      width: 150,
    },
    {
      title: "Action",
      width: 100,
      render: (_, record) => {
        const deliveredQuantity = record.deliveries.reduce((acc, item) => {
          acc += item.delivered_quantity;
          return acc;
        }, 0);

        if (record.quantity === deliveredQuantity) {
          return "-";
        }

        return (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPOItem(record);
              toggleFormReceiveOpen();
            }}
          >
            Receive
          </Button>
        );
      },
    },
  ];

  const {
    ponumber,
    supplier,
    items,
    total_amount,
    status_id,
    status,
    created_at,
  } = purchaseOrder;

  let statusColor = "orange";
  if (status_id === 2 || status_id === 33 || status_id === 31) {
    statusColor = "green";
  } else if (status_id === 11) {
    statusColor = "blue";
  } else if (status_id === 14) {
    statusColor = "purple";
  } else if (status_id === 12) {
    statusColor = "red";
  }

  return (
    <>
      <Row type="flex" justify="space-between" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={5} style={{ margin: 0 }}>
            Purchase Order Number: #{ponumber}
          </Title>
          <Text type="secondary">
            Date Ordered: {dayjs(created_at).format("MMMM DD, YYYY")}
          </Text>
        </Col>
        <Col>
          <Tag color={statusColor} style={{ fontSize: 16 }}>
            {status.name}
          </Tag>
        </Col>
      </Row>
      {supplier && (
        <div style={{ marginBottom: 16 }}>
          <Title level={5} style={{ marginBottom: 0 }}>
            Supplier: {supplier.name}
          </Title>
          <div>
            <Text type="secondary">{supplier.contact_info}</Text>
          </div>
        </div>
      )}
      <Table
        columns={tableColumns}
        dataSource={items}
        rowKey="product_id"
        pagination={false}
        rowClassName="cursor-pointer"
        onRow={(record) => ({
          onClick: () => {
            setSelectedPOItem(record);
            toggleViewReceiveOpen();
          },
        })}
      />
      <Row type="flex" justify="space-between" style={{ marginTop: 16 }}>
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

      <Modal
        title="Receive Items"
        style={{ top: 20 }}
        open={isFormReceiveOpen}
        onCancel={toggleFormReceiveOpen}
        footer={null}
        destroyOnClose
      >
        <FormReceive
          supportingData={{ poItem: selectedPOItem }}
          onSubmit={handleFormReceiveSubmit}
        />
      </Modal>

      <Modal
        title="Receive Items"
        style={{ top: 20 }}
        open={isViewReceiveOpen}
        onCancel={toggleViewReceiveOpen}
        onOk={toggleViewReceiveOpen}
        destroyOnClose
        width={1000}
      >
        <ViewReceive supportingData={{ poItem: selectedPOItem }} />
      </Modal>
    </>
  );
}

export default PurchaseOrdersReceive;
