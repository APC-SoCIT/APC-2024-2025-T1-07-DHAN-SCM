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
  List,
  Timeline,
} from "antd";
import { MoreOutlined, TruckOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import ErrorContent from "./ErrorContent";

import http from "../../services/httpService";
import { formatWithComma } from "../../helpers/numbers";

import useDataStore from "../../store/DataStore";

const { Title, Text } = Typography;

function OrderTracking({ orderId }) {
  const [orderTracking, setOrderTracking] = useState(null);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [error, setError] = useState(null);

  const { statuses } = useDataStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsContentLoading(true);
        const { data } = await http.get(`/api/orderStatuses/${orderId}`);
        setOrderTracking(data);
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

  if (!orderTracking) {
    return <Empty />;
  }

  //   [
  //     {
  //       color: "green",
  //       children: "Create a services site 2015-09-01",
  //     },
  //   ]

  return (
    <>
      <TruckOutlined style={{ fontSize: 50, marginBottom: 16 }} />
      <Timeline
        items={orderTracking.map((item) => {
          const status_id = item.status_id;

          let statusColor = "orange";
          if (status_id === 11 || status_id === 12) {
            statusColor = "purple";
          } else if (status_id === 8) {
            statusColor = "red";
          }

          return {
            color: statusColor,
            children: (
              <>
                <p>{statuses[status_id]}</p>
                <p>{dayjs(item.created_at).format("MMMM, DD YYYY HH:mm A")}</p>
              </>
            ),
          };
        })}
      />
    </>
  );
}

export default OrderTracking;
