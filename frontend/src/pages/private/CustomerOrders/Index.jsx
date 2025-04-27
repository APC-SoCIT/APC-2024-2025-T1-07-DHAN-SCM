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

function CustomerOrders() {
  const [orders, setOrders] = useState([]);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

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

  const tableColumns = [
    {
      title: "Order No.",
      dataIndex: "megaion_order_number",
      ...getColumnSearchProps("megaion_order_number"),
      render: (_, record) => {
        return (
          <Link to={`/customerOrders/${record.id}`}>
            {record.megaion_order_number}
          </Link>
        );
      },
      width: 200,
    },
    {
      title: "Customer Order #",
      dataIndex: "company_order_number",
      ...getColumnSearchProps("company_order_number"),
      width: 150,
    },
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

export default CustomerOrders;
