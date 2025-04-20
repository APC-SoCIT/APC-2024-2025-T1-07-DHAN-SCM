import { useEffect, useState } from "react";
import { Spin, Row, Col, Button, Drawer, Table, Modal, Dropdown } from "antd";
import { MoreOutlined } from "@ant-design/icons";

import ErrorContent from "../../../components/common/ErrorContent";
import FormLocation from "./components/FormLocation";

import http from "../../../services/httpService";

import { getColumnSearchProps } from "../../../helpers/TableFilterProps";

function Locations() {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [isFormCreateLocationOpen, setIsFormCreateLocationOpen] =
    useState(false);
  const [isFormUpdateLocationOpen, setIsFormUpdateLocationOpen] =
    useState(false);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const getLocations = async () => {
    const { data } = await http.get("/api/locations");
    setLocations(data);
  };

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsContentLoading(true);
        await getLocations();
      } catch (error) {
        setErrorMsg(error.message || "Something went wrong!");
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchLocations();
  }, []);

  if (errorMsg) {
    return <ErrorContent errorMessage={errorMsg} />;
  }

  const toggleFormCreateLocationOpen = () => {
    setIsFormCreateLocationOpen(!isFormCreateLocationOpen);
  };

  const toggleFormUpdateLocationOpen = () => {
    setIsFormUpdateLocationOpen(!isFormUpdateLocationOpen);
  };

  const handleFormCreateLocationSubmit = async (formData) => {
    try {
      toggleFormCreateLocationOpen();
      setIsContentLoading(true);
      await http.post("/api/locations", { ...formData, status_id: 1 });
      await getLocations();
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong!");
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleFormUpdateLocationSubmit = async (formData) => {
    try {
      toggleFormUpdateLocationOpen();
      setIsContentLoading(true);
      await http.put(`/api/locations/${selectedLocation.id}`, formData);
      await getLocations();
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong!");
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleDeleteLocation = async (location) => {
    try {
      setIsContentLoading(true);
      await http.delete(`/api/locations/${location.id}`);
      await getLocations();
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
            setSelectedLocation(record);
            toggleFormUpdateLocationOpen();
          } else if (key === "Delete") {
            Modal.confirm({
              title: "Delete Location",
              content: "Are you sure you want to delete this location?",
              onOk: async () => {
                handleDeleteLocation(record);
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
            <Button type="primary" onClick={toggleFormCreateLocationOpen}>
              Create Location
            </Button>
          </Col>
        </Row>
        <Table columns={tableColumns} dataSource={locations} rowKey="id" />
      </Spin>

      <Drawer
        title="Create Location"
        open={isFormCreateLocationOpen}
        destroyOnClose
        width={500}
        onClose={toggleFormCreateLocationOpen}
      >
        <FormLocation onSubmit={handleFormCreateLocationSubmit} />
      </Drawer>

      <Drawer
        title="Update Location"
        open={isFormUpdateLocationOpen}
        destroyOnClose
        width={500}
        onClose={toggleFormUpdateLocationOpen}
      >
        <FormLocation
          formData={selectedLocation}
          onSubmit={handleFormUpdateLocationSubmit}
        />
      </Drawer>
    </>
  );
}

export default Locations;
