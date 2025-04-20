import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Skeleton,
  Empty,
  Image,
  Spin,
  Typography,
  Tag,
  Space,
  Tabs,
} from "antd";
import {
  MoreOutlined,
  ArrowDownOutlined,
  ExclamationOutlined,
  EnvironmentOutlined,
  EnvironmentTwoTone,
  ExclamationCircleOutlined,
  WarningOutlined,
  IdcardOutlined,
} from "@ant-design/icons";

import ErrorContent from "../../../components/common/ErrorContent";

import http from "../../../services/httpService";

import AvailableConsumables from "./components/AvailableConsumables/Index";
import AvailableMachines from "./components/AvailableMachines/Index";

const { Title, Text } = Typography;

function ProductInventory() {
  const [product, setProduct] = useState(null);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const { productId } = useParams();

  const getProductInventory = async () => {
    const { data } = await http.get(`/api/getAllProducts/${productId}`);
    setProduct(data);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsContentLoading(true);
        await getProductInventory();
      } catch (error) {
        setErrorMsg(error.message || "Something went wrong!");
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchData();
  }, []);

  if (errorMsg) {
    return <ErrorContent errorMessage={errorMsg} />;
  }

  if (isContentLoading) {
    return <Skeleton active />;
  }

  if (!product) {
    return <Empty />;
  }

  const handleAvailableMachineChange = async () => {
    try {
      setIsContentLoading(true);
      await getProductInventory();
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong!");
    } finally {
      setIsContentLoading(false);
    }
  };

  const consumablesTabItems = [
    {
      key: 1,
      label: "All",
      children: (
        <AvailableConsumables
          product={product}
          status="ALL"
          onChange={handleAvailableMachineChange}
        />
      ),
    },
    {
      key: 2,
      label: "Viable",
      children: (
        <AvailableConsumables
          product={product}
          status="VIABLE"
          onChange={handleAvailableMachineChange}
        />
      ),
    },
    {
      key: 3,
      label: "Expiring",
      children: (
        <AvailableConsumables
          product={product}
          status="EXPIRING"
          onChange={handleAvailableMachineChange}
        />
      ),
    },
    {
      key: 4,
      label: "Expired",
      children: (
        <AvailableConsumables
          product={product}
          status="EXPIRED"
          onChange={handleAvailableMachineChange}
        />
      ),
    },
  ];

  const machineTabItems = [
    {
      key: 5,
      label: "Available", //for machine items
      children: (
        <AvailableMachines
          product={product}
          onChange={handleAvailableMachineChange}
        />
      ),
    },
  ];

  let tabItems = [
    {
      key: 6,
      label: "Release",
      children: "Release",
    },
  ];

  if (product.is_machine) {
    tabItems = [...machineTabItems, ...tabItems];
  } else {
    tabItems = [...consumablesTabItems, ...tabItems];
  }

  return (
    <>
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col>
            <Image
              width={120}
              height={120}
              src={product.image_url || "https://placehold.co/120x120"}
            />
          </Col>
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              {product.name} &mdash; {product.model}{" "}
            </Title>
            <div style={{ marginTop: 3 }}>
              <Text type="secondary">{product.description}</Text>
            </div>
            <div style={{ marginTop: 3 }}>
              <Text type="secondary">
                <IdcardOutlined /> {product.supplier.name}
              </Text>
            </div>
            <div style={{ marginTop: 3 }}>
              <Text type="secondary">
                <EnvironmentOutlined /> {product?.warehouse?.name} -{" "}
                {product?.location?.name}
              </Text>
            </div>
            <div style={{ marginTop: 8 }}>
              <Space>
                {product.tags.map((tag) => (
                  <Tag key={tag.id}>{tag.name}</Tag>
                ))}
              </Space>
            </div>
          </Col>
        </Row>
      </Card>
      <Card>
        <Tabs
          //onChange={onChange}
          type="card"
          items={tabItems}
        />
      </Card>
    </>
  );
}

export default ProductInventory;
