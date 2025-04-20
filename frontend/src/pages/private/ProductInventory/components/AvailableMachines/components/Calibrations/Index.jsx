import { useEffect, useState } from "react";
import { Spin, Row, Col, Button, Drawer, Table, Modal, Dropdown } from "antd";
import { MoreOutlined } from "@ant-design/icons";

import ErrorContent from "../../../../../../../components/common/ErrorContent";
import FormCalibration from "./components/FormCalibration";

import http from "../../../../../../../services/httpService";

import { getColumnSearchProps } from "../../../../../../../helpers/TableFilterProps";

function Calibrations({ serialNumber }) {
  const [calibrations, setCalibrations] = useState([]);
  const [selectedCalibration, setSelectedCalibration] = useState(null);

  const [isFormCreateCalibrationOpen, setIsFormCreateCalibrationOpen] =
    useState(false);
  const [isFormUpdateCalibrationOpen, setIsFormUpdateCalibrationOpen] =
    useState(false);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const getCalibrations = async () => {
    const { data } = await http.get(`/api/calibrationRecords/${serialNumber}`);
    setCalibrations(data);
  };

  useEffect(() => {
    const fetchCalibrations = async () => {
      try {
        setIsContentLoading(true);
        await getCalibrations();
      } catch (error) {
        setErrorMsg(error.message || "Something went wrong!");
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchCalibrations();
  }, []);

  if (errorMsg) {
    return <ErrorContent errorMessage={errorMsg} />;
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
      await http.post("/api/calibrationRecords", {
        ...formData,
        serial_number: serialNumber,
      });
      await getCalibrations();
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong!");
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleFormUpdateCalibrationSubmit = async (formData) => {
    try {
      toggleFormUpdateCalibrationOpen();
      setIsContentLoading(true);
      await http.put(`/api/calibrationRecords/${selectedCalibration.id}`, {
        ...formData,
        serial_number: serialNumber,
      });
      await getCalibrations();
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong!");
    } finally {
      setIsContentLoading(false);
    }
  };

  const handleDeleteCalibration = async (calibration) => {
    try {
      setIsContentLoading(true);
      await http.delete(`/api/calibrationRecords/${calibration.id}`);
      await getCalibrations();
    } catch (error) {
      setErrorMsg(error.message || "Something went wrong!");
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
      title: "Notes",
      dataIndex: "calibration_notes",
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
