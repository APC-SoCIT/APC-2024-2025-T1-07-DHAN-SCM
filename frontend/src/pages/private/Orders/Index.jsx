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
  const [error, setError] = useState(null);

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
        setError(error);
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (error) {
    return <ErrorContent />;
  }

  const handleUpdateOrder = async (order, newStatusId) => {
    try {
      setIsContentLoading(true);
      await http.post(`/api/orderStatuses`, {
        order_id: order.id,
        status_id: Number(newStatusId),
      });
      await getOrders();
    } catch (error) {
      setError(error);
    } finally {
      setIsContentLoading(false);
    }
  };

  const tableColumns = [
    {
      title: "Order No.",
      dataIndex: "order_number",
      ...getColumnSearchProps("order_number"),
      render: (_, record) => {
        return <div>{record.order_number}</div>;
      },
      width: 200,
    },
    {
      title: "Company",
      dataIndex: "total_items",
      render: (_, record) =>
        record?.user?.company_members[0]?.company.name || "-",
    },
    {
      title: "",
      ...getColumnSearchProps("barcode", "Scan Barcode"),
    },
    {
      title: "Order date",
      dataIndex: "created_at",
      render: (text) => {
        return dayjs("2025-03-03").format("MMMM DD, YYYY");
      },
      width: 200,
    },
    {
      title: "Total Items",
      dataIndex: "total_items",
      width: 150,
      render: (text) => formatWithComma(text),
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
        const status_id = record.latest_status.status.id;

        let color = "orange";
        if (status_id === 11 || status_id === 12) {
          color = "purple";
        } else if (status_id === 8) {
          color = "red";
        }
        return <Tag color={color}>{statuses[status_id]}</Tag>;
      },
    },
    {
      title: "Action",
      width: 50,
      render: (_, record) => {
        const menuItems = [
          { key: "View", label: "View Details" },
          {
            type: "divider",
          },
          { key: 8, label: statuses[8], danger: true },
        ];

        const status_id = record.latest_status.status.id;

        if (status_id === 10) {
          if (roles.includes("Logistic manager") || roles.includes("Admin")) {
            menuItems.unshift({ key: 11, label: statuses[11] });
          }
          menuItems.pop();
          menuItems.pop();
        }

        if (status_id === 11) {
          if (roles.includes("Logistic manager")) {
            menuItems.unshift({ key: 12, label: statuses[12] });
          }
          menuItems.pop();
          menuItems.pop();
        }

        if (status_id === 12) {
          menuItems.pop();
          menuItems.pop();
        }

        const handleMenuClick = ({ key }) => {
          if (key === "View") {
            navigate(`/orders/${record.id}`);
          } else {
            modal.confirm({
              title: `${statuses[key]} Purchase Order`,
              content: `Are you sure you want to ${statuses[
                key
              ].toLowerCase()} this purchase order?`,
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

  const onHoldOs = orders.filter((o) => o.latest_status.status.id === 9);
  const processingOs = orders.filter((o) => o.latest_status.status.id === 10);
  const inTransitOs = orders.filter((o) => o.latest_status.status.id === 11);
  const deliveredOs = orders.filter((o) => o.latest_status.status.id === 12);
  const cancelledOs = orders.filter((o) => o.latest_status.status.id === 8);

  const tabItems = [
    {
      key: "1",
      label: (
        <>
          On Hold{" "}
          {onHoldOs.length > 0 && (
            <Badge count={onHoldOs.length} color="gold" />
          )}
        </>
      ),
      children: (
        <Table columns={tableColumns} dataSource={onHoldOs} rowKey="id" />
      ),
    },
    {
      key: "2",
      label: (
        <>
          Processing{" "}
          {processingOs.length > 0 && (
            <Badge count={processingOs.length} color="gold" />
          )}
        </>
      ),
      children: (
        <Table columns={tableColumns} dataSource={processingOs} rowKey="id" />
      ),
    },
    {
      key: "3",
      label: (
        <>
          In Transit{" "}
          {inTransitOs.length > 0 && (
            <Badge count={inTransitOs.length} color="gold" />
          )}
        </>
      ),
      children: (
        <Table columns={tableColumns} dataSource={inTransitOs} rowKey="id" />
      ),
    },
    {
      key: "4",
      label: "Delivered",
      children: (
        <Table columns={tableColumns} dataSource={deliveredOs} rowKey="id" />
      ),
    },
    {
      key: "5",
      label: "Cancelled",
      children: (
        <Table columns={tableColumns} dataSource={cancelledOs} rowKey="id" />
      ),
    },
    {
      key: "6",
      label: "All Orders",
      children: (
        <Table
          columns={tableColumns.map((cols) =>
            cols.dataIndex === "status_id"
              ? {
                  ...cols,
                  filters: [
                    {
                      text: "On Hold",
                      value: 9,
                    },
                    {
                      text: "Processing",
                      value: 10,
                    },
                    {
                      text: "In Transit",
                      value: 11,
                    },
                    {
                      text: "Delivered",
                      value: 12,
                    },
                    {
                      text: "Cancelled",
                      value: 8,
                    },
                  ],
                  onFilter: (value, record) =>
                    record.latest_status.status.id === value,
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
