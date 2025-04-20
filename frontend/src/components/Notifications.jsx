import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Skeleton,
  Dropdown,
  Button,
  Badge,
  Menu,
  Modal,
  Divider,
} from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import {
  ShoppingCartOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  BellOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

import { formatWithComma } from "../helpers/numbers";

import ErrorContent from "./common/ErrorContent";
import http from "../services/httpService";

dayjs.extend(relativeTime);

function Notifications() {
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [error, setError] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [isLogoutLoadingVisible, setIsLogoutLoadingVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notifCount, setNotifCount] = useState(0);

  const [isReadLoading, setIsReadLoading] = useState(false);

  const getNotifications = async () => {
    const { data } = await http.get("/api/notifications");
    setNotifications(data);
    setNotifCount(data.filter((notif) => !notif.read).length);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsContentLoading(true);

        await getNotifications();
      } catch (error) {
        console.log(error);
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

  const menuItems = notifications.map((notification) => ({
    key: notification.id,
    label: (
      <div>
        <div>{notification.type}</div>
        <div style={{ fontSize: "12px", color: "gray" }}>
          {dayjs(notification.created_at).fromNow()}
        </div>
      </div>
    ),
    icon: (
      <>
        {!notification.read && <Badge dot />}
        <BellOutlined />
      </>
    ),
  }));

  const onClick = async ({ key }) => {
    try {
      setIsReadLoading(true);
      const notif = notifications.find(({ id }) => id == key);
      setIsLogoutLoadingVisible(true);
      setSelectedNotification(notif);

      await http.put(`/api/notifications/${notif.id}`, { read: 1 });
      setIsReadLoading(false);
    } catch (error) {
      console.log(error);
    } finally {
      setIsReadLoading(false);
    }
  };

  return (
    <>
      <Dropdown
        menu={{
          items: menuItems,
          onClick,
        }}
        placement="bottomLeft"
        overlayClassName="custom-dropdown-menu"
      >
        <Button type="text" style={{ width: 64, height: 64 }}>
          {isContentLoading ? (
            <LoadingOutlined style={{ fontSize: 16 }} />
          ) : (
            <Badge count={notifCount} size="small">
              <BellOutlined style={{ fontSize: 16 }} />
            </Badge>
          )}
        </Button>
      </Dropdown>

      <Modal
        title={
          <>
            <BellOutlined /> Notification
          </>
        }
        open={isLogoutLoadingVisible}
        footer={null}
        closable={false}
        width={300}
      >
        {isReadLoading ? (
          <div style={{ textAlign: "center" }}>
            <LoadingOutlined /> Loading...
          </div>
        ) : (
          <>
            {selectedNotification && (
              <div style={{ textAlign: "center" }}>
                <div>{selectedNotification.type}</div>
                <div style={{ fontSize: "12px", color: "gray" }}>
                  {dayjs(selectedNotification.created_at).fromNow()}
                </div>

                <Divider />
                <div>
                  Order Number: {selectedNotification.order.order_number}
                </div>
                <div>
                  Total Amount: PHP
                  {formatWithComma(selectedNotification.order.total_amount)}
                </div>
                <Divider />
                <Button
                  type="primary"
                  style={{ width: "100%" }}
                  onClick={async () => {
                    setIsLogoutLoadingVisible(false);
                    setIsContentLoading(true);
                    await getNotifications();
                    setIsContentLoading(false);
                  }}
                >
                  Close
                </Button>
              </div>
            )}
          </>
        )}
      </Modal>
    </>
  );
}

export default Notifications;
