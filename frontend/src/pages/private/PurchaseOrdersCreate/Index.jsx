import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  Image,
  Modal,
} from "antd";
import { DoubleRightOutlined, CloseOutlined } from "@ant-design/icons";

import ErrorContent from "../../../components/common/ErrorContent";

import http from "../../../services/httpService";
import { formatWithComma } from "../../../helpers/numbers";
import { getColumnSearchPropsProduct } from "../../../helpers/TableFilterProps";

// import useDataStore from "../../../../store/DataStore";

const { Text } = Typography;

function PurchaseOrdersCreate() {
  const [poItems, setPOItems] = useState([]);
  const [poSimilarItems, setPOSimilarItems] = useState([]);

  const [poSubtotal, setPOSubtotal] = useState(0);
  const [poTotal, setPOTotal] = useState(0);

  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [products, setProducts] = useState([]);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // const { productUnits } = useDataStore();

  const handleAddPOItem = (selectedProduct, emptyPo) => {
    const { id, name, model, product_unit, supplier_price, tags } =
      selectedProduct;

    const validTags = tags.filter((tag) => /\[.*\]/.test(tag.name));

    let newPOItems = [];
    if (emptyPo) {
      newPOItems = [
        {
          product_id: id,
          name,
          model,
          unit: product_unit.name,
          quantity: 1,
          unit_price: parseFloat(supplier_price),
          amount: parseFloat(supplier_price),
          tags: validTags,
        },
      ];
    } else {
      newPOItems = [
        ...poItems,
        {
          product_id: id,
          name,
          model,
          unit: product_unit.name,
          quantity: 1,
          unit_price: parseFloat(supplier_price),
          amount: parseFloat(supplier_price),
          tags: validTags,
        },
      ];
    }

    let tagIds = [];
    newPOItems.forEach((item) => {
      tagIds = [...tagIds, ...item.tags.map((tag) => tag.id)];
    });

    tagIds = [...new Set(tagIds)];

    const poSimilarItems = products
      .filter((product) => product.tags.some((tag) => tagIds.includes(tag.id)))
      .filter(
        (product) => !newPOItems.some((item) => item.product_id === product.id)
      );

    const poSubtotal = newPOItems.reduce((acc, item) => {
      acc += item.amount;
      return acc;
    }, 0);

    setPOItems(newPOItems);
    setPOSimilarItems(poSimilarItems);
    setPOSubtotal(poSubtotal);
    setPOTotal(poSubtotal);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsContentLoading(true);
        const { data: suppliers } = await http.get("/api/suppliers");
        const { data: products } = await http.get("/api/getAllProducts");

        //check if with default data
        const supplierId = searchParams.get("supplierId");
        const productId = searchParams.get("productId");

        if (supplierId && productId) {
          const supplier = suppliers.find(({ id }) => id == supplierId);

          if (supplier) {
            const filteredProducts = products.filter(
              ({ supplier_id }) => supplier_id == supplier.id
            );

            const product = filteredProducts.find(({ id }) => id == productId);

            if (product) {
              setSelectedSupplier(supplier);
              handleAddPOItem(product);
            }
          }
        }

        setSuppliers(suppliers);
        setProducts(products);
      } catch (error) {
        setErrorMsg(error.message);
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  if (errorMsg) {
    return <ErrorContent errorMessage={errorMsg} />;
  }

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

    let tagIds = [];
    newPOItems.forEach((item) => {
      tagIds = [...tagIds, ...item.tags.map((tag) => tag.id)];
    });

    tagIds = [...new Set(tagIds)];

    const poSimilarItems = products
      .filter((product) => product.tags.some((tag) => tagIds.includes(tag.id)))
      .filter(
        (product) => !newPOItems.some((item) => item.product_id === product.id)
      );

    const poSubtotal = newPOItems.reduce((acc, item) => {
      acc += item.amount;
      return acc;
    }, 0);

    setPOItems(newPOItems);
    setPOSimilarItems(poSimilarItems);
    setPOSubtotal(poSubtotal);
    setPOTotal(poSubtotal);
  };

  const handleAddPOSimilarItem = (selectedProduct) => {
    if (selectedSupplier.id === selectedProduct.supplier_id) {
      handleAddPOItem(selectedProduct);
    } else {
      Modal.confirm({
        title: "Change Supplier",
        content:
          "This will change the supplier. Are you sure you want to swap the product?",
        onOk: async () => {
          setPOItems([]);
          setPOSimilarItems([]);
          setPOSubtotal(0);
          setPOTotal(0);
          setSelectedSupplier(selectedProduct.supplier);
          handleAddPOItem(selectedProduct, true);
        },
      });
    }
  };

  const handlePOSubmit = async () => {
    const pruchaseOrders = {
      supplier_id: selectedSupplier.id,
      total_items: poItems.length,
      total_amount: poTotal,
      // subtotal_amount: poSubtotal,
      items: poItems.map((poItems) => {
        delete poItems.tags;
        return poItems;
      }),
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
      title: "",
      dataIndex: "image_url",
      render: (text) => {
        return (
          <Image
            height={50}
            width={50}
            src={text || "https://placehold.co/50x50"}
          />
        );
      },
      width: 100,
    },
    {
      title: "Supplier Products",
      ...getColumnSearchPropsProduct("name", "Product Name or SKU"),
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
      title: "",
      dataIndex: "image_url",
      render: (text) => {
        return (
          <Image
            height={50}
            width={50}
            src={text || "https://placehold.co/50x50"}
          />
        );
      },
      width: 100,
    },
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

  const table3Columns = [
    {
      title: "",
      dataIndex: "image_url",
      render: (text) => {
        return (
          <Image
            height={50}
            width={50}
            src={text || "https://placehold.co/50x50"}
          />
        );
      },
      width: 100,
    },
    {
      title: "Products",
      ...getColumnSearchPropsProduct("name", "Product Name or SKU"),
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
    { title: "Supplier", render: (_, record) => record.supplier.name },
    {
      title: "Supplier Price",
      dataIndex: "supplier_price",
      render: (text) => {
        return (
          <>
            &#8369;
            {formatWithComma(text)}
          </>
        );
      },
      width: 150,
    },
    {
      title: "",
      render: (_, record) => {
        return (
          <Tooltip title="Add to PO item">
            <Button
              icon={<DoubleRightOutlined />}
              type="primary"
              onClick={() => handleAddPOSimilarItem(record)}
              // disabled={poItems.find(
              //   ({ product_id }) => product_id === record.id
              // )}
            />
          </Tooltip>
        );
      },
      width: 50,
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
                value={selectedSupplier?.id}
                onChange={(supplierId) => {
                  const supplier = suppliers.find(
                    ({ id }) => id === supplierId
                  );
                  setPOItems([]);
                  setPOSimilarItems([]);
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
            {poSimilarItems.length !== 0 && (
              <Card title="Similar Products" style={{ marginTop: 16 }}>
                <Table
                  columns={table3Columns}
                  dataSource={poSimilarItems}
                  rowKey="id"
                />
              </Card>
            )}
          </Col>
        </Row>
      </Spin>
    </>
  );
}

export default PurchaseOrdersCreate;
