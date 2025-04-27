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
  Typography,
  Image,
} from "antd";
import { MoreOutlined } from "@ant-design/icons";

import ErrorContent from "../../../../../components/common/ErrorContent";
import FormProduct from "./components/FormProduct";

import http from "../../../../../services/httpService";

import { getColumnSearchProps } from "../../../../../helpers/TableFilterProps";

const { Text } = Typography;

function Products() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [productCategories, setProductCategories] = useState([]);
  const [productGroups, setProductGroups] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState();

  const [isFormCreateProductOpen, setIsFormCreateProductOpen] = useState(false);
  const [isFormUpdateProductOpen, setIsFormUpdateProductOpen] = useState(false);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [error, setError] = useState(null);

  const getProducts = async () => {
    const { data } = await http.get("/api/products");
    const products = data.map((product) => {
      let remarks = null;
      if (product.available_qty <= 0) {
        remarks = "No Stock";
      } else if (product.minimum_qty > product.available_qty) {
        remarks = "Low Stock";
      }

      return {
        ...product,
        remarks: remarks,
      };
    });
    setProducts(products);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsContentLoading(true);
        const { data: productCategories } = await http.get(
          "/api/productCategories"
        );
        const { data: productGroups } = await http.get("/api/productGroups");
        const { data: purchaseOrders } = await http.get("/api/purchaseOrders");

        await getProducts();
        setProductCategories(productCategories);
        setProductGroups(productGroups);
        setPurchaseOrders(purchaseOrders);
      } catch (error) {
        setError(error);
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (error) {
    return <ErrorContent />;
  }

  const toggleFormCreateProductOpen = () => {
    setIsFormCreateProductOpen(!isFormCreateProductOpen);
  };

  const toggleFormUpdateProductOpen = () => {
    setIsFormUpdateProductOpen(!isFormUpdateProductOpen);
  };

  const handleFormCreateProductSubmit = async (formData) => {
    try {
      toggleFormCreateProductOpen();
      setIsContentLoading(true);
      await http.post("/api/products", { ...formData, status_id: 1 });
      await getProducts();
    } catch (error) {
      setError(error);
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleFormUpdateProductSubmit = async (formData) => {
    try {
      toggleFormUpdateProductOpen();
      setIsContentLoading(true);
      await http.put(`/api/products/${selectedProduct.id}`, formData);
      await getProducts();
    } catch (error) {
      setError(error);
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    try {
      setIsContentLoading(true);
      await http.delete(`/api/products/${product.id}`);
      await getProducts();
    } catch (error) {
      setError(error);
    } finally {
      setIsContentLoading(false);
    }
  };

  const tableColumns = [
    {
      title: "",
      dataIndex: "img_url",
      render: (text) => {
        return <Image width={50} src={text} />;
      },
      width: 100,
    },
    {
      title: "Name",
      dataIndex: "name",
      ...getColumnSearchProps("name"),
      render: (_, record) => {
        return (
          <>
            <div>{record.name}</div>
            <div>
              {record.description ? (
                <Text type="secondary">{record.description}</Text>
              ) : (
                ""
              )}
            </div>
          </>
        );
      },
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      width: 150,
      filters: [
        {
          text: "No Stock",
          value: "No Stock",
        },
        {
          text: "Low Stock",
          value: "Low Stock",
        },
      ],
      onFilter: (value, record) => record.remarks === value,
      render: (text) => (text ? <Tag color="#f50">{text}</Tag> : "-"),
    },
    {
      title: "Available Qty.",
      dataIndex: "available_qty",
      width: 150,
    },
    {
      title: "Minimum Qty.",
      dataIndex: "minimum_qty",
      width: 150,
    },
    {
      title: "Category",
      dataIndex: "product_category_id",
      filters: [
        {
          text: "Consumable",
          value: 1,
        },
        {
          text: "Equipment",
          value: 2,
        },
      ],
      onFilter: (value, record) => record.product_category_id === value,
      render: (text) => (text == 1 ? "Consumable" : "Equipment"),
      width: 100,
    },
    {
      title: "Price",
      dataIndex: "selling_price",
      width: 100,
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
            setSelectedProduct(record);
            toggleFormUpdateProductOpen();
          } else if (key === "Delete") {
            Modal.confirm({
              title: "Delete Product",
              content: "Are you sure you want to delete this product?",
              onOk: async () => {
                handleDeleteProduct(record);
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
            <Button type="primary" onClick={toggleFormCreateProductOpen}>
              Create Product
            </Button>
          </Col>
        </Row>
        <Table columns={tableColumns} dataSource={products} rowKey="id" />
      </Spin>

      <Drawer
        title="Create Product"
        open={isFormCreateProductOpen}
        destroyOnClose
        width={600}
        onClose={toggleFormCreateProductOpen}
      >
        <FormProduct
          supportingData={{
            productCategories,
            productGroups,
            products,
            purchaseOrders,
          }}
          onSubmit={handleFormCreateProductSubmit}
        />
      </Drawer>

      <Drawer
        title="Update Product"
        open={isFormUpdateProductOpen}
        destroyOnClose
        width={600}
        onClose={toggleFormUpdateProductOpen}
      >
        <FormProduct
          formData={selectedProduct}
          supportingData={{
            productCategories,
            productGroups,
            products,
            purchaseOrders,
          }}
          onSubmit={handleFormUpdateProductSubmit}
        />
      </Drawer>
    </>
  );
}

export default Products;
