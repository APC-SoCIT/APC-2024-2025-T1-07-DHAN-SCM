import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Spin,
  Row,
  Col,
  Button,
  Drawer,
  Table,
  Dropdown,
  Tag,
  Typography,
  Image,
  Space,
  Popover,
  Card,
  Segmented,
  Modal,
} from "antd";
import {
  MoreOutlined,
  ArrowDownOutlined,
  EnvironmentOutlined,
  WarningOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import ErrorContent from "../../../components/common/ErrorContent";
import FormProduct from "./components/FormProduct";

import http from "../../../services/httpService";
import { getColumnSearchProps } from "../../../helpers/TableFilterProps";
import { formatWithComma } from "../../../helpers/numbers";

const { Text } = Typography;

function Products() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [productUnits, setProductUnits] = useState([]);
  const [tags, setTags] = useState([]);
  const [locations, setLocations] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductType, setSelectedProductType] = useState("Consumables");

  const [isFormCreateProductOpen, setIsFormCreateProductOpen] = useState(false);
  const [isFormUpdateProductOpen, setIsFormUpdateProductOpen] = useState(false);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const getProducts = async () => {
    const { data } = await http.get("/api/getAllProducts");
    console.log(data);
    setProducts(data);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsContentLoading(true);

        const { data: suppliers } = await http.get("/api/suppliers");
        const { data: productUnits } = await http.get("/api/productUnits");
        const { data: tags } = await http.get("/api/tags");
        const { data: locations } = await http.get("/api/locations");
        const { data: warehouses } = await http.get("/api/warehouses");
        await getProducts();

        setSuppliers(suppliers);
        setProductUnits(productUnits);
        setTags(tags);
        setLocations(locations);
        setWarehouses(warehouses);
      } catch (error) {
        setErrorMsg(error.message || "Something went wrong!");
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (errorMsg) {
    return <ErrorContent errorMessage={errorMsg} />;
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
      await http.post("/api/products", formData);
      await getProducts();
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong!");
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleFormUpdateProductSubmit = async (formData) => {
    try {
      toggleFormUpdateProductOpen();
      setIsContentLoading(true);
      formData.append("_method", "PUT");
      await http.post(`/api/products/${selectedProduct.id}`, formData);
      await getProducts();
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong!");
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
      setErrorMsg(error.message || "Something went wrong!");
    } finally {
      setIsContentLoading(false);
    }
  };

  console.log({ tags });

  const tableColumns = [
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
      ...getColumnSearchProps("name"),
      render: (_, record) => {
        return (
          <Link
            to={`/products/${record.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div>
              {record.name} &mdash; {record.model}{" "}
            </div>
            <div>
              <Text type="secondary">
                <IdcardOutlined /> {record.supplier.name}
              </Text>
            </div>
            <div>
              <Text type="secondary">
                <EnvironmentOutlined /> {record?.warehouse?.name} -{" "}
                {record?.location?.name}
              </Text>
            </div>
          </Link>
        );
      },
    },
    {
      title: "Tags",
      render: (_, record) => {
        return record.tags.length !== 0 ? (
          <Space>
            {record.tags.map((tag) => (
              <Tag key={tag.id}>{tag.name}</Tag>
            ))}
          </Space>
        ) : (
          "-"
        );
      },
      filters: tags.map((tag) => ({
        text: tag.name,
        value: tag.name,
      })),
      onFilter: (value, record) =>
        record.tags
          .map((tag) => tag.name)
          .join(",")
          .includes(value),
      filterSearch: true,
      width: 300,
    },
    {
      title: "Available Qty.",
      dataIndex: "available_quantity",
      width: 150,
      render: (text, record) => {
        const { quantity_level, minimum_quantity } = record;
        if (
          quantity_level === "Below Minimum" ||
          quantity_level === "No Stock"
        ) {
          return (
            <Popover
              content={<>Minimum Quantity: {minimum_quantity}</>}
              title={quantity_level}
            >
              <span style={{ color: "#f50" }}>
                {quantity_level === "Below Minimum" ? (
                  <strong>
                    <ArrowDownOutlined />
                  </strong>
                ) : (
                  <strong>
                    <WarningOutlined />
                  </strong>
                )}
              </span>{" "}
              {text}
            </Popover>
          );
        }
        return <span>{text}</span>;
      },
      filters: [
        {
          text: "No Stock",
          value: "No Stock",
        },
        {
          text: "Below Minimum",
          value: "Below Minimum",
        },
        {
          text: "Above Minimum",
          value: "Above Minimum",
        },
      ],
      onFilter: (value, record) => record.quantity_level === value,
    },
    {
      title: "Selling Price",
      dataIndex: "default_selling_price",
      render: (text, record) => (
        <Popover
          content={
            <>
              <div>
                Supplier Price: &#8369;{formatWithComma(record.supplier_price)}
              </div>
              <div>Profit Margin: {record.profit_margin}</div>
            </>
          }
          title="Selling Price"
        >
          &#8369;{formatWithComma(text)}
        </Popover>
      ),
      width: 150,
    },
    {
      title: "Action",
      width: 50,
      render: (_, record) => {
        const menuItems = [
          { key: "View", label: "View" },
          { key: "Update", label: "Update" },
          {
            type: "divider",
          },
          { key: "Delete", label: "Delete", danger: true },
        ];

        const handleMenuClick = ({ key, domEvent }) => {
          domEvent.stopPropagation();
          if (key === "View") {
            window.open(
              `/products/${record.id}`,
              "_blank",
              "noopener,noreferrer"
            );
          } else if (key === "Update") {
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

  const consumablesColumns = [
    {
      title: "Viable",
      render: (_, record) => {
        const { incoming_stocks, available_quantity } = record;

        if (available_quantity === 0) {
          return "-";
        }

        const validItems = incoming_stocks.filter(
          (item) => item.expiration_date
        );

        if (validItems.length === 0) {
          return "N/A";
        }

        const viableProducts = validItems.filter(
          (item) => item.status === "VIABLE"
        );

        const viableProductsCount = viableProducts.reduce((acc, item) => {
          acc += item.quantity;
          return acc;
        }, 0);

        return viableProductsCount;
      },
      width: 100,
    },
    {
      title: "Expiring",
      render: (_, record) => {
        const { incoming_stocks, available_quantity } = record;

        if (available_quantity === 0) {
          return "-";
        }

        const validItems = incoming_stocks.filter(
          (item) => item.expiration_date
        );

        if (validItems.length === 0) {
          return "N/A";
        }

        const expiringProducts = validItems.filter(
          (item) => item.status === "EXPIRING"
        );

        const expiringProductsCount = expiringProducts.reduce((acc, item) => {
          acc += item.quantity;
          return acc;
        }, 0);

        return expiringProductsCount;
      },
      width: 100,
    },
    {
      title: "Expired",
      render: (_, record) => {
        const { incoming_stocks, available_quantity } = record;

        if (available_quantity === 0) {
          return "-";
        }

        const validItems = incoming_stocks.filter(
          (item) => item.expiration_date
        );

        if (validItems.length === 0) {
          return "N/A";
        }

        const expiredProducts = validItems.filter(
          (item) => item.status === "EXPIRED"
        );

        const expiredProductsCount = expiredProducts.reduce((acc, item) => {
          acc += item.quantity;
          return acc;
        }, 0);

        return expiredProductsCount;
      },
      width: 100,
    },
  ];

  const machineColumns = [
    {
      title: "For Calibration",
      dataIndex: "total_for_calibration",
      width: 130,
    },
    {
      title: "For Maintenance",
      dataIndex: "total_for_maintenance",
      width: 140,
    },
    {
      title: "Demo Units",
      dataIndex: "total_demo_units",
      width: 110,
    },
  ];

  if (selectedProductType === "Consumables") {
    tableColumns.splice(4, 0, ...consumablesColumns);
  } else if (selectedProductType === "Machine") {
    tableColumns.splice(4, 0, ...machineColumns);
  }

  const filteredProducts = products.filter((product) => {
    if (selectedProductType === "Consumables") {
      return !product.is_machine;
    } else {
      return product.is_machine;
    }
  });

  return (
    <>
      <Spin spinning={isContentLoading} tip="loading ...">
        <Row type="flex" justify="space-between" style={{ marginBottom: 16 }}>
          <Col>
            <Segmented
              options={["Consumables", "Machine"]}
              onChange={(value) => {
                setSelectedProductType(value); // string
              }}
            />
          </Col>
          <Col>
            <Button type="primary" onClick={toggleFormCreateProductOpen}>
              Create Product
            </Button>
          </Col>
        </Row>
        <Table
          rowKey="id"
          //rowClassName="cursor-pointer"
          columns={tableColumns}
          dataSource={filteredProducts}
          expandable={{
            expandedRowRender: (record) => {
              const columns = [
                {
                  title: "Field",
                  dataIndex: "field",
                  key: "field",
                  width: 200,
                },
                {
                  title: "Value",
                  dataIndex: "value",
                  key: "value",
                },
              ];

              let tableData = [
                { field: "Product Name", value: record.name },
                { field: "SKU", value: record.sku },
                { field: "Model", value: record.model },
                { field: "Description", value: record.description },
                { field: "Unit", value: record.product_unit.name },
                {
                  field: "Available Quantity",
                  value: record.available_quantity,
                },
                {
                  field: "Minimum Quantity",
                  value: record.minimum_quantity,
                },
                {
                  field: "Quantity Level",
                  value: record.quantity_level,
                },
                { field: "Supplier Name", value: record.supplier.name },
                {
                  field: "Supplier Price",
                  value: `₱${record.supplier_price}`,
                },
                {
                  field: "Profit Margin (%)",
                  value: record.profit_margin,
                },
                {
                  field: "Default Selling Price",
                  value: `₱${record.default_selling_price}`,
                },
                { field: "Location", value: record.location.name },
                { field: "Warehouse", value: record.warehouse.name },

                {
                  field: "Tags",
                  value: record.tags.map((tag) => tag.name).join(", "),
                },
                { field: "Status", value: record.status.name },
                {
                  field: "Created At",
                  value: dayjs(record.created_at).format(
                    "MMMM, DD YYYY HH:mm A"
                  ),
                },
                { field: "Created By", value: record.creator.full_name },
                {
                  field: "Updated At",
                  value: dayjs(record.updated_at).format(
                    "MMMM, DD YYYY HH:mm A"
                  ),
                },
                { field: "Updated By", value: record.updater.full_name },
                // {
                //   key: '16',
                //   field: 'Incoming Stock',
                //   value: record.incoming_stocks
                //     .map(stock => `Lot: ${stock.lot_number}, Qty: ${stock.quantity}, Status: ${stock.status}`)
                //     .join('; '),
                // },
              ];

              tableData = tableData.map((i, index) => ({ ...i, key: index }));

              return (
                <Card>
                  <Table
                    columns={columns}
                    dataSource={tableData}
                    pagination={false} // To display all data without pagination
                    rowKey="key"
                  />
                </Card>
              );
            },
          }}
          // onRow={(record) => ({
          //   onClick: (e) => {
          //     window.open(
          //       `/products/${record.id}`,
          //       "_blank",
          //       "noopener,noreferrer"
          //     );
          //   },
          // })}
        />
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
            suppliers,
            productUnits,
            tags,
            locations,
            warehouses,
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
            suppliers,
            productUnits,
            tags,
            locations,
            warehouses,
          }}
          onSubmit={handleFormUpdateProductSubmit}
        />
      </Drawer>
    </>
  );
}

export default Products;
