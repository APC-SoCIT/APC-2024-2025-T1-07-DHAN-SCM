import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Spin, Button, Table, Dropdown, Tag, App } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import ErrorContent from "../../../components/common/ErrorContent";

import http from "../../../services/httpService";

import { getColumnSearchProps } from "../../../helpers/TableFilterProps";
import { formatWithComma } from "../../../helpers/numbers";

import useDataStore from "../../../store/DataStore";

function CustomerOrder() {
  const [orders, setOrders] = useState([]);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { statuses } = useDataStore();
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

  const tableColumns = [
    {
      title: "Order No.",
      dataIndex: "order_number",
      ...getColumnSearchProps("order_number"),
      render: (_, record) => {
        return <div>{record.order_number}</div>;
      },
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
        const menuItems = [{ key: "View", label: "View Details" }];

        const handleMenuClick = ({ key }) => {
          if (key === "View") {
            navigate(`/customerOrders/${record.id}`);
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

  return (
    <>
      <Spin spinning={isContentLoading} tip="loading ...">
        <Table columns={tableColumns} dataSource={orders} rowKey="id" />
      </Spin>
    </>
  );
}

export default CustomerOrder;
