import { useEffect, useState } from "react";
import { Spin, Row, Col, Button, Drawer, Table, Modal, Dropdown } from "antd";
import { MoreOutlined } from "@ant-design/icons";

import ErrorContent from "../../../components/common/ErrorContent";
import FormSupplier from "./components/FormSupplier";

import http from "../../../services/httpService";

import { getColumnSearchProps } from "../../../helpers/TableFilterProps";

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [isFormCreateSupplierOpen, setIsFormCreateSupplierOpen] =
    useState(false);
  const [isFormUpdateSupplierOpen, setIsFormUpdateSupplierOpen] =
    useState(false);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const getSuppliers = async () => {
    const { data } = await http.get("/api/suppliers");
    setSuppliers(data);
  };

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setIsContentLoading(true);
        await getSuppliers();
      } catch (error) {
        setErrorMsg(error.message || "Something went wrong!");
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  if (errorMsg) {
    return <ErrorContent errorMessage={errorMsg} />;
  }

  const toggleFormCreateSupplierOpen = () => {
    setIsFormCreateSupplierOpen(!isFormCreateSupplierOpen);
  };

  const toggleFormUpdateSupplierOpen = () => {
    setIsFormUpdateSupplierOpen(!isFormUpdateSupplierOpen);
  };

  const handleFormCreateSupplierSubmit = async (formData) => {
    try {
      toggleFormCreateSupplierOpen();
      setIsContentLoading(true);
      await http.post("/api/suppliers", { ...formData, status_id: 1 });
      await getSuppliers();
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong!");
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleFormUpdateSupplierSubmit = async (formData) => {
    try {
      toggleFormUpdateSupplierOpen();
      setIsContentLoading(true);
      await http.put(`/api/suppliers/${selectedSupplier.id}`, formData);
      await getSuppliers();
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong!");
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleDeleteSupplier = async (supplier) => {
    try {
      setIsContentLoading(true);
      await http.delete(`/api/suppliers/${supplier.id}`);
      await getSuppliers();
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
      title: "Contact Info",
      dataIndex: "contact_info",
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
            setSelectedSupplier(record);
            toggleFormUpdateSupplierOpen();
          } else if (key === "Delete") {
            Modal.confirm({
              title: "Delete Supplier",
              content: "Are you sure you want to delete this supplier?",
              onOk: async () => {
                handleDeleteSupplier(record);
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
            <Button type="primary" onClick={toggleFormCreateSupplierOpen}>
              Create Supplier
            </Button>
          </Col>
        </Row>
        <Table columns={tableColumns} dataSource={suppliers} rowKey="id" />
      </Spin>

      <Drawer
        title="Create Supplier"
        open={isFormCreateSupplierOpen}
        destroyOnClose
        width={500}
        onClose={toggleFormCreateSupplierOpen}
      >
        <FormSupplier onSubmit={handleFormCreateSupplierSubmit} />
      </Drawer>

      <Drawer
        title="Update Supplier"
        open={isFormUpdateSupplierOpen}
        destroyOnClose
        width={500}
        onClose={toggleFormUpdateSupplierOpen}
      >
        <FormSupplier
          formData={selectedSupplier}
          onSubmit={handleFormUpdateSupplierSubmit}
        />
      </Drawer>
    </>
  );
}

export default Suppliers;
