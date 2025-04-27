import { useEffect, useState } from "react";
import { Spin, Row, Col, Button, Drawer, Table, Modal, Dropdown } from "antd";
import { MoreOutlined } from "@ant-design/icons";

import ErrorContent from "../../../components/common/ErrorContent";
import FormProductGroup from "./components/FormProductGroup";

import http from "../../../services/httpService";

import { getColumnSearchProps } from "../../../helpers/TableFilterProps";

function ProductGroups() {
  const [productGroups, setProductGroups] = useState([]);
  const [selectedProductGroup, setSelectedProductGroup] = useState(null);

  const [isFormCreateProductGroupOpen, setIsFormCreateProductGroupOpen] =
    useState(false);
  const [isFormUpdateProductGroupOpen, setIsFormUpdateProductGroupOpen] =
    useState(false);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [error, setError] = useState(null);

  const getProductGroups = async () => {
    const { data } = await http.get("/api/productGroups");
    setProductGroups(data);
  };

  useEffect(() => {
    const fetchProductGroups = async () => {
      try {
        setIsContentLoading(true);
        await getProductGroups();
      } catch (error) {
        setError(error);
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchProductGroups();
  }, []);

  if (error) {
    return <ErrorContent />;
  }

  const toggleFormCreateProductGroupOpen = () => {
    setIsFormCreateProductGroupOpen(!isFormCreateProductGroupOpen);
  };

  const toggleFormUpdateProductGroupOpen = () => {
    setIsFormUpdateProductGroupOpen(!isFormUpdateProductGroupOpen);
  };

  const handleFormCreateProductGroupSubmit = async (formData) => {
    try {
      toggleFormCreateProductGroupOpen();
      setIsContentLoading(true);
      await http.post("/api/productGroups", { ...formData, status_id: 1 });
      await getProductGroups();
    } catch (error) {
      setError(error);
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleFormUpdateProductGroupSubmit = async (formData) => {
    try {
      toggleFormUpdateProductGroupOpen();
      setIsContentLoading(true);
      await http.put(`/api/productGroups/${selectedProductGroup.id}`, formData);
      await getProductGroups();
    } catch (error) {
      setError(error);
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleDeleteProductGroup = async (productGroup) => {
    try {
      setIsContentLoading(true);
      await http.delete(`/api/productGroups/${productGroup.id}`);
      await getProductGroups();
    } catch (error) {
      setError(error);
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
            setSelectedProductGroup(record);
            toggleFormUpdateProductGroupOpen();
          } else if (key === "Delete") {
            Modal.confirm({
              title: "Delete Product Group",
              content: "Are you sure you want to delete this product group?",
              onOk: async () => {
                handleDeleteProductGroup(record);
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
            <Button type="primary" onClick={toggleFormCreateProductGroupOpen}>
              Create Product Group
            </Button>
          </Col>
        </Row>
        <Table columns={tableColumns} dataSource={productGroups} rowKey="id" />
      </Spin>

      <Drawer
        title="Create ProductGroup"
        open={isFormCreateProductGroupOpen}
        destroyOnClose
        width={500}
        onClose={toggleFormCreateProductGroupOpen}
      >
        <FormProductGroup onSubmit={handleFormCreateProductGroupSubmit} />
      </Drawer>

      <Drawer
        title="Update ProductGroup"
        open={isFormUpdateProductGroupOpen}
        destroyOnClose
        width={500}
        onClose={toggleFormUpdateProductGroupOpen}
      >
        <FormProductGroup
          formData={selectedProductGroup}
          onSubmit={handleFormUpdateProductGroupSubmit}
        />
      </Drawer>
    </>
  );
}

export default ProductGroups;
