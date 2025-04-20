import { useEffect, useState } from "react";
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
} from "antd";
import {
  MoreOutlined,
  ArrowDownOutlined,
  EnvironmentOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import ErrorContent from "../../../../../components/common/ErrorContent";

import http from "../../../../../services/httpService";
import { getColumnSearchProps } from "../../../../../helpers/TableFilterProps";
import { formatWithComma } from "../../../../../helpers/numbers";

import Barcode from "react-barcode";

import FormGroupedItem from "./components/FormGroupedItems";

const { Text } = Typography;

function AvailableConsumables({ product, status, onChange }) {
  const [groupedItems, setGroupItems] = useState([]);
  const [selectedGroupItem, setSelectedGroupItem] = useState(null);

  const [isFormUpdateGroupedItems, setIsFormUpdateGroupedItems] =
    useState(false);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const getGroupItems = async () => {
    let groupedItems = [...product.incoming_stocks];
    if (status !== "ALL") {
      groupedItems = product.incoming_stocks.filter(
        (gI) => gI.status === status
      );
    }

    setGroupItems(groupedItems);
  };

  useEffect(() => {
    const fetchGroupedItems = async () => {
      try {
        setIsContentLoading(true);
        await getGroupItems();
      } catch (error) {
        setErrorMsg(error.message || "Something went wrong!");
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchGroupedItems();
  }, []);

  if (errorMsg) {
    return <ErrorContent errorMessage={errorMsg} />;
  }

  const toggleFormUpdateGroupedItems = () => {
    setIsFormUpdateGroupedItems(!isFormUpdateGroupedItems);
  };

  const handleFormUpdateGroupedItemSubmit = async (formData) => {
    try {
      toggleFormUpdateGroupedItems();
      setIsContentLoading(true);
      const { data } = await http.put(`/api/incomingStocks/update`, {
        ...formData,
        serial_number: null,
        barcodes: selectedGroupItem.barcodes,
      });
      if (data.message.includes("already exist")) {
        alert(data.message);
      } else {
        onChange();
      }
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong!");
    } finally {
      setIsContentLoading(false);
    }
  };

  const tableColumns = [
    {
      title: "Lot Number",
      dataIndex: "lot_number",
      render: (text) => text || "N/A",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
    },
    {
      title: "Expiration Date",
      dataIndex: "expiration_date",
      render: (text) => text || "N/A",
    },
    {
      title: "Expires In",
      dataIndex: "remaining_time",
      render: (text) => text || "N/A",
    },
    {
      title: "Action",
      width: 50,
      render: (_, record) => {
        const menuItems = [{ key: "Update", label: "Update" }];

        const handleMenuClick = ({ key }) => {
          if (key === "Update") {
            setSelectedGroupItem(record);
            toggleFormUpdateGroupedItems();
          } else if (key === "Delete") {
            // Modal.confirm({
            //   title: "Delete Product",
            //   content: "Are you sure you want to delete this product?",
            //   onOk: async () => {
            //     handleDeleteProduct(record);
            //   },
            // });
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

  const handlePrint = (id) => {
    const printContent = document.getElementById(id).innerHTML;
    const printWindow = window.open("", "", "height=600,width=800");
    printWindow.document.write("<html><head><title>Print</title>");
    printWindow.document.write(
      "</head><body style='margin: 0; padding: 30px 0 0 0'>"
    );
    printWindow.document.write(printContent);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <>
      <Spin spinning={isContentLoading} tip="loading ...">
        <Table
          rowKey="lot_number"
          columns={tableColumns}
          dataSource={groupedItems}
          expandable={{
            expandedRowRender: (record) => {
              const columns = [
                {
                  title: "Barcode",
                  dataIndex: "barcode",
                  render: (text) => (
                    <div id={text}>
                      <Barcode
                        value={text}
                        height={30}
                        fontSize={10}
                        displayValue={true}
                        width={1.4}
                        margin={10}
                      />
                    </div>
                  ),
                },
                {
                  title: "Action",
                  render: (_, record) => (
                    <Button
                      type="primary"
                      onClick={() => handlePrint(record.barcode)}
                    >
                      Print
                    </Button>
                  ),
                  width: 100,
                },
              ];

              return (
                <Card>
                  <Table
                    columns={columns}
                    dataSource={record.barcodes.map((item) => ({
                      barcode: item,
                    }))}
                    pagination={false} // To display all data without pagination
                    rowKey="barcode"
                  />
                </Card>
              );
            },
          }}
        />
      </Spin>

      <Drawer
        title="Update Grouped Items"
        open={isFormUpdateGroupedItems}
        destroyOnClose
        width={500}
        onClose={toggleFormUpdateGroupedItems}
      >
        <FormGroupedItem
          formData={selectedGroupItem}
          onSubmit={handleFormUpdateGroupedItemSubmit}
        />
      </Drawer>
    </>
  );
}

export default AvailableConsumables;
