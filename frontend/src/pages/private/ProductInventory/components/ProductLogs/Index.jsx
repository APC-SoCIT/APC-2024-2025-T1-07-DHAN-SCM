import { useEffect, useState } from "react";
import {
  Spin,
  Row,
  Col,
  Button,
  Drawer,
  Table,
  Dropdown,
  Tag,
  Typography,
  Image,
  Space,
  Popover,
  Card,
  Segmented,
  Skeleton,
} from "antd";
import {
  MoreOutlined,
  ArrowDownOutlined,
  EnvironmentOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import ErrorContent from "../../../../../components/common/ErrorContent";

import http from "../../../../../services/httpService";
import { getColumnSearchProps } from "../../../../../helpers/TableFilterProps";
import { formatWithComma } from "../../../../../helpers/numbers";

function ProductLogs({ product }) {
  const [productLogs, setProductLogs] = useState([]);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const getProductLogs = async () => {
    const { data } = await http.get(`/api/products/${product.id}/logs/`);
    setProductLogs(data);
  };

  useEffect(() => {
    const fetchProductLogs = async () => {
      try {
        setIsContentLoading(true);
        await getProductLogs();
      } catch (error) {
        setErrorMsg(error.message || "Something went wrong!");
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchProductLogs();
  }, []);

  if (errorMsg) {
    return <ErrorContent errorMessage={errorMsg} />;
  }

  if (isContentLoading) {
    return <Skeleton />;
  }

  const tableColumns = [
    {
      title: "Adjustment",
      dataIndex: "Adjustment",
      render: (text) => text || "N/A",
    },
    {
      title: "Type",
      dataIndex: "type",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
    },
    {
      title: "Reference Number",
      dataIndex: "reference_number",
    },
    {
      title: "Transaction Date",
      dataIndex: "timestamp",
      render: (text) => dayjs(text).format("MMMM, DD YYYY HH:mm A"),
    },
  ];

  return (
    <>
      <Table
        rowKey="timestamp"
        columns={tableColumns}
        dataSource={productLogs}
      />
    </>
  );
}

export default ProductLogs;
