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
  Image,
  Divider,
  Modal,
} from "antd";
import dayjs from "dayjs";

import ErrorContent from "../../../components/common/ErrorContent";
import ViewReceive from "../PurchaseOrdersReceive/components/ViewReceive";

import http from "../../../services/httpService";
import { formatWithComma } from "../../../helpers/numbers";

import megaionImg from "../../../assets/images/megaion.png";

const { Title, Text } = Typography;

function PurchaseOrdersView() {
  const [purchaseOrder, setPurcaseOrder] = useState(null);
  const [selectedPOItem, setSelectedPOItem] = useState(null);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [isViewReceiveOpen, setIsViewReceiveOpen] = useState(false);

  const { purchaseOrderId } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsContentLoading(true);

        const { data: purchaseOrder } = await http.get(
          `/api/purchaseOrders/${purchaseOrderId}`
        );

        setPurcaseOrder(purchaseOrder.purchase_order);
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

  const toggleViewReceiveOpen = () => {
    setIsViewReceiveOpen(!isViewReceiveOpen);
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Row justify="space-between">
        <Col></Col>
        <Col>
          <Button
            onClick={handlePrint}
            type="primary"
            // style={{ marginBottom: 16 }}
            size="large"
          >
            Print
          </Button>
        </Col>
      </Row>

      <div id="printArea">
        <div style={{ marginBottom: 16 }}>
          <Image src={megaionImg} preview={false} height={50} width={150} />
          <div>
            Pablo Roman cor. Tropical Ave., BF International, Las Piñas City
            1740 Philippines
          </div>
          <div>+63947 891 8181, +632 8801 9109</div>
          <div>hello@megaion.net</div>
        </div>
        <Divider />
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
            <Tag style={{ fontSize: 16 }} color={statusColor}>
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
          rowClassName="cursor-pointer"
          pagination={false}
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
      </div>

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

export default PurchaseOrdersView;
