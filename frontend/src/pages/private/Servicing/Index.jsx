import { useEffect, useState } from "react";
import { Table, Skeleton, Card, Tabs, Row, Col, Statistic, Spin } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";

import ErrorContent from "../../../components/common/ErrorContent";

import http from "../../../services/httpService";

import { getColumnSearchProps } from "../../../helpers/TableFilterProps";

import Maintenances from "../ProductInventory/components/AvailableMachines/components/Maintenance/Index";
import Calibrations from "../ProductInventory/components/AvailableMachines/components/Calibrations/Index";
import WarrantyClaims from "../ProductInventory/components/AvailableMachines/components/WarrantyClaims/Index";

dayjs.extend(duration);

function Servicing() {
  const [machines, setMachines] = useState([]);

  const [isContentLoading, setIsContentLoading] = useState(false);
  const [isContentLoading2, setIsContentLoading2] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const getMachines = async () => {
    const { data } = await http.get(`/api/forServicing/`);
    console.log(data);
    setMachines(data);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsContentLoading(true);
        await getMachines();
      } catch (error) {
        setErrorMsg(error.message);
      } finally {
        setIsContentLoading(false);
      }
    };

    fetchData();
  }, []);

  if (errorMsg) {
    return <ErrorContent errorMessage={errorMsg} />;
  }

  if (isContentLoading) {
    return <Skeleton />;
  }

  const onChange = async () => {
    try {
      setIsContentLoading2(true);
      await getMachines();
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setIsContentLoading2(false);
    }
  };

  const tableColumns = [
    {
      title: "Customer",
      dataIndex: "company_name",
      ...getColumnSearchProps("company_name"),
    },
    {
      title: "Product",
      dataIndex: "product_name",
      ...getColumnSearchProps("product_name"),
      render: (_, record) => {
        return (
          <>
            <div>{record.product_name}</div>
            {/* <div>
              Serial #: {record.serial_number} &ndash; Ref: #{" "}
              {record.reference_number}
            </div>
            <div></div> */}
          </>
        );
      },
    },

    {
      title: "Serial No.",
      dataIndex: "serial_number",
      ...getColumnSearchProps("serial_number"),
    },
    {
      title: "Ref No.",
      dataIndex: "reference_number",
      ...getColumnSearchProps("reference_number"),
    },
    {
      title: (
        <>
          Released
          <br />
          Date
        </>
      ),
      dataIndex: "created_at",
      render: (text) => dayjs(text).format("MMMM DD, YYYY"),
    },
    {
      title: (
        <>
          For
          <br />
          Calibration
        </>
      ),
      render: (_, record) => (record.for_calibration ? "Yes" : "No"),
      filters: [
        {
          text: "Yes",
          value: true,
        },
        {
          text: "No",
          value: false,
        },
      ],
      onFilter: (value, record) => record.for_calibration === value,
    },
    {
      title: (
        <>
          Last
          <br />
          Calibration Date
        </>
      ),
      render: (_, record) =>
        record.calibration_date
          ? dayjs(record.calibration_date).format("MMMM DD, YYYY")
          : "-",
    },
    {
      title: (
        <>
          For
          <br />
          Maintenance
        </>
      ),
      render: (_, record) => (record.for_maintenance ? "Yes" : "No"),
      filters: [
        {
          text: "Yes",
          value: true,
        },
        {
          text: "No",
          value: false,
        },
      ],
      onFilter: (value, record) => record.for_maintenance === value,
    },
    {
      title: (
        <>
          Next
          <br />
          Maintenance Date
        </>
      ),
      render: (_, record) =>
        record.next_maintenance_date
          ? dayjs(record.next_maintenance_date).format("MMMM DD, YYYY")
          : "-",
    },
    {
      title: "Type",
      dataIndex: "type",
      filters: [
        {
          text: "Demo",
          value: "Demo",
        },
        {
          text: "Order",
          value: "Order",
        },
      ],
      onFilter: (value, record) => record.status.name === value,
    },
  ];

  let forCalibrationCount = machines.filter(
    (machine) => machine.for_calibration
  ).length;
  let forMaintenanceCount = machines.filter(
    (machine) => machine.for_maintenance
  ).length;

  return (
    <Spin spinning={isContentLoading2} tip="loading...">
      <Card style={{ marginBottom: 16 }}>
        <span>
          <strong>For Calibration</strong>: {forCalibrationCount}
        </span>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <span>
          <strong>For Maintenance</strong>: {forMaintenanceCount}
        </span>
      </Card>
      {/* <Row style={{ marginBottom: 16 }} justify="space-between">
        <Col></Col>
        <Col>
          <Row gutter={[16, 16]}>
            <Col>
              <Card>
                <Statistic
                  title="For Calibration"
                  value={forCalibrationCount}
                />
              </Card>
            </Col>
            <Col>
              <Card>
                <Statistic
                  title="For Maintenance"
                  value={forMaintenanceCount}
                />
              </Card>
            </Col>
          </Row>
        </Col>
      </Row> */}
      <Table
        columns={tableColumns}
        dataSource={machines}
        rowKey="serial_number"
        expandable={{
          expandedRowRender: (record) => {
            const releaseDate = dayjs(record.created_at); // Replace with your actual release date
            const expiryDate = releaseDate.add(1, "year");

            const diff = dayjs.duration(expiryDate.diff(dayjs()));

            const tabItems = [
              {
                key: "2",
                label: "Calibration Records",
                children: (
                  <Calibrations
                    serialNumber={record.serial_number}
                    onChange={onChange}
                  />
                ),
              },
              {
                key: "3",
                label: "Maintenance Records",
                children: (
                  <Maintenances
                    serialNumber={record.serial_number}
                    onChange={onChange}
                  />
                ),
              },
              {
                key: "4",
                label: (
                  <>
                    Waranty Claims (
                    {`Expires in ${diff.months()} months and ${diff.days()} days`}
                    )
                  </>
                ),
                children: (
                  <WarrantyClaims
                    serialNumber={record.serial_number}
                    onChange={onChange}
                    enable={diff.days() !== 0}
                  />
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
  );
}

export default Servicing;
