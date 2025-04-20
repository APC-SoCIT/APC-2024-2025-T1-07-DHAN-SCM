import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "antd";
import { MoreOutlined } from "@ant-design/icons";

import ErrorContent from "../../../../components/common/ErrorContent";
import FormPOItem from "./components/FormPOItem";

import http from "../../../../services/httpService";
import { formatWithComma } from "../../../../helpers/numbers";
import useDataStore from "../../../../store/DataStore";

const { Title, Text } = Typography;

function CreatePurchaseOrder() {
  const [poItems, setPOItems] = useState([]);
  const [selectedPOItem, setSelectedPOItem] = useState(null);
  const [poSubtotal, setPOSubtotal] = useState(0);
  const [poTotal, setPOTotal] = useState(0);
  const [notes, setNotes] = useState("");

  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [products, setProducts] = useState([]);

  const [isFormCreatePOItemOpen, setIsFormCreatePOItemOpen] = useState(false);
  const [isFormUpdatePOItemOpen, setIsFormUpdatePOItemOpen] = useState(false);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const { productUnits } = useDataStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsContentLoading(true);
        const { data: suppliers } = await http.get("/api/suppliers");
        const { data: products } = await http.get("/api/products");

        setSuppliers(suppliers);
        setProducts(products);
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

  const toggleFormCreatePOItemOpen = () => {
    setIsFormCreatePOItemOpen(!isFormCreatePOItemOpen);
  };

  const toggleFormUpdatePOItemOpen = () => {
    setIsFormUpdatePOItemOpen(!isFormUpdatePOItemOpen);
  };

  const handleFormCreatePOItemSubmit = (formData) => {
    toggleFormCreatePOItemOpen();

    const productExist = poItems.find(
      ({ product_id }) => product_id === formData.product_id
    );

    if (productExist) {
      alert("Product already exist.");
      return;
    }

    const newPOItems = [...poItems, formData];

    const poSubtotal = newPOItems.reduce((acc, item) => {
      acc += item.amount;
      return acc;
    }, 0);

    setPOItems(newPOItems);
    setPOSubtotal(poSubtotal);
    setPOTotal(poSubtotal);
  };

  const handleFormUpdatePOItemSubmit = (formData) => {
    toggleFormUpdatePOItemOpen();

    const newPOItems = poItems.map((poItem) => {
      if (poItem.product_id === formData.product_id) {
        return formData;
      }

      return poItem;
    });

    const poSubtotal = newPOItems.reduce((acc, item) => {
      acc += item.amount;
      return acc;
    }, 0);

    setPOItems(newPOItems);
    setPOSubtotal(poSubtotal);
    setPOTotal(poSubtotal);
  };

  const handleDeletePOItem = async (poItem) => {
    const newPOItems = poItems.filter(
      ({ product_id }) => product_id !== poItem.product_id
    );

    const poSubtotal = newPOItems.reduce((acc, item) => {
      acc += item.amount;
      return acc;
    }, 0);

    setPOItems(newPOItems);
    setPOSubtotal(poSubtotal);
    setPOTotal(poSubtotal);
  };

  const handlePOSubmit = async () => {
    const pruchaseOrders = {
      supplier_id: selectedSupplier.id,
      total_items: poItems.length,
      subtotal_amount: poSubtotal,
      total_amount: poTotal,
      notes,
      status_id: 4,
      purchase_order_items: poItems,
    };

    try {
      setIsContentLoading(true);
      await http.post("/api/purchaseOrders", pruchaseOrders);
      navigate("/purchaseOrders");
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
      render: (_, record) => {
        return products.find(({ id }) => id === record.product_id).name;
      },
    },
    {
      title: "Unit",
      dataIndex: "product_unit_id",
      width: 100,
      render: (text) => productUnits[text],
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      width: 100,
      render: (text) => formatWithComma(text),
    },
    {
      title: "Price",
      dataIndex: "price",
      width: 100,
      render: (text) => formatWithComma(text),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      width: 100,
      render: (text) => formatWithComma(text),
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
            setSelectedPOItem(record);
            toggleFormUpdatePOItemOpen();
          } else if (key === "Delete") {
            handleDeletePOItem(record);
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
        <Row>
          <Col span={16}>
            <Row
              type="flex"
              justify="space-between"
              style={{ marginBottom: 16 }}
            >
              <Col>
                <Space>
                  <span>Select Supplier:</span>
                  <Select
                    style={{ width: 400 }}
                    placeholder="Select supplier"
                    options={suppliers.map((supplier) => ({
                      value: supplier.id,
                      label: supplier.name,
                    }))}
                    onChange={(supplierId) => {
                      const supplier = suppliers.find(
                        ({ id }) => id === supplierId
                      );
                      setSelectedSupplier(supplier);
                    }}
                  />
                </Space>
              </Col>
              <Col>
                <Button onClick={toggleFormCreatePOItemOpen}>Add Item</Button>
              </Col>
            </Row>
            {selectedSupplier && (
              <div style={{ marginBottom: 16 }}>
                <Title level={5} style={{ marginBottom: 0 }}>
                  {selectedSupplier.name}
                </Title>
                <div>
                  <Text type="secondary">{selectedSupplier.address}</Text>
                </div>
                <div>
                  <Text type="secondary">{selectedSupplier.email}</Text>
                </div>
                <div>
                  <Text type="secondary">{selectedSupplier.phone}</Text>
                </div>
              </div>
            )}
            <Table
              columns={tableColumns}
              dataSource={poItems}
              rowKey="product_id"
              pagination={false}
            />
            <Row type="flex" justify="space-between" style={{ marginTop: 16 }}>
              <Col>
                <Space>
                  <span>Enter Notes:</span>
                  <Input
                    style={{ width: 300 }}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </Space>
              </Col>
              <Col>
                <Descriptions
                  bordered
                  column={1}
                  items={[
                    {
                      label: "Subtotal:",
                      children: formatWithComma(poSubtotal),
                    },
                    {
                      label: "Total:",
                      children: formatWithComma(poTotal),
                    },
                  ]}
                  style={{ marginBottom: 16 }}
                />
                <Button
                  type="primary"
                  size="large"
                  disabled={!selectedSupplier || poItems.length === 0}
                  onClick={handlePOSubmit}
                >
                  Create Pruchase Order
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Spin>

      <Drawer
        title="Create Purchase Order Item"
        open={isFormCreatePOItemOpen}
        destroyOnClose
        onClose={toggleFormCreatePOItemOpen}
      >
        <FormPOItem
          supportingData={{ products }}
          onSubmit={handleFormCreatePOItemSubmit}
        />
      </Drawer>

      <Drawer
        title="Update Purchase Order Item"
        open={isFormUpdatePOItemOpen}
        destroyOnClose
        onClose={toggleFormUpdatePOItemOpen}
      >
        <FormPOItem
          formData={selectedPOItem}
          supportingData={{ products }}
          onSubmit={handleFormUpdatePOItemSubmit}
        />
      </Drawer>
    </>
  );
}

export default CreatePurchaseOrder;
