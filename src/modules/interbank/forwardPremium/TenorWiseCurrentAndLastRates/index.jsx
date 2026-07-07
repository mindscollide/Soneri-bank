import React, { Suspense, useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { NumericFormat } from "react-number-format";
import moment from "moment";

import InputFIeld from "../../../../shareComponents/commonComponents/elements/inputField/InputField";
import CustomButton from "../../../../shareComponents/commonComponents/elements/globalButton/button";
import IconElement from "../../../../shareComponents/commonComponents/elements/IconElement/IconElement";
import GlobalTable from "../../../../shareComponents/commonComponents/elements/table/GlobalTable";
import { useNotification } from "../../../../context/NotificationProvider";
import { formatDateUTCToGMT } from "../../../../utils/timeFunction";
import GlobalModal from "../../../../shareComponents/commonComponents/elements/globalModal/Modal";
import {
  setForwardsForTreasuryBranch,
  updateForwardItem,
} from "../../../../store/slicers/watchListSlicer/WatchListSlicer";
import {
  GetRefreshIconTenorsApi,
  PublishTenorWiseForwardsAction,
} from "../../../../store/actions/WatchlistAction";
import styles from "./TenorWifeCurrent.module.css";
import { Tooltip } from "antd";

// Define condition to include components

/**
 * ForwardsForTreasuryAndBranchTable component is responsible for displaying and managing
 * the forwards for treasury and dealer branch data in a tabular format.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Object} props.newTenorRecord - The new tenor record to be added.
 * @param {Function} props.setNewTenorRecord - Function to set the new tenor record.
 * @returns {JSX.Element} The rendered component.
 *
 * @example
 * <ForwardsForTreasuryAndBranchTable
 *   newTenorRecord={newTenorRecord}
 *   setNewTenorRecord={setNewTenorRecord}
 * />
 */
const TenoreWiseCurrentAndLastRates = ({
  newTenorRecord,
  setNewTenorRecord,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const { showMessage } = useNotification();
  const PublishForwardsButtonLoading = useSelector(
    (state) => state.WatchListReducer.publishTenorWiseForwardsLoading
  );
  const marketStatus = useSelector(
    (state) => state.RealtimeActionsSlice.marketStatus
  );

  const getAllTenorsData = useSelector(
    (state) => state.WatchListReducer.getAllTenors
  );

  const treasuryFowardsTenorsChanges = useSelector(
    (state) => state.RealtimeActionsSlice.treasuryFowardsTenorsChanges
  );

  const forwardsForTreasuryBranch = useSelector(
    (state) => state.WatchListReducer.forwardsForTreasuryBranch
  );

  const getDashboardForwards = useSelector(
    (state) => state.WatchListReducer.getDealerDashboardData
  );
  const getTenorWiseForwardsRates = useSelector(
    (state) => state.RealtimeActionsSlice.tenorWiseForwardsRates
  );
  const GetRefreshIconTenors = useSelector(
    (state) => state.WatchListReducer.GetRefreshIconTenors
  );

  const [confirmationModal, setConfirmationModal] = useState(false);
  const [TenorRemoveRecord, setTenorRemoveRecord] = useState(null);

  useEffect(() => {
    if (newTenorRecord !== null) {
      let newData = [...forwardsForTreasuryBranch, newTenorRecord];
      dispatch(setForwardsForTreasuryBranch(newData));

      setNewTenorRecord(null);
    }
  }, [newTenorRecord]);

  useEffect(() => {
    if (!GetRefreshIconTenors || !GetRefreshIconTenors.tenors) return;

    const { tenors = [] } = GetRefreshIconTenors;

    const updatedData = forwardsForTreasuryBranch.map((row) => {
      const matchingTenor = tenors.find(
        (tenor) => tenor.tenorID === row.tenorID
      );

      // No match — leave row completely untouched
      if (!matchingTenor) return row;

      return {
        ...row,
        tenorDays: matchingTenor.noOfDays ?? row.tenorDays,
        currentBid: matchingTenor.bid ?? row.currentBid,
        currentAsk: matchingTenor.ask ?? row.currentAsk,
      };
    });

    const sortedData = updatedData.sort(
      (a, b) => (a.tenorDays || 0) - (b.tenorDays || 0)
    );

    dispatch(setForwardsForTreasuryBranch(sortedData));
  }, [GetRefreshIconTenors]);

  useEffect(() => {
    if (getAllTenorsData !== null) {
      try {
        const {
          currentTenorWiseForwardRates = [],
          lastTenorWiseForwardRates = [],
        } =
          getDashboardForwards !== null &&
          getDashboardForwards !== undefined &&
          getDashboardForwards;
        const { tenors } = getAllTenorsData;

        // Step 1: Filter only tenors where forward is applicable
        const applicableTenors = tenors.filter(
          (tenor) => tenor.isForwardingApplicable === true
        );

        // Step 2: Map applicable tenors to final formatted data
        const newDataMap = applicableTenors.map((tenor) => {
          const current = currentTenorWiseForwardRates.find(
            (item) => item.tenorID === tenor.tenorID
          );
          const last = lastTenorWiseForwardRates.find(
            (item) => item.tenorID === tenor.tenorID
          );

          return {
            tenorID: tenor.tenorID,
            tenorName: tenor.tenorName,
            tenorDays: tenor.tenorDays,
            currentBid: current?.bid ?? "",
            currentAsk: current?.ask ?? "",
            lastBid: last?.bid ?? "",
            lastAsk: last?.ask ?? "",
            dateTime: current?.dateTime ?? "",
          };
        });
        setDate(newDataMap[0]?.dateTime);
        dispatch(setForwardsForTreasuryBranch(newDataMap));
      } catch (error) {
        console.error("Error processing tenor forwards:", error);
      }
    }
  }, [getDashboardForwards, getAllTenorsData]);

  useEffect(() => {
    if (
      !getTenorWiseForwardsRates ||
      !getAllTenorsData ||
      !treasuryFowardsTenorsChanges
    )
      return;
    try {
      const {
        currentTenorWiseForwardRates,
        lastTenorWiseForwardRates,
        tenorList,
        // newIsForwardtenorList,
      } = getTenorWiseForwardsRates.tenorWiseForwardRates || {};
      const { tenors } = getAllTenorsData || {};
      const { updateTenorsDays = [] } = treasuryFowardsTenorsChanges;

      console.log(getTenorWiseForwardsRates, "viewing the data");
      // Early return if required data is missing
      if (
        !currentTenorWiseForwardRates ||
        !lastTenorWiseForwardRates ||
        !tenors ||
        !updateTenorsDays
      ) {
        return;
      }

      // Filter out items that exist in tenorList
      const filteredRates = currentTenorWiseForwardRates.filter(
        (tenorData) =>
          !tenorList?.some((data) => data.tenorID === tenorData.tenorID)
      );

      const processedData = filteredRates
        .map((item) => {
          const matchingTenor = updateTenorsDays.find(
            (tenor) => tenor.tenorID === item.tenorID
          );
          const matchingLastRate = lastTenorWiseForwardRates.find(
            (lastRate) => lastRate.tenorID === item.tenorID
          );
          return {
            tenorID: item.tenorID,
            tenorName: item.tenorName,
            tenorDays: matchingTenor?.noOfDays || item.noOfDays || 0,
            currentBid: item.bid,
            currentAsk: item.ask,
            lastBid: matchingLastRate?.bid || "",
            lastAsk: matchingLastRate?.ask || "",
            dateTime: item.dateTime,
          };
        })
        // ✅ remove duplicates by tenorID
        .reduce((acc, curr) => {
          if (!acc.some((item) => item.tenorID === curr.tenorID)) {
            acc.push(curr);
          }
          return acc;
        }, [])
        .sort((a, b) => (a.tenorDays || 0) - (b.tenorDays || 0));

      setDate(processedData[0]?.dateTime);
      dispatch(setForwardsForTreasuryBranch(processedData));
      // dispatch(tenorWiseFowardsRatesPublishedActions(null));
      // dispatch(setTreasuryFowardsTenorsChanges(null));
    } catch (error) {
      console.error("Error processing forward rates:", error);
      // Consider adding error handling/notification here
    }
  }, [
    getTenorWiseForwardsRates,
    getAllTenorsData,
    treasuryFowardsTenorsChanges,
  ]);

  const handleDeleteTenorRecord = (record) => {
    setTenorRemoveRecord(record);
    setConfirmationModal(true);
  };

  const handleYesConfirmatonModal = () => {
    const filteredRecords = forwardsForTreasuryBranch.filter(
      (item) => item.tenorID !== TenorRemoveRecord.tenorID
    );

    dispatch(setForwardsForTreasuryBranch(filteredRecords));
    setConfirmationModal(false);
  };
  const handleChangeCurrentForwards = (record, view, event) => {
    const { value } = event.target;
    console.log(value, "checkerValue");
    try {
      dispatch(
        updateForwardItem({
          tenorID: record.tenorID,
          view,
          value,
        })
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handlePublishForwards = () => {
    console.log("CheckerIs this treasury");
    console.log(
      forwardsForTreasuryBranch,
      "forwardsForTreasuryBranchforwardsForTreasuryBranch"
    );
    // let checkDoNotempty = forwardsForTreasuryBranch.every(
    //   (item) =>
    //     item.currentAsk !== "" &&
    //     Number(item.currentAsk) !== 0 &&
    //     item.currentBid !== "" &&
    //     Number(item.currentBid) !== 0
    // );
    //
    let checkAskValue = forwardsForTreasuryBranch.find(
      (item) => Number(item.currentAsk) < Number(item.currentBid)
    );

    if (checkAskValue !== undefined) {
      showMessage("Ask value must be greater than Bid value.");

      return;
    }

    // Get all tenorDays values
    const tenorDaysList = forwardsForTreasuryBranch.map(
      (item) => item.tenorDays
    );

    // Find duplicates
    const duplicates = tenorDaysList.filter(
      (item, index) => tenorDaysList.indexOf(item) !== index
    );

    // Alert if duplicates found
    if (duplicates.length > 0) {
      console.log(duplicates, "duplicatesduplicatesduplicates");
      showMessage(
        `Duplicate tenorDays found: ${[...new Set(duplicates)].join(", ")}`
      );
      return;
      // alert(
      //   `Duplicate tenorDays found: ${[...new Set(duplicates)].join(", ")}`
      // );
    }

    let Data = {
      CurrentTenorWiseForwardRates: forwardsForTreasuryBranch.map((item) => ({
        TenorID: item.tenorID,
        Bid: String(item.currentBid),
        Ask: String(item.currentAsk),
        DateTime: "",
        NoOfDays: item.tenorDays,
      })),
    };

    // console.log({ Data, forwardsForTreasuryBranch }, "DataDataData");
    dispatch(PublishTenorWiseForwardsAction({ Data, navigate }));
  };

  const handleChangeDays = (tenorId, value) => {
    const updatedData = forwardsForTreasuryBranch.map((item) =>
      item.tenorID === tenorId
        ? { ...item, tenorDays: Number(value) || 0 }
        : item
    );

    dispatch(setForwardsForTreasuryBranch(updatedData));
  };

  const handleGetDataFromTresmark = () => {
    dispatch(GetRefreshIconTenorsApi({ navigate }));
  };

  const columns = [
    {
      title: "",
      children: [
        {
          title: "Tenor",
          dataIndex: "tenorName",
          key: "tenorName",
          width: 250,
        },
      ],
    },
    {
      title: (
        <div className={styles["refresh-nodays"]}>
          <Tooltip title="Data From Tresmark">
            <i
              className="icon-refresh icn-refreshdays fw-bold"
              onClick={handleGetDataFromTresmark} // optional
              style={{ cursor: "pointer" }}
            />
          </Tooltip>
        </div>
      ),
      children: [
        {
          title: "No. of Days",
          dataIndex: "tenorDays",
          key: "tenorDays",
          align: "center",
          width: 250,
          render: (text, record) => {
            return (
              <InputFIeld
                value={record.tenorDays}
                // disabled={true}
                onChange={(event) =>
                  handleChangeDays(record.tenorID, event.target.value)
                }
                applyClass={"DealerTableBitInput"}
              />
            );
          },
        },
      ],
    },

    {
      title: "Current",
      children: [
        {
          title: "Bid",
          dataIndex: "currentBid",
          key: "currentBid",
          align: "center",
          render: (text, record) =>
            InputFIeld ? (
              <Suspense fallback={<div>Loading input...</div>}>
                <NumericFormat
                  customInput={InputFIeld}
                  applyClass={"DealerTableBitInput"}
                  decimalScale={2}
                  value={record.currentBid}
                  onChange={(event) =>
                    handleChangeCurrentForwards(record, "bid", event)
                  }
                />
              </Suspense>
            ) : null,
        },
        {
          title: "Ask",
          dataIndex: "currentAsk",
          key: "currentAsk",
          align: "center",
          render: (text, record) =>
            InputFIeld ? (
              <Suspense fallback={<div>Loading input...</div>}>
                <NumericFormat
                  customInput={InputFIeld}
                  applyClass={"DealerTableBitInput"}
                  decimalScale={2}
                  value={record.currentAsk}
                  onChange={(event) =>
                    handleChangeCurrentForwards(record, "ask", event)
                  }
                />
              </Suspense>
            ) : null,
        },
      ],
    },
    {
      title: "Last",
      children: [
        {
          title: "Bid",
          dataIndex: "lastBid",
          key: "lastBid",
          align: "center",
          render: (text, record) =>
            InputFIeld ? (
              <Suspense fallback={<div>Loading input...</div>}>
                <InputFIeld
                  type="number"
                  value={record.lastBid}
                  disabled={true}
                  applyClass={"DealerTableBitInput"}
                />
              </Suspense>
            ) : null,
        },
        {
          title: "Ask",
          dataIndex: "lastAsk",
          key: "lastAsk",
          align: "center",
          render: (text, record) =>
            InputFIeld ? (
              <Suspense fallback={<div>Loading input...</div>}>
                <InputFIeld
                  type="number"
                  value={record.lastAsk}
                  disabled={true}
                  applyClass={"DealerTableBitInput"}
                />
              </Suspense>
            ) : null,
        },
      ],
    },
    {
      title: "",
      key: "",
      children: [
        {
          title: "",
          dataIndex: "",
          key: "",
          width: 80,
          align: "center",
          render: (record) => {
            return (
              CustomButton &&
              IconElement && (
                <Suspense fallback={<div>Loading button...</div>}>
                  <CustomButton
                    type="link"
                    icon={
                      <Suspense fallback={<div>Loading icon...</div>}>
                        <IconElement
                          iconClass={"icon-close color-red fs-6 cursor-pointer"}
                          onClick={() => handleDeleteTenorRecord(record)}
                        />
                      </Suspense>
                    }
                  />
                </Suspense>
              )
            );
          },
        },
      ],
    },
  ];

  return (
    <>
      {GlobalTable && (
        <>
          <Suspense fallback={<div>Loading Table...</div>}>
            <div className="datetime fw-bold text-end mb-2 ff-roboto">
              {date !== "" &&
                moment(formatDateUTCToGMT(date)).format(
                  "DD MMM YYYY, hh:mm:ss"
                )}
            </div>
            <GlobalTable
              columns={columns}
              dataSource={forwardsForTreasuryBranch}
              prefixCls={"ForwardsForTreasuryAndBranchTable"}
              pagination={false}
            />
            {CustomButton && (
              <span className="d-flex justify-content-center mt-4">
                <CustomButton
                  applyClass="publishForwardsBtn"
                  value={"Publish Forwards"}
                  loading={PublishForwardsButtonLoading}
                  onClick={handlePublishForwards}
                  disabled={
                    marketStatus === false
                      ? true
                      : forwardsForTreasuryBranch.length === 0
                      ? false
                      : false
                  }
                />
              </span>
            )}
            <GlobalModal
              show={confirmationModal}
              centered={true}
              footerClassName={"d-block border-0"}
              bodyClassName={"b-0"}
              modalBody={
                <>
                  <Row>
                    <Col
                      sm={12}
                      md={12}
                      lg={12}
                      className="d-flex justify-content-center"
                    >
                      <span className="modalDescription">
                        Are you sure you want to delete it ?
                      </span>
                    </Col>
                  </Row>
                </>
              }
              modalFooter={
                <>
                  <Row>
                    <Col
                      sm={6}
                      md={6}
                      lg={6}
                      className="d-flex justify-content-end"
                    >
                      <CustomButton
                        value={"Yes"}
                        onClick={handleYesConfirmatonModal}
                        applyClass={"ConfirmationModalYesDealBox"}
                      />
                    </Col>
                    <Col
                      sm={6}
                      md={6}
                      lg={6}
                      className="d-flex justify-content-start"
                    >
                      <CustomButton
                        value={"No"}
                        onClick={() => setConfirmationModal(false)}
                        applyClass={"ConfirmationModalNoDealBox"}
                      />
                    </Col>
                  </Row>
                </>
              }
            />
          </Suspense>
        </>
      )}
    </>
  );
};

export default TenoreWiseCurrentAndLastRates;
