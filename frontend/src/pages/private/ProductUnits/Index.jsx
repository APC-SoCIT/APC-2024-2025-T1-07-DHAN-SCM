import { useEffect, useState } from "react";
import { Spin, Row, Col, Button, Drawer, Table, Modal, Dropdown } from "antd";
import { MoreOutlined } from "@ant-design/icons";

import ErrorContent from "../../../components/common/ErrorContent";
import FormProductUnit from "./components/FormProductUnit";

import http from "../../../services/httpService";

import { getColumnSearchProps } from "../../../helpers/TableFilterProps";

function ProductUnits() {
  const [productUnits, setProductUnits] = useState([]);
  const [selectedProductUnit, setSelectedProductUnit] = useState(null);

  const [isFormCreateProductUnitOpen, setIsFormCreateProductUnitOpen] =
    useState(false);
  const [isFormUpdateProductUnitOpen, setIsFormUpdateProductUnitOpen] =
    useState(false);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const getProductUnits = async () => {
    const { data } = await http.get("/api/productUnits");
    setProductUnits(data);
  };

  useEffect(() => {
    const fetchProductUnits = async () => {
      try {
        setIsContentLoading(true);
        await getProductUnits();
      } catch (error) {
        setErrorMsg(error.message || "Something went wrong!");
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchProductUnits();
  }, []);

  if (errorMsg) {
    return <ErrorContent errorMessage={errorMsg} />;
  }

  const toggleFormCreateProductUnitOpen = () => {
    setIsFormCreateProductUnitOpen(!isFormCreateProductUnitOpen);
  };

  const toggleFormUpdateProductUnitOpen = () => {
    setIsFormUpdateProductUnitOpen(!isFormUpdateProductUnitOpen);
  };

  const handleFormCreateProductUnitSubmit = async (formData) => {
    try {
      toggleFormCreateProductUnitOpen();
      setIsContentLoading(true);
      await http.post("/api/productUnits", { ...formData, status_id: 1 });
      await getProductUnits();
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong!");
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleFormUpdateProductUnitSubmit = async (formData) => {
    try {
      toggleFormUpdateProductUnitOpen();
      setIsContentLoading(true);
      await http.put(`/api/productUnits/${selectedProductUnit.id}`, formData);
      await getProductUnits();
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong!");
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleDeleteProductUnit = async (productUnits) => {
    try {
      setIsContentLoading(true);
      await http.delete(`/api/productUnits/${productUnits.id}`);
      await getProductUnits();
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
      title: "Abbreviation",
      dataIndex: "abbreviation",
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
            setSelectedProductUnit(record);
            toggleFormUpdateProductUnitOpen();
          } else if (key === "Delete") {
            Modal.confirm({
              title: "Delete Product Unit",
              content: "Are you sure you want to delete this product unit?",
              onOk: async () => {
                handleDeleteProductUnit(record);
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
            <Button type="primary" onClick={toggleFormCreateProductUnitOpen}>
              Create Product Unit
            </Button>
          </Col>
        </Row>
        <Table columns={tableColumns} dataSource={productUnits} rowKey="id" />
      </Spin>
      <Drawer
        title="Create Product Unit"
        open={isFormCreateProductUnitOpen}
        destroyOnClose
        width={500}
        onClose={toggleFormCreateProductUnitOpen}
      >
        <FormProductUnit onSubmit={handleFormCreateProductUnitSubmit} />
      </Drawer>
      <Drawer
        title="Update Product Unit"
        open={isFormUpdateProductUnitOpen}
        destroyOnClose
        width={500}
        onClose={toggleFormUpdateProductUnitOpen}
      >
        <FormProductUnit
          formData={selectedProductUnit}
          onSubmit={handleFormUpdateProductUnitSubmit}
        />
      </Drawer>
    </>
  );
}

export default ProductUnits;
