import { useEffect, useState } from "react";
import {
  Table,
  Checkbox,
  Descriptions,
  Skeleton,
  Empty,
  Button,
  message,
  Divider,
} from "antd";
import ErrorContent from "../../../../../components/common/ErrorContent";
import http from "../../../../../services/httpService";

function FormAllocation({ supportingData, onSubmit }) {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [error, setError] = useState(false);
  const [isContentLoading, setIsContentLoading] = useState(false);

  const computeQuantitySum = (movements, movementType) => {
    return movements
      .filter((movement) => movement.movement_type === movementType)
      .reduce((sum, movement) => sum + movement.quantity, 0);
  };

  const { selectedOrderItem } = supportingData;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsContentLoading(true);
        const { data: productItemConsumables } = await http.get(
          "/api/productItemConsumables"
        );
        const { data: productItemEquipments } = await http.get(
          "/api/productItemEquipments"
        );
        const { data: inventories } = await http.get("/api/inventories");

        const productItems = [
          ...productItemConsumables,
          ...productItemEquipments,
        ]
          .map((item) => {
            const { product_id, id } = item;
            return {
              ...item,
              stockLedger: inventories.filter(
                (inventory) =>
                  inventory.product_id === product_id &&
                  inventory.product_item_id === id
              ),
            };
          })
          .map((item) => {
            const sumOfIncrements = computeQuantitySum(
              item.stockLedger,
              "Increment"
            );
            const sumOfDecrements = computeQuantitySum(
              item.stockLedger,
              "Decrement"
            );

            return {
              newId: `${item.product_id}-${item.id}`,
              product_name: item.product.name,
              quantity: sumOfIncrements - sumOfDecrements,
              ...item,
            };
          })
          .filter(
            (item) =>
              item.product_id === supportingData.selectedOrderItem.product_id
          )
          .filter((item) => item.status_id !== 3);

        setItems(productItems);
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

  if (isContentLoading) {
    return <Skeleton />;
  }

  if (items.length === 0) {
    return <Empty />;
  }

  const handleCheckboxChange = (record, checked) => {
    let updatedSelectedItems = [...selectedItems];
    if (checked) {
      updatedSelectedItems.push(record);
    } else {
      updatedSelectedItems = updatedSelectedItems.filter(
        (item) => item.id !== record.id
      );
    }
    setSelectedItems(updatedSelectedItems);
  };

  const handleFormFinish = () => {
    function distributeQty(items, targetQty) {
      let remainingQty = targetQty;

      return items.map((item) => {
        const decrement = Math.min(item.quantity, remainingQty);
        remainingQty -= decrement;
        return {
          quantity: decrement,
          product_id: item.product_id,
          product_item_id: item.id,
          movement_type: "Decrement",
          remarks: "Order",
          order_item_id: selectedOrderItem.id,
          qty: decrement,
          batch_number: item.batch_number,
        };
      });
    }

    const data = distributeQty(selectedItems, selectedOrderItem.qty);

    const forInsertOrderAllocation = data.map((item) => ({
      order_item_id: item.order_item_id,
      product_item_id: item.product_item_id,
      qty: item.qty,
      batch_number: item.batch_number,
    }));

    const forInsertInventory = data.map((item) => ({
      product_id: item.product_id,
      product_item_id: item.product_item_id,
      quantity: item.quantity,
      movement_type: item.movement_type,
      remarks: item.remarks,
    }));

    onSubmit({ forInsertOrderAllocation, forInsertInventory });
  };

  const totalSelectedQuantity = selectedItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const tableColumns = [
    {
      title: "Name",
      dataIndex: "name",
      render: (_, record) => {
        return record.product.name;
      },
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      width: 100,
    },
    {
      title: "Batch Number",
      dataIndex: "batch_number",
      width: 150,
    },
    {
      title: "Action",
      width: 50,
      render: (_, record) => {
        const isChecked = selectedItems.some((item) => item.id === record.id);
        const isDisabled =
          !isChecked && totalSelectedQuantity >= selectedOrderItem.qty;
        return (
          <Checkbox
            onChange={(e) => handleCheckboxChange(record, e.target.checked)}
            checked={isChecked}
            disabled={isDisabled}
          />
        );
      },
    },
  ];

  return (
    <>
      <Table
        columns={tableColumns}
        dataSource={items}
        rowKey="id"
        pagination={false}
        style={{ marginBottom: 16 }}
      />
      <Descriptions
        bordered
        column={1}
        items={[
          {
            label: "Order Quantity:",
            children: selectedOrderItem.qty,
          },
          {
            label: "Total Selected Quantity:",
            children: totalSelectedQuantity,
          },
        ]}
      />
      <Divider />
      <div style={{ textAlign: "right" }}>
        <Button
          type="primary"
          disabled={totalSelectedQuantity < selectedOrderItem.qty}
          onClick={handleFormFinish}
        >
          OK
        </Button>
      </div>
    </>
  );
}

export default FormAllocation;
