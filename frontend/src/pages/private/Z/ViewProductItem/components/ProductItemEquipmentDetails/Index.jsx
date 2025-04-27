import { useState, useEffect } from "react";
import {
  Descriptions,
  Tag,
  Typography,
  Image,
  Row,
  Col,
  Button,
  Drawer,
  Skeleton,
  Empty,
  Tabs,
  Divider,
} from "antd";
import FormEquipment from "./components/FormEquipments";

import ErrorContent from "../../../../../../../components/common/ErrorContent";

import http from "../../../../../../../services/httpService";

import useDataStore from "../../../../../../../store/DataStore";

import StockLedger from "../StockLedger/Index";
import Maintenances from "../Maintenance/Index";
import Claims from "../Claims/Index";
import Calibrations from "../Calibrations/Index";

const { Title, Text } = Typography;

function ProductItemEquipmentDetails({ productId, productItemId }) {
  const [productItem, setProductItem] = useState(null);
  const [locations, setLocations] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isFormUpdateEquipmentOpen, setIsFormUpdateEquipmentOpen] =
    useState(false);

  const { statuses } = useDataStore();

  const getProductItemEquipments = async () => {
    const { data: productItems } = await http.get(
      `/api/productItemEquipments/${productItemId}`
    );
    const { data: locations } = await http.get(`/api/locations`);
    const { data: warehouses } = await http.get(`/api/warehouses`);

    setProductItem(productItems);
    setLocations(locations);
    setWarehouses(warehouses);
  };

  useEffect(() => {
    const fetchProductItemEquipments = async () => {
      try {
        setIsContentLoading(true);
        await getProductItemEquipments();
      } catch (error) {
        setError(error);
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchProductItemEquipments();
  }, []);

  if (error) {
    return <ErrorContent error={error?.response?.data?.message} />;
  }

  if (!productItem || isContentLoading) {
    return <Skeleton />;
  }

  if (!productItem) {
    return <Empty />;
  }

  const toggleFormUpdateEquipmentOpen = () => {
    setIsFormUpdateEquipmentOpen(!isFormUpdateEquipmentOpen);
  };

  const handleFormUpdateEquipmentSubmit = async (formData) => {
    try {
      toggleFormUpdateEquipmentOpen();
      setIsContentLoading(true);
      await http.put(`/api/productItemEquipments/${productItem.id}`, {
        ...formData,
        status_id: 1,
      });

      const { data: stockLedgerItems } = await http.get(
        `/api/inventories/${productId}/${productItemId}`
      );

      const inventoryTotalQty = stockLedgerItems.reduce((acc, item) => {
        if (item.movement_type == "Increment") {
          acc += item.quantity;
        } else if (item.movement_type == "Decrement") {
          acc -= item.quantity;
        }

        return acc;
      }, 0);

      await http.put(`/api/products/${productId}`, {
        available_qty: inventoryTotalQty,
      });

      await getProductItemEquipments();
    } catch (error) {
      setError(error);
    } finally {
      setIsContentLoading(false);
    }
  };

  const {
    product,
    status_id,
    other_details,
    barcode,
    location,
    warehouse,
    maintenance_interval_in_month,
    model_number,
    serial_number,
  } = productItem;
  const { group, category, name, img_url } = product;

  const descriptionItems = [
    {
      label: "Image",
      children: (
        <div style={{ textAlign: "" }}>
          <Image width={150} src={img_url} />
        </div>
      ),
    },
    {
      label: "Status:",
      children:
        status_id === 3 ? (
          <Tag color="green">{statuses[status_id]}</Tag>
        ) : (
          statuses[status_id]
        ),
    },
    {
      label: "Product Group:",
      children: `${group.name}`,
    },
    {
      label: "Product Category:",
      children: `${category.name}`,
    },
    {
      label: "Serial Number:",
      children: serial_number || <Tag color="red">N/A</Tag>,
    },
    {
      label: "Model Number:",
      children: model_number || <Tag color="red">N/A</Tag>,
    },

    {
      label: "Maintenance Inverval in Month:",
      children: maintenance_interval_in_month || <Tag color="red">N/A</Tag>,
    },
    {
      label: "Barcode:",
      children: barcode || <Tag color="red">N/A</Tag>,
    },
    {
      label: "Equipment:",
      children: location?.name || <Tag color="red">N/A</Tag>,
    },
    {
      label: "Warehouse:",
      children: warehouse?.name || <Tag color="red">N/A</Tag>,
    },
    {
      label: "Other Details:",
      children: other_details || "-",
    },
  ];

  const tabItems = [
    {
      key: "1",
      label: "Stock Ledger",
      children: (
        <StockLedger productId={productId} productItemId={productItemId} />
      ),
    },
    {
      key: "3",
      label: "Maintenance Records",
      children: <Maintenances productItemId={productItemId} />,
    },
    {
      key: "4",
      label: "Calibration Records",
      children: <Calibrations productItemId={productItemId} />,
    },
    {
      key: "2",
      label: "Warranty Claims",
      children: <Claims productItemId={productItemId} />,
    },
  ];

  return (
    <>
      <Row justify="space-between">
        <Col>
          <Title level={3} style={{ margin: 0 }}>
            Product Name: {name}
          </Title>
          <Text type="secondary">Some Description Here</Text>
        </Col>
        <Col>
          <Button size="large" onClick={toggleFormUpdateEquipmentOpen}>
            Update Details
          </Button>
        </Col>
      </Row>

      <Descriptions
        bordered
        column={1}
        items={descriptionItems}
        style={{ marginBottom: 16, marginTop: 16 }}
      />

      <Divider />
      <Tabs defaultActiveKey="1" items={tabItems} />

      <Drawer
        title="Update Equipment"
        open={isFormUpdateEquipmentOpen}
        destroyOnClose
        width={500}
        onClose={toggleFormUpdateEquipmentOpen}
      >
        <FormEquipment
          formData={productItem}
          supportingDetails={{ locations, warehouses }}
          onSubmit={handleFormUpdateEquipmentSubmit}
        />
      </Drawer>
    </>
  );
}

export default ProductItemEquipmentDetails;
