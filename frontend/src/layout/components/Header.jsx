import { useState } from "react";
import {
  Layout,
  Button,
  Row,
  Col,
  Dropdown,
  Avatar,
  Badge,
  theme,
  message,
  Modal,
} from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import useAppStore from "../../store/AppStore";

import http from "../../services/httpService";

import Notifications from "../../components/Notifications";

import useUserStore from "../../store/UserStore";

function Header() {
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const [isLogoutLoadingVisible, setIsLogoutLoadingVisible] = useState(false);

  const { isSidebarOpen, toggleSidebar } = useAppStore();
  const { name } = useUserStore();

  const logout = async () => {
    try {
      setIsLogoutLoadingVisible(true);
      await http.post("/api/logout"); // Adjust the API endpoint as needed
      localStorage.removeItem("token");
      window.location.reload();
    } catch (error) {
      message.error("Failed to logout");
      setIsLogoutLoadingVisible(false);
    }
  };

  const menuItems = [
    {
      key: "account settings",
      label: "Account Settings",
      icon: <UserOutlined />,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      onClick: logout,
    },
  ];

  return (
    <>
      <Layout.Header
        style={{
          padding: 0,
          background: colorBgContainer,
        }}
      >
        <Row justify="space-between">
          <Col>
            <Button
              type="text"
              icon={
                isSidebarOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />
              }
              onClick={toggleSidebar}
              style={{ fontSize: "16px", width: 64, height: 64 }}
            />
          </Col>
          <Col>
            {/* <Notifications /> */}
            <Dropdown menu={{ items: menuItems }} placement="bottomLeft">
              <Button type="text" style={{ height: 64 }}>
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  style={{
                    backgroundColor: "#1677ff",
                  }}
                />{" "}
                {name}
              </Button>
            </Dropdown>
          </Col>
        </Row>
      </Layout.Header>
      <Modal
        open={isLogoutLoadingVisible}
        footer={null}
        closable={false}
        width={300}
      >
        <div style={{ textAlign: "center" }}>
          <LoadingOutlined /> Logging out. Please wait ...
        </div>
      </Modal>
    </>
  );
}

export default Header;
