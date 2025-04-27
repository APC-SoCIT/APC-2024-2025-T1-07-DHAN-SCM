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

function Orders() {
  const [orders, setOrders] = useState([]);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const navigate = useNavigate();
  const { statuses } = useDataStore();
  const { roles } = useUserStore();
  const { modal } = App.useApp();

  const getOrders = async () => {
    const { data } = await http.get("/api/orders");
    setOrders(data);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsContentLoading(true);
        await getOrders();
      } catch (error) {
        setErrorMsg(error.message);
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (errorMsg) {
    return <ErrorContent errorMessage={errorMsg} />;
  }

  const handleUpdateOrder = async (order, newStatusId) => {
    try {
      setIsContentLoading(true);
      await http.patch(`/api/orders/${order.id}/status`, {
        status_id: Number(newStatusId),
      });
      await getOrders();
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setIsContentLoading(false);
    }
  };

  const tableColumns = [
    {
      title: "Order No.",
      dataIndex: "megaion_order_number",
      ...getColumnSearchProps("megaion_order_number"),
      render: (_, record) => {
        return (
          <Link to={`/orders/${record.id}`}>{record.megaion_order_number}</Link>
        );
      },
      width: 200,
    },
    {
      title: "Customer Order #",
      dataIndex: "company_order_number",
      ...getColumnSearchProps("company_order_number"),
      width: 200,
    },
    {
      title: "Company",
      render: (_, record) => record.company.name,
    },
    // {
    //   title: "",
    //   ...getColumnSearchProps("barcode", "Scan Barcode"),
    // },
    {
      title: "Order date",
      dataIndex: "created_at",
      render: (text) => {
        return dayjs(text).format("MMMM DD, YYYY");
      },
      width: 200,
    },
    {
      title: "Total Items",
      dataIndex: "total_items",
      width: 150,
      render: (_, record) => formatWithComma(record.order_items.length),
    },
    {
      title: "Amount",
      dataIndex: "total_amount",
      width: 150,
      render: (text) => formatWithComma(text),
    },
    {
      title: "Status",
      dataIndex: "status_id",
      width: 100,

      render: (_, record) => {
        let color = "orange";
        const statusName = record.status.name;
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
          if (roles.includes("Sales Manager") || roles.includes("Admin")) {
            menuItems.push({ type: "divider" });
            menuItems.push({ key: 12, label: "Cancelled", danger: true });
            menuItems.unshift({ key: 2, label: "Approve" });
          }
        }

        if (statusName === "Approved") {
          if (roles.includes("Warehouse Staff") || roles.includes("Admin")) {
            menuItems.unshift({ key: 34, label: "Ready to Deliver" });
          }
        }

        if (statusName === "Ready to Deliver") {
          if (roles.includes("Logistic Manager") || roles.includes("Admin")) {
            menuItems.unshift({ key: 35, label: "In-Transit" });
          }
        }

        if (statusName === "In-Transit") {
          if (roles.includes("Logistic Manager") || roles.includes("Admin")) {
            menuItems.unshift({ key: 11, label: "Delivered" });
          }
        }

        if (statusName === "Delivered") {
          if (roles.includes("Finance") || roles.includes("Admin")) {
            menuItems.unshift({ key: 14, label: "Paid" });
          }
        }

        const handleMenuClick = ({ key }) => {
          if (key === "View") {
            navigate(`/orders/${record.id}`);
          } else {
            modal.confirm({
              title: `${statuses[key]} Order`,
              content: `Are you sure you want to ${statuses[
                key
              ].toLowerCase()} this order?`,
              onOk: async () => {
                handleUpdateOrder(record, key);
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

  const pendingOs = orders.filter((o) => o.status.name === "Pending");
  const approvedOs = orders.filter((o) => o.status.name === "Approved");
  const readyToDeliverOs = orders.filter(
    (o) => o.status.name === "Ready to Deliver"
  );
  const intransitOs = orders.filter((o) => o.status.name === "In-Transit");
  const deliveredOs = orders.filter((o) => o.status.name === "Delivered");
  const cancelledOs = orders.filter((o) => o.status.name === "Cancelled");

  const tabItems = [
    {
      key: "1",
      label: (
        <>
          Pending{" "}
          {pendingOs.length > 0 && (
            <Badge count={pendingOs.length} color="gold" />
          )}
        </>
      ),
      children: (
        <Table columns={tableColumns} dataSource={pendingOs} rowKey="id" />
      ),
    },
    {
      key: "2",
      label: (
        <>
          Approved{" "}
          {approvedOs.length > 0 && (
            <Badge count={approvedOs.length} color="green" />
          )}
        </>
      ),
      children: (
        <Table columns={tableColumns} dataSource={approvedOs} rowKey="id" />
      ),
    },
    {
      key: "3",
      label: (
        <>
          Ready to Deliver{" "}
          {readyToDeliverOs.length > 0 && (
            <Badge count={readyToDeliverOs.length} color="green" />
          )}
        </>
      ),
      children: (
        <Table
          columns={tableColumns}
          dataSource={readyToDeliverOs}
          rowKey="id"
        />
      ),
    },
    {
      key: "4",
      label: (
        <>
          In-Transit{" "}
          {intransitOs.length > 0 && (
            <Badge count={intransitOs.length} color="green" />
          )}
        </>
      ),
      children: (
        <Table columns={tableColumns} dataSource={intransitOs} rowKey="id" />
      ),
    },
    {
      key: "5",
      label: "Delivered",
      children: (
        <Table columns={tableColumns} dataSource={deliveredOs} rowKey="id" />
      ),
    },
    {
      key: "6",
      label: "Cancelled",
      children: (
        <Table columns={tableColumns} dataSource={cancelledOs} rowKey="id" />
      ),
    },
    {
      key: "7",
      label: "All Orders",
      children: (
        <Table
          columns={tableColumns.map((cols) =>
            cols.dataIndex === "status_id"
              ? {
                  ...cols,
                  filters: [
                    {
                      text: "Pending",
                      value: "Pending",
                    },
                    {
                      text: "Approved",
                      value: "Approved",
                    },
                    {
                      text: "Ready to Deliver",
                      value: "Ready to Deliver",
                    },
                    {
                      text: "In-Transit",
                      value: "In-Transit",
                    },
                    {
                      text: "Delivered",
                      value: "Delivered",
                    },
                    {
                      text: "Cancelled",
                      value: "Cancelled",
                    },
                  ],
                  onFilter: (value, record) => record.status.name === value,
                }
              : cols
          )}
          dataSource={orders}
          rowKey="id"
        />
      ),
    },
  ];

  return (
    <>
      <Spin spinning={isContentLoading} tip="loading ...">
        {/* <Row type="flex" justify="space-between" style={{ marginBottom: 16 }}>
          <Col></Col>
          <Col>
            <Link to="/orders/create">
              <Button type="primary">Create Purchase Order</Button>
            </Link>
          </Col>
        </Row> */}
        <Tabs defaultActiveKey="1" items={tabItems} />
      </Spin>
    </>
  );
}

export default Orders;
