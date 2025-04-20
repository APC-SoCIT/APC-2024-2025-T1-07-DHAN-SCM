import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Spin,
  Row,
  Col,
  Button,
  Table,
  Select,
  Typography,
  Descriptions,
  InputNumber,
  Card,
  Tooltip,
} from "antd";
import { DoubleRightOutlined, CloseOutlined } from "@ant-design/icons";

import ErrorContent from "../../../components/common/ErrorContent";

import http from "../../../services/httpService";
import { formatWithComma } from "../../../helpers/numbers";
import { getColumnSearchProps } from "../../../helpers/TableFilterProps";

// import useDataStore from "../../../../store/DataStore";

const { Text } = Typography;

function PurchaseOrdersCreate() {
  const [poItems, setPOItems] = useState([]);

  const [poSubtotal, setPOSubtotal] = useState(0);
  const [poTotal, setPOTotal] = useState(0);

  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [products, setProducts] = useState([]);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const navigate = useNavigate();

  // const { productUnits } = useDataStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsContentLoading(true);
        const { data: suppliers } = await http.get("/api/suppliers");
        const { data: products } = await http.get("/api/getAllProducts");

        setSuppliers(suppliers);
        setProducts(products);
      } catch (error) {
        setErrorMsg(error.message);
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchData();
  }, []);

  if (errorMsg) {
    return <ErrorContent errorMessage={errorMsg} />;
  }

  const handleAddPOItem = (selectedProduct) => {
    const { id, name, model, product_unit, supplier_price } = selectedProduct;

    const newPOItems = [
      ...poItems,
      {
        product_id: id,
        name,
        model,
        unit: product_unit.name,
        quantity: 1,
        unit_price: parseFloat(supplier_price),
        amount: parseFloat(supplier_price),
      },
    ];

    const poSubtotal = newPOItems.reduce((acc, item) => {
      acc += item.amount;
      return acc;
    }, 0);

    setPOItems(newPOItems);
    setPOSubtotal(poSubtotal);
    setPOTotal(poSubtotal);
  };

  const handleUpdatePOItem = (poItemProductId, quantity) => {
    const newPOItems = poItems.map((poItem) => {
      if (poItem.product_id === poItemProductId) {
        return {
          ...poItem,
          quantity,
          amount: quantity * poItem.unit_price,
        };
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
      total_amount: poTotal,
      // subtotal_amount: poSubtotal,
      items: poItems,
    };

    try {
      setIsContentLoading(true);
      await http.post("/api/createPurchaseOrder", pruchaseOrders);
      navigate("/purchaseOrders");
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setIsContentLoading(false);
    }
  };

  const table1Columns = [
    {
      title: "Supplier Products",
      ...getColumnSearchProps("name"),
      render: (_, record) => {
        return (
          <>
            <div>{record.name}</div>
            <div>
              <Text type="secondary">{record.model}</Text>
            </div>
          </>
        );
      },
    },
    {
      title: "",
      render: (_, record) => {
        return (
          <Tooltip title="Add to PO item">
            <Button
              icon={<DoubleRightOutlined />}
              type="primary"
              onClick={() => handleAddPOItem(record)}
              disabled={poItems.find(
                ({ product_id }) => product_id === record.id
              )}
            />
          </Tooltip>
        );
      },
      width: 50,
    },
  ];

  const filteredProducts = products.filter(
    ({ supplier_id }) => supplier_id === selectedSupplier?.id
  );

  const table2Columns = [
    {
      title: "Name",
      dataIndex: "name",
      render: (_, record) => {
        return (
          <>
            <div>{record.name}</div>
            <div>
              <Text type="secondary">{record.model}</Text>
            </div>
          </>
        );
      },
    },
    {
      title: "Unit",
      dataIndex: "unit",
      width: 100,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      width: 100,
      render: (text, record) => {
        return (
          <InputNumber
            value={text}
            formatter={(value) =>
              `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
            }
            parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            min={0}
            onChange={(value) => handleUpdatePOItem(record.product_id, value)}
          />
        );
      },
    },
    {
      title: "Price",
      dataIndex: "unit_price",
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
        return (
          <Tooltip title="Remove">
            <Button
              icon={<CloseOutlined />}
              size="small"
              onClick={() => handleDeletePOItem(record)}
            />
          </Tooltip>
        );
      },
    },
  ];

  return (
    <>
      <Spin spinning={isContentLoading} tip="loading ...">
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Card>
              <div>Supplier:</div>
              <Select
                style={{ width: "100%", marginBottom: 16 }}
                placeholder="Select supplier"
                options={suppliers.map((supplier) => ({
                  value: supplier.id,
                  label: supplier.name,
                }))}
                onChange={(supplierId) => {
                  const supplier = suppliers.find(
                    ({ id }) => id === supplierId
                  );
                  setPOItems([]);
                  setPOSubtotal(0);
                  setPOTotal(0);
                  setSelectedSupplier(supplier);
                }}
              />
              <Table
                columns={table1Columns}
                dataSource={filteredProducts}
                rowKey="id"
              />
            </Card>
          </Col>
          <Col span={16}>
            <Card>
              <Table
                columns={table2Columns}
                dataSource={poItems}
                rowKey="product_id"
                pagination={false}
              />
              <Row
                type="flex"
                justify="space-between"
                style={{ marginTop: 16 }}
              >
                <Col></Col>
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
            </Card>
          </Col>
        </Row>
      </Spin>
    </>
  );
}

export default PurchaseOrdersCreate;
