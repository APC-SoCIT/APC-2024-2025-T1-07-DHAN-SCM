import { useEffect, useState } from "react";
import { Spin, Row, Col, Button, Drawer, Table, Modal, Dropdown } from "antd";
import { MoreOutlined } from "@ant-design/icons";

import ErrorContent from "../../../components/common/ErrorContent";
import FormDemoRequest from "./components/FormDemoRequest";

import http from "../../../services/httpService";

import { getColumnSearchProps } from "../../../helpers/TableFilterProps";

function DemoRequests() {
  const [demoRequests, setDemoRequests] = useState([]);
  const [selectedDemoRequest, setSelectedDemoRequest] = useState(null);

  const [isFormCreateDemoRequestOpen, setIsFormCreateDemoRequestOpen] =
    useState(false);
  const [isFormUpdateDemoRequestOpen, setIsFormUpdateDemoRequestOpen] =
    useState(false);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const getDemoRequests = async () => {
    const { data } = await http.get("/api/demoRequests");
    setDemoRequests(data);
  };

  useEffect(() => {
    const fetchDemoRequests = async () => {
      try {
        setIsContentLoading(true);
        await getDemoRequests();
      } catch (error) {
        setErrorMsg(error.message || "Something went wrong!");
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchDemoRequests();
  }, []);

  if (errorMsg) {
    return <ErrorContent errorMessage={errorMsg} />;
  }

  const toggleFormCreateDemoRequestOpen = () => {
    setIsFormCreateDemoRequestOpen(!isFormCreateDemoRequestOpen);
  };

  const toggleFormUpdateDemoRequestOpen = () => {
    setIsFormUpdateDemoRequestOpen(!isFormUpdateDemoRequestOpen);
  };

  const handleFormCreateDemoRequestSubmit = async (formData) => {
    try {
      toggleFormCreateDemoRequestOpen();
      setIsContentLoading(true);
      await http.post("/api/demoRequests", { ...formData, status_id: 1 });
      await getDemoRequests();
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong!");
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleFormUpdateDemoRequestSubmit = async (formData) => {
    try {
      toggleFormUpdateDemoRequestOpen();
      setIsContentLoading(true);
      await http.put(`/api/demoRequests/${selectedDemoRequest.id}`, formData);
      await getDemoRequests();
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong!");
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleDeleteDemoRequest = async (demoRequest) => {
    try {
      setIsContentLoading(true);
      await http.delete(`/api/demoRequests/${demoRequest.id}`);
      await getDemoRequests();
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong!");
    } finally {
      setIsContentLoading(false);
    }
  };

  const tableColumns = [
    {
      title: "Name",
      dataIndex: "name",
      ...getColumnSearchProps("name"),
    },
    {
      title: "Description",
      dataIndex: "description",
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
            setSelectedDemoRequest(record);
            toggleFormUpdateDemoRequestOpen();
          } else if (key === "Delete") {
            Modal.confirm({
              title: "Delete DemoRequest",
              content: "Are you sure you want to delete this demoRequest?",
              onOk: async () => {
                handleDeleteDemoRequest(record);
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
            <Button type="primary" onClick={toggleFormCreateDemoRequestOpen}>
              Create DemoRequest
            </Button>
          </Col>
        </Row>
        <Table columns={tableColumns} dataSource={demoRequests} rowKey="id" />
      </Spin>

      <Drawer
        title="Create DemoRequest"
        open={isFormCreateDemoRequestOpen}
        destroyOnClose
        width={500}
        onClose={toggleFormCreateDemoRequestOpen}
      >
        <FormDemoRequest onSubmit={handleFormCreateDemoRequestSubmit} />
      </Drawer>

      <Drawer
        title="Update DemoRequest"
        open={isFormUpdateDemoRequestOpen}
        destroyOnClose
        width={500}
        onClose={toggleFormUpdateDemoRequestOpen}
      >
        <FormDemoRequest
          formData={selectedDemoRequest}
          onSubmit={handleFormUpdateDemoRequestSubmit}
        />
      </Drawer>
    </>
  );
}

export default DemoRequests;
