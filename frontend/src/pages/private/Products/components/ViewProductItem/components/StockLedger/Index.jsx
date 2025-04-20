import { useEffect, useState } from "react";
import { Spin, Row, Col, Button, Drawer, Table, Modal, Dropdown } from "antd";

import ErrorContent from "../../../../../../../components/common/ErrorContent";
import FormStockLedgerItem from "./components/FormStockLedgerItem";

import http from "../../../../../../../services/httpService";

function StockLedger({ productId, productItemId }) {
  const [stockLedgerItems, setStockLedgerItems] = useState([]);

  const [isFormCreateStockLedgerItemOpen, setIsFormCreateStockLedgerItemOpen] =
    useState(false);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [error, setError] = useState(null);

  const getStockLedgerItems = async () => {
    const { data } = await http.get(
      `/api/inventories/${productId}/${productItemId}`
    );
    setStockLedgerItems(data);
  };

  useEffect(() => {
    const fetchStockLedgerItems = async () => {
      try {
        setIsContentLoading(true);
        await getStockLedgerItems();
      } catch (error) {
        setError(error);
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchStockLedgerItems();
  }, []);

  if (error) {
    return <ErrorContent />;
  }

  const toggleFormCreateStockLedgerItemOpen = () => {
    setIsFormCreateStockLedgerItemOpen(!isFormCreateStockLedgerItemOpen);
  };

  const handleFormCreateStockLedgerItemSubmit = async (formData) => {
    try {
      toggleFormCreateStockLedgerItemOpen();
      setIsContentLoading(true);
      await http.post("/api/inventories", {
        ...formData,
        remarks: "Manual Adjustment",
        product_id: Number(productId),
        product_item_id: Number(productItemId),
      });

      const { data: stockLedger } = await http.get(
        `/api/inventories/${productId}`
      );

      const inventoryTotalQty = stockLedger.reduce((acc, item) => {
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

      await getStockLedgerItems();
    } catch (error) {
      setError(error);
    } finally {
      setIsContentLoading(false);
    }
  };

  const tableColumns = [
    {
      title: "Movement",
      dataIndex: "movement_type",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
    },
    {
      title: "Created by",
      render: (_, record) => 1,
    },
  ];

  return (
    <>
      <Spin spinning={isContentLoading} tip="loading ...">
        <Row type="flex" justify="space-between" style={{ marginBottom: 16 }}>
          <Col></Col>
          <Col>
            <Button
              type="primary"
              onClick={toggleFormCreateStockLedgerItemOpen}
            >
              Manual Adjustment
            </Button>
          </Col>
        </Row>
        <Table
          columns={tableColumns}
          dataSource={stockLedgerItems}
          rowKey="id"
        />
      </Spin>

      <Drawer
        title="Manual Adjustment"
        open={isFormCreateStockLedgerItemOpen}
        destroyOnClose
        width={500}
        onClose={toggleFormCreateStockLedgerItemOpen}
      >
        <FormStockLedgerItem onSubmit={handleFormCreateStockLedgerItemSubmit} />
      </Drawer>
    </>
  );
}

export default StockLedger;
