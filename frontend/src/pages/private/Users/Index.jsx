import { useEffect, useState } from "react";
import {
  Spin,
  Row,
  Col,
  Button,
  Drawer,
  Table,
  Modal,
  Dropdown,
  Tag,
  Space,
} from "antd";
import { MoreOutlined } from "@ant-design/icons";

import ErrorContent from "../../../components/common/ErrorContent";
import FormUser from "./components/FormUser";

import http from "../../../services/httpService";

import { getColumnSearchProps } from "../../../helpers/TableFilterProps";

function Users() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [roles, setRoles] = useState([]);

  const [isFormCreateUserOpen, setIsFormCreateUserOpen] = useState(false);
  const [isFormUpdateUserOpen, setIsFormUpdateUserOpen] = useState(false);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [errorMsg, setErroMsg] = useState(null);

  const getUsers = async () => {
    const { data } = await http.get("/api/users");
    setUsers(data);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsContentLoading(true);
        const { data: roles } = await http.get("/api/roles");
        setRoles(roles);
        await getUsers();
      } catch (error) {
        setErroMsg(error.message);
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (errorMsg) {
    return <ErrorContent errorMessage={errorMsg} />;
  }

  const toggleFormCreateUserOpen = () => {
    setIsFormCreateUserOpen(!isFormCreateUserOpen);
  };

  const toggleFormUpdateUserOpen = () => {
    setIsFormUpdateUserOpen(!isFormUpdateUserOpen);
  };

  const handleFormCreateUserSubmit = async (formData) => {
    try {
      toggleFormCreateUserOpen();
      setIsContentLoading(true);
      await http.post("/api/users", { ...formData, status_id: 1 });
      await getUsers();
    } catch (error) {
      setErroMsg(error.message);
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleFormUpdateUserSubmit = async (formData) => {
    try {
      toggleFormUpdateUserOpen();
      setIsContentLoading(true);
      await http.put(`/api/users/${selectedUser.id}`, formData);
      await getUsers();
    } catch (error) {
      setErroMsg(error.message);
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    try {
      setIsContentLoading(true);
      await http.delete(`/api/users/${user.id}`);
      await getUsers();
    } catch (error) {
      setErroMsg(error.message);
    } finally {
      setIsContentLoading(false);
    }
  };

  const tableColumns = [
    {
      title: "Name",
      dataIndex: "full_name",
      ...getColumnSearchProps("full_name"),
    },
    {
      title: "Roles",
      render: (_, record) => {
        return record.roles.map((role) => (
          <Space key={role.id}>
            <Tag>{role.name}</Tag>
          </Space>
        ));
      },
    },
    {
      title: "Action",
      width: 50,
      render: (_, record) => {
        const menuItems = [
          { key: "Update", label: "Update" },
          {
            type: "divider",
          },
          { key: "Delete", label: "Delete", danger: true },
        ];

        const handleMenuClick = ({ key }) => {
          if (key === "Update") {
            setSelectedUser(record);
            toggleFormUpdateUserOpen();
          } else if (key === "Delete") {
            Modal.confirm({
              title: "Delete User",
              content: "Are you sure you want to delete this user?",
              onOk: async () => {
                handleDeleteUser(record);
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

  return (
    <>
      <Spin spinning={isContentLoading} tip="loading ...">
        <Row type="flex" justify="space-between" style={{ marginBottom: 16 }}>
          <Col></Col>
          <Col>
            <Button type="primary" onClick={toggleFormCreateUserOpen}>
              Create User
            </Button>
          </Col>
        </Row>
        <Table columns={tableColumns} dataSource={users} rowKey="id" />
      </Spin>

      <Drawer
        title="Create User"
        open={isFormCreateUserOpen}
        destroyOnClose
        width={500}
        onClose={toggleFormCreateUserOpen}
      >
        <FormUser
          supportingData={{ roles }}
          onSubmit={handleFormCreateUserSubmit}
        />
      </Drawer>

      <Drawer
        title="Update User"
        open={isFormUpdateUserOpen}
        destroyOnClose
        width={500}
        onClose={toggleFormUpdateUserOpen}
      >
        <FormUser
          formData={selectedUser}
          supportingData={{ roles }}
          onSubmit={handleFormUpdateUserSubmit}
        />
      </Drawer>
    </>
  );
}

export default Users;
