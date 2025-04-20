import { useEffect, useState } from "react";
import { Spin, Row, Col, Button, Drawer, Table, Modal, Dropdown } from "antd";
import { MoreOutlined } from "@ant-design/icons";

import ErrorContent from "../../../components/common/ErrorContent";
import FormWarehouse from "./components/FormWarehouse";

import http from "../../../services/httpService";

import { getColumnSearchProps } from "../../../helpers/TableFilterProps";

function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);

  const [isFormCreateWarehouseOpen, setIsFormCreateWarehouseOpen] =
    useState(false);
  const [isFormUpdateWarehouseOpen, setIsFormUpdateWarehouseOpen] =
    useState(false);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const getWarehouses = async () => {
    const { data } = await http.get("/api/warehouses");
    setWarehouses(data);
  };

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        setIsContentLoading(true);
        await getWarehouses();
      } catch (error) {
        setErrorMsg(error.message || "Something went wrong!");
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchWarehouses();
  }, []);

  if (errorMsg) {
    return <ErrorContent errorMessage={errorMsg} />;
  }

  const toggleFormCreateWarehouseOpen = () => {
    setIsFormCreateWarehouseOpen(!isFormCreateWarehouseOpen);
  };

  const toggleFormUpdateWarehouseOpen = () => {
    setIsFormUpdateWarehouseOpen(!isFormUpdateWarehouseOpen);
  };

  const handleFormCreateWarehouseSubmit = async (formData) => {
    try {
      toggleFormCreateWarehouseOpen();
      setIsContentLoading(true);
      await http.post("/api/warehouses", { ...formData, status_id: 1 });
      await getWarehouses();
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong!");
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleFormUpdateWarehouseSubmit = async (formData) => {
    try {
      toggleFormUpdateWarehouseOpen();
      setIsContentLoading(true);
      await http.put(`/api/warehouses/${selectedWarehouse.id}`, formData);
      await getWarehouses();
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong!");
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleDeleteWarehouse = async (warehouse) => {
    try {
      setIsContentLoading(true);
      await http.delete(`/api/warehouses/${warehouse.id}`);
      await getWarehouses();
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
      title: "Address",
      dataIndex: "address",
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
            setSelectedWarehouse(record);
            toggleFormUpdateWarehouseOpen();
          } else if (key === "Delete") {
            Modal.confirm({
              title: "Delete Warehouse",
              content: "Are you sure you want to delete this warehouse?",
              onOk: async () => {
                handleDeleteWarehouse(record);
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
            <Button type="primary" onClick={toggleFormCreateWarehouseOpen}>
              Create Warehouse
            </Button>
          </Col>
        </Row>
        <Table columns={tableColumns} dataSource={warehouses} rowKey="id" />
      </Spin>
      <Drawer
        title="Create Warehouse"
        open={isFormCreateWarehouseOpen}
        destroyOnClose
        width={500}
        onClose={toggleFormCreateWarehouseOpen}
      >
        <FormWarehouse onSubmit={handleFormCreateWarehouseSubmit} />
      </Drawer>
      <Drawer
        title="Update Warehouse"
        open={isFormUpdateWarehouseOpen}
        destroyOnClose
        width={500}
        onClose={toggleFormUpdateWarehouseOpen}
      >
        <FormWarehouse
          formData={selectedWarehouse}
          onSubmit={handleFormUpdateWarehouseSubmit}
        />
      </Drawer>
    </>
  );
}

export default Warehouses;
