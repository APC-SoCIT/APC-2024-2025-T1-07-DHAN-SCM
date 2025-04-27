import { Empty, Timeline } from "antd";
import { TruckOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

function OrderTracking({ order }) {
  if (order.order_statuses.length === 0) {
    return <Empty />;
  }

  return (
    <>
      <TruckOutlined style={{ fontSize: 50, marginBottom: 16 }} />
      <Timeline
        items={order.order_statuses.map((item) => {
          let color = "orange";
          const statusName = item.status.name;
          if (
            statusName === "Approved" ||
            statusName === "Ready to Deliver" ||
            statusName === "In-Transit"
          ) {
            color = "green";
          } else if (statusName === "Delivered") {
            color = "blue";
          } else if (statusName === "Paid") {
            color = "purple";
          } else if (statusName === "Cancelled") {
            color = "red";
          }

          return {
            color,
            children: (
              <>
                <p>{statusName}</p>
                <p>{dayjs(item.created_at).format("MMMM, DD YYYY HH:mm A")}</p>
              </>
            ),
          };
        })}
      />
    </>
  );
}

export default OrderTracking;
