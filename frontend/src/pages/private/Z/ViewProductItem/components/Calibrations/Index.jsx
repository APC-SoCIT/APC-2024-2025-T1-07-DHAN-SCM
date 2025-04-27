import { useEffect, useState } from "react";
import { Spin, Row, Col, Button, Drawer, Table, Modal, Dropdown } from "antd";
import { MoreOutlined } from "@ant-design/icons";

import ErrorContent from "../../../../../../../components/common/ErrorContent";
import FormCalibration from "./components/FormCalibration";

import http from "../../../../../../../services/httpService";

import { getColumnSearchProps } from "../../../../../../../helpers/TableFilterProps";

function Calibrations({ productItemId }) {
  const [calibrations, setCalibrations] = useState([]);
  const [selectedCalibration, setSelectedCalibration] = useState(null);

  const [isFormCreateCalibrationOpen, setIsFormCreateCalibrationOpen] =
    useState(false);
  const [isFormUpdateCalibrationOpen, setIsFormUpdateCalibrationOpen] =
    useState(false);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCalibrations = async () => {
    const { data } = await http.get(
      `/api/productRecordCalibration/search/${productItemId}`
    );
    setCalibrations(data);
  };

  useEffect(() => {
    const fetchCalibrations = async () => {
      try {
        setIsContentLoading(true);
        await getCalibrations();
      } catch (error) {
        setError(error);
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchCalibrations();
  }, []);

  if (error) {
    return <ErrorContent />;
  }

  const toggleFormCreateCalibrationOpen = () => {
    setIsFormCreateCalibrationOpen(!isFormCreateCalibrationOpen);
  };

  const toggleFormUpdateCalibrationOpen = () => {
    setIsFormUpdateCalibrationOpen(!isFormUpdateCalibrationOpen);
  };

  const handleFormCreateCalibrationSubmit = async (formData) => {
    try {
      toggleFormCreateCalibrationOpen();
      setIsContentLoading(true);
      await http.post("/api/productRecordCalibration", {
        ...formData,
        product_item_equipment_id: productItemId,
        status_id: 1,
      });
      await getCalibrations();
    } catch (error) {
      setError(error);
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleFormUpdateCalibrationSubmit = async (formData) => {
    try {
      toggleFormUpdateCalibrationOpen();
      setIsContentLoading(true);
      await http.put(
        `/api/productRecordCalibration/${selectedCalibration.id}`,
        formData
      );
      await getCalibrations();
    } catch (error) {
      setError(error);
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleDeleteCalibration = async (calibration) => {
    try {
      setIsContentLoading(true);
      await http.delete(`/api/productRecordCalibration/${calibration.id}`);
      await getCalibrations();
    } catch (error) {
      setError(error);
    } finally {
      setIsContentLoading(false);
    }
  };

  const tableColumns = [
    {
      title: "Calibration Date",
      dataIndex: "calibration_date",
    },
    {
      title: "Calibration By",
      dataIndex: "calibrated_by",
    },
    {
      title: "Calibration Method",
      dataIndex: "calibration_method",
    },
    {
      title: "Notes",
      dataIndex: "notesede",
    },
    {
      title: "Action",
      width: 50,
      render: (_, record) => {
        const menuItems = [
          { key: "Update", label: "Update" },
          {
            type: "divider",
          },
          { key: "Delete", label: "Delete", danger: true },
        ];

        const handleMenuClick = ({ key }) => {
          if (key === "Update") {
            setSelectedCalibration(record);
            toggleFormUpdateCalibrationOpen();
          } else if (key === "Delete") {
            Modal.confirm({
              title: "Delete Calibration",
              content: "Are you sure you want to delete this calibration?",
              onOk: async () => {
                handleDeleteCalibration(record);
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

  return (
    <>
      <Spin spinning={isContentLoading} tip="loading ...">
        <Row type="flex" justify="space-between" style={{ marginBottom: 16 }}>
          <Col></Col>
          <Col>
            <Button type="primary" onClick={toggleFormCreateCalibrationOpen}>
              Create Calibration
            </Button>
          </Col>
        </Row>
        <Table columns={tableColumns} dataSource={calibrations} rowKey="id" />
      </Spin>

      <Drawer
        title="Create Calibration"
        open={isFormCreateCalibrationOpen}
        destroyOnClose
        width={500}
        onClose={toggleFormCreateCalibrationOpen}
      >
        <FormCalibration onSubmit={handleFormCreateCalibrationSubmit} />
      </Drawer>

      <Drawer
        title="Update Calibration"
        open={isFormUpdateCalibrationOpen}
        destroyOnClose
        width={500}
        onClose={toggleFormUpdateCalibrationOpen}
      >
        <FormCalibration
          formData={selectedCalibration}
          onSubmit={handleFormUpdateCalibrationSubmit}
        />
      </Drawer>
    </>
  );
}

export default Calibrations;
