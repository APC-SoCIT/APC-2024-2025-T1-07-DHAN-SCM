import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Spin,
  Row,
  Col,
  Button,
  Table,
  Dropdown,
  Tabs,
  Badge,
  Typography,
  Tag,
  App,
} from "antd";
import { MoreOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import ErrorContent from "../../../components/common/ErrorContent";

import http from "../../../services/httpService";

import { getColumnSearchProps } from "../../../helpers/TableFilterProps";
import { formatWithComma } from "../../../helpers/numbers";

import useDataStore from "../../../store/DataStore";
import useUserStore from "../../../store/UserStore";

const { Text } = Typography;

function PurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const navigate = useNavigate();
  const { statuses } = useDataStore();
  const { roles } = useUserStore();
  const { modal } = App.useApp();

  const getPurchaseOrders = async () => {
    const { data } = await http.get("/api/purchaseOrders");
    setPurchaseOrders(data.purchase_orders);
  };

  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      try {
        setIsContentLoading(true);
        await getPurchaseOrders();
      } catch (errorMsg) {
        setErrorMsg(errorMsg);
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchPurchaseOrders();
  }, []);

  if (errorMsg) {
    return <ErrorContent errorMessage={errorMsg} />;
  }

  const handleUpdatePurchaseOrder = async (purchaseOrder, newStatusId) => {
    try {
      setIsContentLoading(true);
      await http.put(`/api/purchaseOrders/${purchaseOrder.id}/status`, {
        status_id: Number(newStatusId),
      });

      await getPurchaseOrders();
    } catch (errorMsg) {
      setErrorMsg(errorMsg);
    } finally {
      setIsContentLoading(false);
    }
  };

  const tableColumns = [
    {
      title: "Purchase Order No.",
      dataIndex: "ponumber",
      ...getColumnSearchProps("ponumber"),
      render: (_, record) => {
        const { ponumber, supplier } = record;

        return (
          <Link to={`/purchaseOrders/${record.id}`}>
            <div>
              <Text strong>{ponumber}</Text>
            </div>
            <div>{supplier.name}</div>
            <div>
              {supplier.contact_info && (
                <Text type="secondary" italic>
                  {supplier.contact_info}
                </Text>
              )}
            </div>
          </Link>
        );
      },
    },
    {
      title: "Amount",
      dataIndex: "total_amount",
      width: 100,
      render: (text) => formatWithComma(text),
    },
    {
      title: "Date Ordered",
      dataIndex: "created_at",
      width: 150,
      render: (text) => dayjs(text).format("MMMM DD, YYYY"),
    },
    {
      title: "Status",
      width: 100,
      render: (_, record) => {
        let color = "orange";
        const statusName = record.status.name;
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
        return <Tag color={color}>{statusName}</Tag>;
      },
    },
    {
      title: "Action",
      width: 50,
      render: (_, record) => {
        const menuItems = [{ key: "View", label: "View Details" }];

        const statusName = record.status.name;

        if (statusName === "Pending") {
          if (roles.includes("Admin")) {
            menuItems.push({ type: "divider" });
            menuItems.push({ key: 12, label: "Cancelled", danger: true });
            menuItems.unshift({ key: 2, label: "Approved" });
          }
        }

        if (statusName === "Approved") {
          if (roles.includes("Admin")) {
            menuItems.push({ type: "divider" });
            menuItems.push({ key: 12, label: "Cancelled", danger: true });
            menuItems.unshift({ key: 33, label: "For Receiving" });
          }
        }

        if (
          statusName === "For Receiving" ||
          statusName === "Partially Received"
        ) {
          if (roles.includes("Admin") || roles.includes("Warehouse Staff")) {
            menuItems.unshift({ key: "Receive", label: "Receive" });
          }
        }

        if (statusName === "Delivered") {
          if (roles.includes("Admin")) {
            menuItems.unshift({ key: 14, label: "Paid" });
          }
        }

        const handleMenuClick = ({ key, label }) => {
          if (key === "View") {
            navigate(`/purchaseOrders/${record.id}`);
          }
          if (key === "Receive") {
            navigate(`/purchaseOrders/receive/${record.id}`);
          } else {
            modal.confirm({
              title: `${statuses[key]} Purchase Order`,
              content: `Are you sure you want to ${statuses[
                key
              ].toLowerCase()} this purchase order?`,
              onOk: async () => {
                handleUpdatePurchaseOrder(record, key);
              },
            });
          }
        };

        return (
          <Dropdown
            menu={{ items: menuItems, onClick: handleMenuClick }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button shape="circle" onClick={(e) => e.stopPropagation()}>
              <MoreOutlined />
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  const pendingPOs = purchaseOrders.filter(
    (po) => po.status.name === "Pending"
  );
  const approvedPOs = purchaseOrders.filter(
    (po) => po.status.name === "Approved"
  );
  const forReceivingPOs = purchaseOrders.filter(
    (po) => po.status.name === "For Receiving"
  );
  const partiallyReceivedPOs = purchaseOrders.filter(
    (po) => po.status.name === "Partially Received"
  );
  const deliveredPOs = purchaseOrders.filter(
    (po) => po.status.name === "Delivered"
  );
  const cancelledPos = purchaseOrders.filter(
    (po) => po.status.name === "Cancelled"
  );

  const tabItems = [
    {
      key: "1",
      label: (
        <>
          Pending{" "}
          {pendingPOs.length > 0 && (
            <Badge count={pendingPOs.length} color="gold" />
          )}
        </>
      ),
      children: (
        <Table columns={tableColumns} dataSource={pendingPOs} rowKey="id" />
      ),
    },
    {
      key: "2",
      label: (
        <>
          Approved{" "}
          {approvedPOs.length > 0 && (
            <Badge count={approvedPOs.length} color="green" />
          )}
        </>
      ),
      children: (
        <Table columns={tableColumns} dataSource={approvedPOs} rowKey="id" />
      ),
    },
    {
      key: "3",
      label: (
        <>
          For Receiving{" "}
          {forReceivingPOs.length > 0 && (
            <Badge count={forReceivingPOs.length} color="green" />
          )}
        </>
      ),
      children: (
        <Table
          columns={tableColumns}
          dataSource={forReceivingPOs}
          rowKey="id"
        />
      ),
    },
    {
      key: "4",
      label: (
        <>
          Partially Received{" "}
          {partiallyReceivedPOs.length > 0 && (
            <Badge count={partiallyReceivedPOs.length} color="green" />
          )}
        </>
      ),
      children: (
        <Table
          columns={tableColumns}
          dataSource={partiallyReceivedPOs}
          rowKey="id"
        />
      ),
    },
    {
      key: "5",
      label: (
        <>
          Delivered{" "}
          {deliveredPOs.length > 0 && (
            <Badge count={deliveredPOs.length} color="blue" />
          )}
        </>
      ),
      children: (
        <Table columns={tableColumns} dataSource={deliveredPOs} rowKey="id" />
      ),
    },
    {
      key: "6",
      label: "Cancelled",
      children: (
        <Table columns={tableColumns} dataSource={cancelledPos} rowKey="id" />
      ),
    },
    {
      key: "7",
      label: "All Purchase Orders",
      children: (
        <Table columns={tableColumns} dataSource={purchaseOrders} rowKey="id" />
      ),
    },
  ];

  return (
    <>
      <Spin spinning={isContentLoading} tip="loading ...">
        <Row type="flex" justify="space-between" style={{ marginBottom: 16 }}>
          <Col></Col>
          <Col>
            <Link to="/purchaseOrders/create">
              <Button type="primary">Create Purchase Order</Button>
            </Link>
          </Col>
        </Row>
        <Tabs defaultActiveKey="1" items={tabItems} />
      </Spin>
    </>
  );
}

export default PurchaseOrders;
