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
} from "antd";
import { MoreOutlined } from "@ant-design/icons";

import ErrorContent from "../../../components/common/ErrorContent";

import http from "../../../services/httpService";
import { formatWithComma } from "../../../helpers/numbers";

import useDataStore from "../../../store/DataStore";

const { Title, Text } = Typography;

function CreatePurchaseOrder() {
  const [products, setProducts] = useState([]);
  const [purchaseOrder, setPurcaseOrder] = useState(null);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [error, setError] = useState(null);

  const { purchaseOrderId } = useParams();
  const { statuses, productUnits } = useDataStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsContentLoading(true);

        const { data: products } = await http.get("/api/products");
        const { data: purchaseOrder } = await http.get(
          `/api/purchaseOrders/${purchaseOrderId}`
        );
        setProducts(products);
        setPurcaseOrder(purchaseOrder);
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

  if (!purchaseOrder) {
    return <Empty />;
  }

  const tableColumns = [
    {
      title: "Name",
      dataIndex: "name",
      render: (_, record) => {
        return products.find(({ id }) => id === record.product_id).name;
      },
    },
    {
      title: "Unit",
      dataIndex: "product_unit_id",
      width: 100,
      render: (text) => productUnits[text],
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
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
      dataIndex: "amount",
      width: 100,
      render: (text) => formatWithComma(text),
    },
  ];

  const {
    supplier,
    purchase_order_items,
    notes,
    subtotal_amount,
    total_amount,
    status_id,
  } = purchaseOrder;

  let statusColor = "orange";
  if (status_id === 5) {
    statusColor = "green";
  } else if (status_id === 6) {
    statusColor = "blue";
  } else if (status_id === 7) {
    statusColor = "purple";
  } else if (status_id === 8) {
    statusColor = "red";
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Button onClick={handlePrint} type="primary" style={{ marginBottom: 16 }}>
        Print
      </Button>
      <div id="printArea">
        <Row>
          <Col span={16}>
            <Row
              type="flex"
              justify="space-between"
              style={{ marginBottom: 16 }}
            >
              <Col>
                <Title level={5} style={{ margin: 0 }}>
                  Purchase Order Number: #{purchaseOrder.id}
                </Title>
              </Col>
              <Col>
                <Tag color={statusColor}>{statuses[status_id]}</Tag>
              </Col>
            </Row>
            {supplier && (
              <div style={{ marginBottom: 16 }}>
                <Title level={5} style={{ marginBottom: 0 }}>
                  {supplier.name}
                </Title>
                <div>
                  <Text type="secondary">{supplier.address}</Text>
                </div>
                <div>
                  <Text type="secondary">{supplier.email}</Text>
                </div>
                <div>
                  <Text type="secondary">{supplier.phone}</Text>
                </div>
              </div>
            )}
            <Table
              columns={tableColumns}
              dataSource={purchase_order_items}
              rowKey="product_id"
              pagination={false}
            />
            <Row type="flex" justify="space-between" style={{ marginTop: 16 }}>
              <Col>
                <Space>
                  <span>Notes:</span>
                  <span>{notes}</span>
                </Space>
              </Col>
              <Col>
                <Descriptions
                  bordered
                  column={1}
                  items={[
                    {
                      label: "Subtotal:",
                      children: formatWithComma(subtotal_amount),
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
        </Row>
      </div>
    </>
  );
}

export default CreatePurchaseOrder;
