import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Spin,
  Row,
  Col,
  Button,
  Drawer,
  Table,
  Modal,
  Dropdown,
  Select,
  Typography,
  Space,
  Descriptions,
  Input,
  Empty,
  Skeleton,
  Tag,
  List,
  Card,
  App,
} from "antd";
import { MoreOutlined, TruckOutlined } from "@ant-design/icons";
import Barcode from "react-barcode";

import ErrorContent from "../../../components/common/ErrorContent";

import http from "../../../services/httpService";
import { formatWithComma } from "../../../helpers/numbers";

import useDataStore from "../../../store/DataStore";
import useUserStore from "../../../store/UserStore";

import FormAllocation from "./components/FormAllocation";

import OrderTracking from "../../../components/common/OrderTracking";

const { Title, Text } = Typography;

function OrdersView() {
  const [order, setOrder] = useState(null);
  const [selectedOrderItem, setSelectedOrderItem] = useState(null);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isFormAllocationOpen, setIsFormAllocationOpen] = useState(false);

  const { orderId } = useParams();
  const { statuses } = useDataStore();
  const { roles } = useUserStore();
  const { modal } = App.useApp();

  const getOrder = async () => {
    const { data: order } = await http.get(`/api/orders/${orderId}`);

    console.log({ order });

    // const newOrderItems = order.order_items.map((orderItem) => ({
    //   ...orderItem,
    //   orderItemAllocations: orderItem.order_items_allocation,
    // }));

    // order.order_items = newOrderItems;
    setOrder(order);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsContentLoading(true);
        await getOrder();
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

  if (!order) {
    return <Empty />;
  }

  const toggleFormAllocationOpen = () => {
    setIsFormAllocationOpen(!isFormAllocationOpen);
  };

  // const handleFormAllocationSubmit = (formData) => {
  //   toggleFormAllocationOpen();
  //   const { forInsertOrderAllocation, forInsertInventory } = formData;

  //   const newOrderItems = order.order_items.map((orderItem) => {
  //     if (orderItem.id === selectedOrderItem.id) {
  //       return {
  //         ...orderItem,
  //         orderItemAllocations: forInsertOrderAllocation,
  //         forInsertInventory,
  //       };
  //     }
  //     return orderItem;
  //   });

  //   order.order_items = newOrderItems;

  //   setOrder(order);
  // };

  // function hasEmptyAllocation(order) {
  //   return order
  //     ? order.order_items.some((item) => item.orderItemAllocations.length === 0)
  //     : true;
  // }

  const handleUpdateOrder = async (order, newStatusId) => {
    try {
      setIsContentLoading(true);
      await http.patch(`/api/orders/${order.id}/status`, {
        status_id: Number(newStatusId),
      });
      await getOrder();
    } catch (error) {
      setError(error);
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleAction = async (key, text) => {
    modal.confirm({
      title: `${text} Order`,
      content: `Are you sure you want to ${text.toLowerCase()} this order?`,
      onOk: async () => {
        handleUpdateOrder(order, key);
      },
    });

    //   // await http.post("/api/saveOrderAllocation", {
    //   //   order_id: order.id,
    //   //   forInventoryInsert: forInsertInventory,
    //   //   forOrderItemsAllocationInsert,
    //   // });
    // } catch (error) {
    //   setError(true);
    // } finally {
    //   setIsContentLoading(false);
    // }
    // try {
    //   setIsContentLoading(true);
    //   let forInsertInventory = [];
    //   let forOrderItemsAllocationInsert = [];

    //   order.order_items.forEach((orderItem) => {
    //     forInsertInventory = [
    //       ...forInsertInventory,
    //       ...orderItem.forInsertInventory,
    //     ];
    //     forOrderItemsAllocationInsert = [
    //       ...forOrderItemsAllocationInsert,
    //       ...orderItem.orderItemAllocations,
    //     ];
    //   });

    //   await http.post("/api/saveOrderAllocation", {
    //     order_id: order.id,
    //     forInventoryInsert: forInsertInventory,
    //     forOrderItemsAllocationInsert,
    //   });
    //   await getOrder();
    // } catch (error) {
    //   setError(true);
    // } finally {
    //   setIsContentLoading(false);
    // }
  };

  const handlePrint = () => {
    const printContent = document.getElementById("barcode").innerHTML;
    const printWindow = window.open("", "", "height=600,width=800");
    printWindow.document.write("<html><head><title>Print</title>");
    printWindow.document.write("</head><body >");
    printWindow.document.write(printContent);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  const tableColumns = [
    {
      title: "Product",
      render: (_, record) => {
        return record.product.name;
      },
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      width: 100,
      render: (text) => formatWithComma(text),
    },
    {
      title: "Price",
      dataIndex: "unit_price",
      width: 100,
      render: (text) => formatWithComma(text),
    },
    {
      title: "Amount",
      dataIndex: "total_price",
      width: 100,
      render: (text) => formatWithComma(text),
    },
  ];

  // if (roles.includes("Sales") || roles.includes("Admin")) {
  //   tableColumns.push({
  //     title: "Action",
  //     width: 50,
  //     render: (_, record) => {
  //       return (
  //         <Button
  //           onClick={() => {
  //             setSelectedOrderItem({ order, ...record });
  //             toggleFormAllocationOpen();
  //           }}
  //         >
  //           Allocate
  //         </Button>
  //       );
  //     },
  //   });
  // }

  // if (order.latest_status.status.id !== 9) {
  //   tableColumns.pop();
  // }

  const { megaion_order_number, order_items, total_amount, status, company } =
    order;

  let color = "orange";
  const statusName = status.name;
  if (
    statusName === "Approved" ||
    statusName === "Ready to Deliver" ||
    statusName === "In Transit"
  ) {
    color = "green";
  } else if (statusName === "Delivered") {
    color = "blue";
  } else if (statusName === "Paid") {
    color = "purple";
  } else if (statusName === "Cancelled") {
    color = "red";
  }

  let actionText = "";
  let actionKey = "";
  let showCancelButton = false;

  if (statusName === "Pending") {
    if (roles.includes("Sales") || roles.includes("Admin")) {
      showCancelButton = true;
      actionKey = 2;
      actionText = "Approve";
    }
  }

  if (statusName === "Approved") {
    if (roles.includes("Warehouse Staff") || roles.includes("Admin")) {
      actionKey = 16;
      actionText = "Ready to Deliver";
    }
  }

  if (statusName === "Ready to Deliver") {
    if (roles.includes("Logistics") || roles.includes("Admin")) {
      actionKey = 18;
      actionText = "In Transit";
    }
  }

  if (statusName === "In Transit") {
    if (roles.includes("Logistics") || roles.includes("Admin")) {
      actionKey = 11;
      actionText = "Delivered";
    }
  }

  if (statusName === "Delivered") {
    if (roles.includes("Finance") || roles.includes("Admin")) {
      actionKey = 14;
      actionText = "Paid";
    }
  }

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Row type="flex" justify="space-between" style={{ marginBottom: 16 }}>
            <Col>
              <Title level={5} style={{ margin: 0 }}>
                Order Number: {megaion_order_number}
              </Title>
            </Col>
            <Col>
              <Tag color={color}>{statusName}</Tag>
            </Col>
          </Row>

          <div style={{ marginBottom: 16 }}>
            <Title level={5} style={{ marginBottom: 0 }}>
              {/* {order?.user?.company_members[0]?.company.name || "-"} */}
              {company.name}
            </Title>
            <div>
              <Text type="secondary">{company.phone_number || ""}</Text>
            </div>
            <div>
              <Text type="secondary">{company.address}</Text>
            </div>
          </div>

          <Table
            columns={tableColumns}
            dataSource={order_items}
            rowKey="id"
            pagination={false}
            // defaultExpandAllRows
            // expandable={{
            //   expandedRowRender: (record) => (
            //     <>
            //       <List
            //         size="small"
            //         bordered
            //         dataSource={record.orderItemAllocations}
            //         renderItem={(item) => (
            //           <List.Item>
            //             <div style={{ fontSize: 11 }}>
            //               <Space>
            //                 <span>
            //                   <strong>Quantity Allocated</strong>: {item.qty}
            //                 </span>
            //               </Space>
            //             </div>
            //           </List.Item>
            //         )}
            //       />
            //     </>
            //   ),
            // }}
          />

          <Row
            type="flex"
            justify="space-between"
            style={{ marginTop: 16, marginBottom: 16 }}
          >
            <Col>
              <div id="barcode">
                <Barcode
                  value={"123" || order.barcode}
                  height={50}
                  displayValue={true}
                />
              </div>
              <Button onClick={handlePrint}>Print Barcode</Button>
            </Col>
            <Col>
              <Descriptions
                bordered
                column={1}
                items={[
                  {
                    label: "Subtotal:",
                    children: formatWithComma(total_amount),
                  },
                  {
                    label: "Total:",
                    children: formatWithComma(total_amount),
                  },
                ]}
                style={{ marginBottom: 16 }}
              />
            </Col>
          </Row>

          <div style={{ textAlign: "right" }}>
            {actionKey !== "" && (
              <Button
                size="large"
                type="primary"
                onClick={() => handleAction(actionKey, actionText)}
              >
                {actionText}
              </Button>
            )}
            <Button
              type="primary"
              size="large"
              danger
              onClick={() => handleAction(12, "Cancel")}
              style={{ marginLeft: 8 }}
            >
              Cancel
            </Button>
          </div>

          {/* {order.latest_status.status.id === 9 && ()} */}
        </Col>
        <Col span={8}>
          {/* <div style={{ width: "100%", paddingLeft: 50, color: "#eb2f96" }}>
            <OrderTracking orderId={order.id} />
          </div> */}
        </Col>
      </Row>

      {/* <Drawer
        title="Select Product"
        open={isFormAllocationOpen}
        destroyOnClose
        width={600}
        onClose={toggleFormAllocationOpen}
      >
        <FormAllocation
          supportingData={{ selectedOrderItem }}
          onSubmit={handleFormAllocationSubmit}
        />
      </Drawer> */}
    </>
  );
}

export default OrdersView;
