import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Spin,
  Row,
  Col,
  Button,
  Table,
  Dropdown,
  Tabs,
  Badge,
  Typography,
  Tag,
  App,
} from "antd";
import { MoreOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

import ErrorContent from "../../../components/common/ErrorContent";

import http from "../../../services/httpService";

import { getColumnSearchProps } from "../../../helpers/TableFilterProps";
import { formatWithComma } from "../../../helpers/numbers";

import useDataStore from "../../../store/DataStore";

const { Text } = Typography;

function PurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const navigate = useNavigate();
  const { statuses } = useDataStore();
  const { modal } = App.useApp();

  const getPurchaseOrders = async () => {
    const { data } = await http.get("/api/purchaseOrders");
    setPurchaseOrders(data.purchase_orders);
  };

  useEffect(() => {
    const fetchPurchaseOrders = async () => {
      try {
        setIsContentLoading(true);
        await getPurchaseOrders();
      } catch (errorMsg) {
        setErrorMsg(errorMsg);
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchPurchaseOrders();
  }, []);

  if (errorMsg) {
    return <ErrorContent errorMessage={errorMsg} />;
  }

  const handleUpdatePurchaseOrder = async (purchaseOrder, newStatusId) => {
    try {
      setIsContentLoading(true);
      await http.put(`/api/purchaseOrders/${purchaseOrder.id}/status`, {
        status_id: Number(newStatusId),
      });

      // if (Number(newStatusId) === 6) {
      //   const { data } = await http.get(
      //     `/api/purchaseOrders/${purchaseOrder.id}`
      //   );

      //   const { purchase_order_items: purchaseOrderItems } = data;

      //   const consumableItems = purchaseOrderItems.filter(
      //     ({ product }) => product.product_category_id == 1
      //   );
      //   const equipmentItems = purchaseOrderItems
      //     .filter(({ product }) => product.product_category_id == 2)
      //     .flatMap((equipment) =>
      //       Array.from({ length: equipment.quantity }, () => {
      //         return {
      //           ...equipment,
      //           quantity: 1,
      //         };
      //       })
      //     );

      //   const forInsertProductItemConsumables = consumableItems.map(
      //     (consumableItem) => {
      //       return {
      //         product_id: consumableItem.product_id,
      //         purchase_order_id: purchaseOrder.id,
      //         batch_number: null,
      //         expiry_date: null,
      //         other_details: null,
      //         barcode: null,
      //         location_id: 1,
      //         warehouse_id: 1,
      //         status_id: 3,
      //       };
      //     }
      //   );

      //   const forInsertProductItemEquipments = equipmentItems.map(
      //     (equipmentItem) => {
      //       return {
      //         product_id: equipmentItem.product_id,
      //         purchase_order_id: purchaseOrder.id,
      //         serial_number: null,
      //         model_number: null,
      //         maintenance_interval_in_month: 0,
      //         other_details: null,
      //         barcode: null,
      //         location_id: 1,
      //         warehouse_id: 1,
      //         status_id: 3,
      //       };
      //     }
      //   );

      //   await http.post(
      //     "/api/productItemConsumablesNew",
      //     forInsertProductItemConsumables
      //   );

      //   await http.post(
      //     "/api/productItemEquipmentsNew",
      //     forInsertProductItemEquipments
      //   );
      // }

      await getPurchaseOrders();
    } catch (errorMsg) {
      setErrorMsg(errorMsg);
    } finally {
      setIsContentLoading(false);
    }
  };

  const tableColumns = [
    {
      title: "Purchase Order No.",
      dataIndex: "ponumber",
      ...getColumnSearchProps("ponumber"),
      render: (_, record) => {
        const { ponumber, supplier } = record;

        return (
          <Link to={`/purchaseOrders/${record.id}`}>
            <div>
              <Text strong>{ponumber}</Text>
            </div>

            <div>{supplier.name}</div>
            <div>
              {supplier.contact_info && (
                <Text type="secondary" italic>
                  {supplier.contact_info}
                </Text>
              )}
            </div>
          </Link>
        );
      },
    },
    {
      title: "Amount",
      dataIndex: "total_amount",
      width: 100,
      render: (text) => formatWithComma(text),
    },
    {
      title: "Date Ordered",
      dataIndex: "created_at",
      width: 150,
      render: (text) => dayjs(text).format("MMMM DD, YYYY"),
    },
    {
      title: "Status",
      width: 100,
      render: (_, record) => {
        let color = "orange";
        const statusId = record.status_id;
        if (statusId === 2 || statusId === 33 || statusId === 31) {
          color = "green";
        } else if (statusId === 11) {
          color = "blue";
        } else if (statusId === 14) {
          color = "purple";
        } else if (statusId === 12) {
          color = "red";
        }
        return <Tag color={color}>{record.status.name}</Tag>;
      },
    },
    {
      title: "Action",
      width: 50,
      render: (_, record) => {
        const menuItems = [{ key: "View", label: "View Details" }];

        if (record.status_id === 1) {
          menuItems.push({ type: "divider" });
          menuItems.push({ key: 12, label: statuses[12], danger: true });
          menuItems.unshift({ key: 2, label: statuses[2] });
        }

        if (record.status_id === 2) {
          menuItems.push({ type: "divider" });
          menuItems.push({ key: 12, label: statuses[12], danger: true });
          menuItems.unshift({ key: 33, label: statuses[33] });
        }

        if (record.status_id === 33 || record.status_id === 31) {
          menuItems.unshift({ key: "Receive", label: "Receive" });
        }

        if (record.status_id === 11) {
          menuItems.unshift({ key: 14, label: statuses[14] });
        }

        // if (record.status_id === 6) {
        //   menuItems.unshift({ key: 7, label: statuses[7] });
        //   menuItems.pop();
        //   menuItems.pop();
        // }

        // if (record.status_id === 7) {
        //   menuItems.unshift({ key: 8, label: statuses[8] });
        //   menuItems.pop();
        //   menuItems.pop();
        // }

        // if (record.status_id === 7 || record.status_id === 8) {
        //   menuItems.pop();
        //   menuItems.pop();
        // }

        const handleMenuClick = ({ key }) => {
          if (key === "View") {
            navigate(`/purchaseOrders/${record.id}`);
          }
          if (key === "Receive") {
            navigate(`/purchaseOrders/receive/${record.id}`);
          } else {
            modal.confirm({
              title: `${statuses[key]} Purchase Order`,
              content: `Are you sure you want to ${statuses[
                key
              ].toLowerCase()} this purchase order?`,
              onOk: async () => {
                handleUpdatePurchaseOrder(record, key);
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

  const pendingPOs = purchaseOrders.filter((po) => po.status_id === 1);
  const approvedPOs = purchaseOrders.filter((po) => po.status_id === 2);
  const forReceivingPOs = purchaseOrders.filter((po) => po.status_id === 33);
  const partiallyReceivedPOs = purchaseOrders.filter(
    (po) => po.status_id === 31
  );
  const deliveredPOs = purchaseOrders.filter((po) => po.status_id === 11);
  const cancelledPos = purchaseOrders.filter((po) => po.status_id === 12);

  const tabItems = [
    {
      key: "1",
      label: (
        <>
          Pending{" "}
          {pendingPOs.length > 0 && (
            <Badge count={pendingPOs.length} color="gold" />
          )}
        </>
      ),
      children: (
        <Table columns={tableColumns} dataSource={pendingPOs} rowKey="id" />
      ),
    },
    {
      key: "2",
      label: (
        <>
          Approved{" "}
          {approvedPOs.length > 0 && (
            <Badge count={approvedPOs.length} color="green" />
          )}
        </>
      ),
      children: (
        <Table columns={tableColumns} dataSource={approvedPOs} rowKey="id" />
      ),
    },
    {
      key: "3",
      label: (
        <>
          For Receiving{" "}
          {forReceivingPOs.length > 0 && (
            <Badge count={forReceivingPOs.length} color="green" />
          )}
        </>
      ),
      children: (
        <Table
          columns={tableColumns}
          dataSource={forReceivingPOs}
          rowKey="id"
        />
      ),
    },
    {
      key: "4",
      label: (
        <>
          Partially Received{" "}
          {partiallyReceivedPOs.length > 0 && (
            <Badge count={partiallyReceivedPOs.length} color="green" />
          )}
        </>
      ),
      children: (
        <Table
          columns={tableColumns}
          dataSource={partiallyReceivedPOs}
          rowKey="id"
        />
      ),
    },
    {
      key: "5",
      label: (
        <>
          Delivered{" "}
          {deliveredPOs.length > 0 && (
            <Badge count={deliveredPOs.length} color="blue" />
          )}
        </>
      ),
      children: (
        <Table columns={tableColumns} dataSource={deliveredPOs} rowKey="id" />
      ),
    },
    {
      key: "6",
      label: "Cancelled",
      children: (
        <Table columns={tableColumns} dataSource={cancelledPos} rowKey="id" />
      ),
    },
    {
      key: "7",
      label: "All Purchase Orders",
      children: (
        <Table columns={tableColumns} dataSource={purchaseOrders} rowKey="id" />
      ),
    },
  ];

  return (
    <>
      <Spin spinning={isContentLoading} tip="loading ...">
        <Row type="flex" justify="space-between" style={{ marginBottom: 16 }}>
          <Col></Col>
          <Col>
            <Link to="/purchaseOrders/create">
              <Button type="primary">Create Purchase Order</Button>
            </Link>
          </Col>
        </Row>
        <Tabs defaultActiveKey="1" items={tabItems} />
      </Spin>
    </>
  );
}

export default PurchaseOrders;
