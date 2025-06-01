import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  App,
} from "antd";
import dayjs from "dayjs";

import ErrorContent from "../../../components/common/ErrorContent";
import ViewReceive from "../PurchaseOrdersReceive/components/ViewReceive";

import http from "../../../services/httpService";
import { formatWithComma } from "../../../helpers/numbers";

import megaionImg from "../../../assets/images/megaion.png";
import dummySigImg from "../../../assets/images/dummysig.png";

import useUserStore from "../../../store/UserStore";

const { Title, Text } = Typography;

function PurchaseOrdersView() {
  const [purchaseOrder, setPurcaseOrder] = useState(null);
  const [selectedPOItem, setSelectedPOItem] = useState(null);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [isViewReceiveOpen, setIsViewReceiveOpen] = useState(false);

  const { purchaseOrderId } = useParams();
  const { roles } = useUserStore();
  const { modal } = App.useApp();
  const navigate = useNavigate();

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

  let color = "orange";
  const statusName = status.name;
  if (
    statusName === "Approved" ||
    statusName === "For Receiving" ||
    statusName === "Partially Received"
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
    if (roles.includes("Admin")) {
      showCancelButton = true;
      actionKey = 2;
      actionText = "Approve";
    }
  }

  if (statusName === "Approved") {
    if (roles.includes("Admin")) {
      actionKey = 33;
      actionText = "For Receiving";
    }
  }

  if (statusName === "Delivered") {
    if (roles.includes("Admin")) {
      actionKey = 14;
      actionText = "Paid";
    }
  }

  const handlePrint = () => {
    window.print();
  };

  const handleUpdatePurchaseOrder = async (purchaseOrder, newStatusId) => {
    try {
      setIsContentLoading(true);
      await http.put(`/api/purchaseOrders/${purchaseOrder.id}/status`, {
        status_id: Number(newStatusId),
      });
      if (newStatusId === 33) {
        navigate(`/purchaseOrders/receive/${purchaseOrder.id}`);
      } else {
        await getPurchaseOrder();
      }
    } catch (errorMsg) {
      setErrorMsg(errorMsg);
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleAction = async (key, text) => {
    modal.confirm({
      title: `${text} Purchase Order`,
      content: `Are you sure you want to ${text.toLowerCase()} this purchase order?`,
      onOk: async () => {
        handleUpdatePurchaseOrder(purchaseOrder, key);
      },
    });
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
        <Image src={megaionImg} preview={false} height={50} width={150} />

        <div style={{ textAlign: "right" }}>
          <Title level={3} style={{ marginBottom: 0 }}>
            Purchase Order
          </Title>
        </div>

        {/* vendor */}
        <div>
          {supplier && (
            <div>
              <Row>
                <Col span={10}>
                  <Title level={4} style={{ marginBottom: 0 }}>
                    Vendor
                  </Title>
                  <Divider style={{ margin: "0 12px" }} />
                </Col>
                <Col span={14}>
                  <div style={{ textAlign: "right" }}>
                    <Title level={5} style={{ marginBottom: 0 }}>
                      <u>
                        Date Ordered:{" "}
                        {dayjs(created_at).format("MMMM DD, YYYY")}
                      </u>
                    </Title>
                  </div>
                </Col>
              </Row>

              <Title level={5} style={{ margin: 0 }}>
                Supplier: {supplier.name}
              </Title>
              <div>
                <Text type="secondary">{supplier.contact_info}</Text>
              </div>
            </div>
          )}
        </div>

        <div style={{ textAlign: "right" }}>
          <Title level={5} style={{ marginBottom: 0 }}>
            <u>Purchase Order Number: #{ponumber}</u>
          </Title>
        </div>

        {/* ship to */}
        <div>
          <Row>
            <Col span={10}>
              <Title level={4} style={{ marginBottom: 0 }}>
                Ship To
              </Title>
              <Divider style={{ margin: "0 12px" }} />
            </Col>
            <Col span={14}></Col>
          </Row>

          <div>
            <Title level={5} style={{ margin: 0 }}>
              Megaion Corporation
            </Title>
          </div>
          <div>Pablo Roman cor. Tropical Ave.,</div>
          <div>BF International, Las Piñas City 1740 Philippines</div>
          <div>+63947 891 8181, +632 8801 9109</div>
          <div>hello@megaion.net</div>
        </div>

        <Divider />

        {/* <Row type="flex" justify="space-between" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={5} style={{ margin: 0 }}>
              Purchase Order Number: #{ponumber}
            </Title>
            <Text type="secondary">
              Date Ordered: {dayjs(created_at).format("MMMM DD, YYYY")}
            </Text>
          </Col>
          <Col>
            <Tag style={{ fontSize: 16 }} color={color}>
              {statusName}
            </Tag>
          </Col>
        </Row> */}

        <Table
          columns={tableColumns}
          dataSource={items}
          rowKey="product_id"
          rowClassName="cursor-pointer"
          pagination={false}
          size="small"
          onRow={(record) => ({
            onClick: () => {
              setSelectedPOItem(record);
              toggleViewReceiveOpen();
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

        {/* <Row gutter={32}>
          <Col span={6}>
            <div style={{ width: 250, textAlign: "center" }}>
              <div>APPROVED BY</div>
              <div style={{ borderTop: "1px solid #000" }}></div>
              <div>Caisa Subia</div>
              <div>President - Megaion Corporation</div>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ width: 250, marginLeft: 100, textAlign: "center" }}>
              <div>SIGNATURE</div>
              <div style={{ borderTop: "1px solid #000" }}></div>
            </div>
          </Col>
          <Col span={6}>
            <div style={{ width: 250, marginLeft: 100, textAlign: "center" }}>
              <div>DATE</div>
              <div style={{ borderTop: "1px solid #000" }}></div>
            </div>
          </Col>
        </Row> */}
        <table>
          <tbody>
            <tr>
              <td style={{ width: 250, verticalAlign: "top" }}>
                <div style={{ textAlign: "center" }}>
                  <div>APPROVED BY</div>
                  <div style={{ borderTop: "1px solid #000" }}></div>
                  <div>Caisa Subia</div>
                  <div>President - Megaion Corporation</div>
                </div>
              </td>
              <td style={{ width: 250, paddingLeft: 16, verticalAlign: "top" }}>
                <div style={{ textAlign: "center" }}>
                  <div>SIGNATURE</div>
                  <div style={{ borderTop: "1px solid #000" }}></div>
                  <div>
                    <img
                      src={dummySigImg}
                      style={{ height: 70, width: 150, marginTop: 12 }}
                    />
                  </div>
                </div>
              </td>
              <td style={{ width: 250, paddingLeft: 16, verticalAlign: "top" }}>
                <div style={{ textAlign: "center" }}>
                  <div>DATE</div>
                  <div style={{ borderTop: "1px solid #000" }}></div>
                  <div>{dayjs().format("MMMM DD, YYYY")}</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

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
