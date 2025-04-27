import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Col,
  Row,
  Button,
  Input,
  List,
  message,
  Skeleton,
  Empty,
  Tag,
  Divider,
  Result,
  Select,
} from "antd";
import {
  ShoppingCartOutlined,
  PlusOutlined,
  MinusOutlined,
} from "@ant-design/icons";

import ErrorContent from "../../../components/common/ErrorContent";

import http from "../../../services/httpService";

import { formatWithComma } from "../../../helpers/numbers";

import useUserStore from "../../../store/UserStore";

function ProductCard({ product, addToCart }) {
  let actions = [];
  // if (product.available_quantity === 0) {
  //   actions = [<Tag color="red">Not Available</Tag>];
  // } else if (product.product_category_id === 3) {
  //   actions = [<Tag color="orange">Call To Order</Tag>];
  // } else {
  //   actions = [
  //     <Button
  //       type="primary"
  //       icon={<ShoppingCartOutlined />}
  //       onClick={() => addToCart(product)}
  //     >
  //       Add to Cart
  //     </Button>,
  //   ];
  // }
  if (product.available_quantity === 0) {
    actions = [<Tag color="red">Not Available</Tag>];
  } else {
    actions = [
      <Button
        type="primary"
        icon={<ShoppingCartOutlined />}
        onClick={() => addToCart(product)}
      >
        Add to Cart
      </Button>,
    ];
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Card
        hoverable
        cover={
          <div style={{ height: "200px", overflow: "hidden" }}>
            <img
              alt={product.name}
              src={product.image_url || "https://placehold.co/230x270"}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        }
        actions={actions}
        style={{ flex: 1, display: "flex", flexDirection: "column" }}
      >
        <Card.Meta
          title={product.name}
          description={
            <>
              {/* <Paragraph
                ellipsis={{
                  rows: 3,
                  expandable: true,
                  symbol: "see more",
                }}
                style={{ minHeight: 80 }}
              >
                {product.description}
              </Paragraph> */}

              <div>
                PHP {formatWithComma(product.default_selling_price.toFixed(2))}
              </div>
              <div>Available: {product.available_quantity}</div>
            </>
          }
        />
      </Card>
    </div>
  );
}

function ProductListing() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);

  const [products, setProducts] = useState([]);
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [placeOrderLoading, setPlaceOrderLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(false);

  const [filteredProducts, setFilteredProducts] = useState([]);

  const [companyOrderNumber, setCompanyOrderNumber] = useState("");
  const [orderId, setOrderId] = useState("");

  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState("");

  const { id: companyId } = useUserStore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsContentLoading(true);
        const { data } = await http.get("/api/getAllProducts");

        const products = data.map((product) => ({
          ...product,
          default_selling_price: parseFloat(product.default_selling_price),
        }));

        setProducts(products);
        setFilteredProducts(products);
      } catch (error) {
        setErrorMsg(error.message);
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchLocations();
  }, []);

  if (errorMsg) {
    return <ErrorContent errorMessage={errorMsg} />;
  }

  if (isContentLoading) {
    return <Skeleton />;
  }

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingProduct = prevCart.find((item) => item.id === product.id);
      if (existingProduct) {
        if (existingProduct.quantity < product.available_quantity) {
          return prevCart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          message.warning(
            `You can only add up to ${product.available_quantity} of this item.`
          );
          return prevCart;
        }
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleFilterChange = (value) => {
    if (value === "All") {
      setFilteredProducts(products);
    } else if (value === "Consumables") {
      const filteredProducts = products.filter(
        (product) => !product.is_machine
      );
      setFilteredProducts(filteredProducts);
    } else if (value === "Machines") {
      const filteredProducts = products.filter((product) => product.is_machine);
      setFilteredProducts(filteredProducts);
    }
  };

  const selectAfter = (
    <Select
      defaultValue="All"
      onChange={handleFilterChange}
      style={{ width: 150 }}
    >
      <Option value="All">All</Option>
      <Option value="Consumables">Consumables</Option>
      <Option value="Machines">Machines</Option>
    </Select>
  );

  const handlePlaceOrder = async () => {
    try {
      if (companyOrderNumber.trim() === "") {
        alert("Please enter order number");
        return;
      }
      setPlaceOrderLoading(true);
      const orderItems = cart.map((cartItem) => {
        const { quantity, id, default_selling_price } = cartItem;
        return {
          product_id: id,
          quantity,
          unit_price: default_selling_price,
          total_price: Number(
            (cartItem.default_selling_price * cartItem.quantity).toFixed(2)
          ),
        };
      });
      const order = {
        // company_id: companyId,
        company_order_number: companyOrderNumber,
        order_date: "2025-04-05",
        total_amount: totalPrice,
        order_items: orderItems,
        status_id: 1,
      };
      const { data } = await http.post("/api/orders", order);
      setOrderId(data.id);
      setPurchaseOrderNumber(data.megaion_order_number);
      setIsOrderSuccess(true);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setPlaceOrderLoading(false);
    }
  };

  const displayProducts = filteredProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPrice = cart.reduce(
    (total, item) => total + item.default_selling_price * item.quantity,
    0
  );

  if (isOrderSuccess) {
    return (
      <Result
        status="success"
        title="Order Successfully Purchased!"
        subTitle={`Order #${purchaseOrderNumber} Confirmed: Thank You for Trusting Megaion! We’ll Reach Out if Any Further Action is Required.`}
        extra={[
          <Button
            type="primary"
            key="console"
            onClick={() => navigate(`/customerOrders/${orderId}`)}
          >
            View my Orders
          </Button>,
        ]}
      />
    );
  }

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Input
            placeholder="Search products"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ marginBottom: 20 }}
            size="large"
            addonAfter={selectAfter}
          />
          {products.length === 0 ? (
            <Empty />
          ) : (
            <Row gutter={[16, 16]}>
              {displayProducts.map((product) => (
                <Col key={product.id} xs={24} sm={12} md={8} lg={8}>
                  <ProductCard product={product} addToCart={addToCart} />
                </Col>
              ))}
            </Row>
          )}
        </Col>
        <Col span={8}>
          <Card title="Your Cart">
            <List
              dataSource={cart}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button
                      icon={<MinusOutlined />}
                      onClick={() => updateQuantity(item.id, -1)}
                    />,
                    <Button
                      icon={<PlusOutlined />}
                      onClick={() => updateQuantity(item.id, 1)}
                      disabled={item.quantity >= item.available_quantity}
                    />,
                  ]}
                >
                  <List.Item.Meta
                    title={item.name}
                    description={`PHP ${formatWithComma(
                      item.default_selling_price.toFixed(2)
                    )} x ${item.quantity}`}
                  />
                  <div>
                    PHP{" "}
                    {formatWithComma(
                      (item.default_selling_price * item.quantity).toFixed(2)
                    )}
                  </div>
                </List.Item>
              )}
            />
            <div style={{ marginTop: 20, fontWeight: "bold" }}>
              Total: PHP {formatWithComma(totalPrice.toFixed(2))}
            </div>

            <Divider />
            <Input
              style={{ width: "100%", marginBottom: 16 }}
              placeholder="Enter your Order Number Here"
              onChange={(e) => setCompanyOrderNumber(e.target.value)}
            />
            <Button
              size="large"
              type="primary"
              onClick={handlePlaceOrder}
              disabled={cart.length === 0}
              loading={placeOrderLoading}
            >
              Place Order
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default ProductListing;
