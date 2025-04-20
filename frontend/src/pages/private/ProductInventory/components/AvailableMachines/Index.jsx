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
  Tabs,
} from "antd";
import {
  MoreOutlined,
  ArrowDownOutlined,
  EnvironmentOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import Barcode from "react-barcode";

import ErrorContent from "../../../../../components/common/ErrorContent";

import http from "../../../../../services/httpService";
import { getColumnSearchProps } from "../../../../../helpers/TableFilterProps";
import { formatWithComma } from "../../../../../helpers/numbers";

import Calibrations from "./components/Calibrations/Index";
import Maintenances from "./components/Maintenance/Index";
import FormGroupedItem from "./components/FormGroupedItems";

const { Text } = Typography;

function AvailableMachines({ product, onChange }) {
  const [groupedItems, setGroupItems] = useState([]);
  const [selectedGroupItem, setSelectedGroupItem] = useState(null);

  const [isFormUpdateGroupedItems, setIsFormUpdateGroupedItems] =
    useState(false);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const getGroupItems = async () => {
    setGroupItems(product.incoming_stocks);
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
        lot_number: null,
        expiration_date: null,
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
      title: "Serial",
      dataIndex: "serial_number",
      ...getColumnSearchProps("serial_number"),
    },
    {
      title: "For Calibration",
      render: (_, record) => (record.for_calibration ? "Yes" : "No"),
    },
    {
      title: "For Maintenance",
      render: (_, record) => (record.for_maintenance ? "Yes" : "No"),
    },
    {
      title: "Status",
      dataIndex: "status",
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
          rowKey="serial_number"
          columns={tableColumns}
          dataSource={groupedItems}
          expandable={{
            expandedRowRender: (record) => {
              const tabItems = [
                {
                  key: "1",
                  label: "Barcode",
                  children: (
                    <>
                      <div id={record.barcodes[0]}>
                        <Barcode
                          value={record.barcodes[0]}
                          height={30}
                          fontSize={10}
                          displayValue={true}
                          width={1.4}
                          margin={10}
                        />
                      </div>

                      <Button
                        type="primary"
                        style={{ marginTop: 16, marginLeft: 40 }}
                        onClick={() => handlePrint(record.barcodes[0])}
                      >
                        Print
                      </Button>
                    </>
                  ),
                },
                {
                  key: "2",
                  label: "Calibration Records",
                  children: (
                    <Calibrations serialNumber={record.serial_number} />
                  ),
                },
                {
                  key: "3",
                  label: "Maintenance Records",
                  children: (
                    <Maintenances serialNumber={record.serial_number} />
                  ),
                },
              ];

              return (
                <Card>
                  <Tabs type="card" items={tabItems} />
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

export default AvailableMachines;
