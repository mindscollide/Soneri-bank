import React, { Suspense, startTransition, useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import TenoreWiseCurrentAndLastRates from "./TenorWiseCurrentAndLastRates";
import CustomButton from "../../../shareComponents/commonComponents/elements/globalButton/button";
import SelectDropdown from "../../../shareComponents/commonComponents/elements/selectDropdown/SelectDropdown";
import IconElement from "../../../shareComponents/commonComponents/elements/IconElement/IconElement";
import NotificationSnackbar from "../../../shareComponents/commonComponents/elements/NotificationSnackbar";
import InputFIeld from "../../../shareComponents/commonComponents/elements/inputField/InputField";
import GlobalModal from "../../../shareComponents/commonComponents/elements/globalModal/Modal";
import { createTenorAction } from "../../../store/actions/WatchlistAction";
import { setCreateTenorModal } from "../../../store/slicers/modalSlicer/modalSlicer";

const ForwardsPremium = () => {
  const createTenorModal = useSelector(
    (state) => state.modalReducer.createTenorModal
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [newTenorRecord, setNewTenorRecord] = useState(null);
  const tenorsCreated = useSelector(
    (state) => state.RealtimeActionsSlice.tenorsCreated
  );

  const forwardsForTreasuryBranch = useSelector(
    (state) => state.WatchListReducer.forwardsForTreasuryBranch
  );

  const createTenorLoading = useSelector(
    (state) => state.WatchListReducer.createTenorLoading
  );

  const getAllTenorsData = useSelector(
    (state) => state.WatchListReducer.getAllTenors
  );

  const [getAllTenorsList, setAllTenorsList] = useState([]);
  const [createTenor, setCreateTenor] = useState({
    tenorName: "",
    noOfDays: 0,
  });

  const [error, setError] = useState({ tenorName: "", noOfDays: "" });
  const [tenorValue, setTenorValue] = useState({
    value: 0,
    label: "",
  });

  // state for NotificationSnackbar
  const [snackbarData, setSnackbarData] = useState([]);
  useEffect(() => {
    if (snackbarData.message !== "") {
      const timer = setTimeout(() => {
        setSnackbarData({ message: "" });
      }, 3000); // 3 seconds

      return () => clearTimeout(timer);
    }
  }, [snackbarData.message]);

  const handleOpenModal = () => {
    // Wrap the state update in startTransition
    startTransition(() => {
      dispatch(setCreateTenorModal(true));
    });
  };

  const handleChangeTenors = (value) => {
    setTenorValue(value);
  };

  const handleChangeCreateTenor = (event) => {
    const { name, value } = event.target;

    // Restrict input length
    if (name === "tenorName") {
      // Allow only letters, numbers, and spaces
      const cleanValue = value.replace(/[^a-zA-Z0-9 ]/g, "");

      // Restrict max length (example: 20 chars)
      if (cleanValue.length > 20) return;

      setCreateTenor({ ...createTenor, [name]: cleanValue.trimStart() });
      return;
    }
    if (name === "noOfDays") {
      // Reject non-digits (no points, no special chars, no minus/plus)
      const cleanValue = value.replace(/\D/g, "");
      if (cleanValue.length > 4) return;
      setCreateTenor({ ...createTenor, [name]: cleanValue });
      return;
    }
    setCreateTenor({ ...createTenor, [name]: value });
  };
  const handleCreateTenor = () => {
    const { tenorName, noOfDays } = createTenor;

    if (tenorName !== "" && noOfDays !== 0) {
      if (getAllTenorsList.length > 0) {
        const isExistTenorName = getAllTenorsList.some(
          (item) => item.tenorName === tenorName
        );
        const isExistTenorDays = getAllTenorsList.some(
          (item) => item.tenorDays === Number(noOfDays)
        );

        if (isExistTenorName) {
          setSnackbarData([
            {
              id: Date.now(),
              message: "Tenor name already exists",
            },
          ]);
          return;
        }

        if (isExistTenorDays) {
          setSnackbarData([
            {
              id: Date.now(),
              message: "No of days already exists",
            },
          ]);
          return;
        }
      }

      // ✅ No duplicates, continue dispatch
      let Data = {
        Tenor: tenorName,
        NoOfDays: Number(noOfDays),
      };

      dispatch(
        createTenorAction({
          Data,
          navigate,
          setCreateTenor,
        })
      );
    } else {
      setSnackbarData({
        message: newError,
      });
      return;
    }
  };

  const handleAddTenor = () => {
    try {
      if (!tenorValue?.value || !tenorValue?.label) {
        setSnackbarData({
          message: "Invalid tenor selection",
        });
        return;
      }

      const tenorForwardData = {
        tenorID: tenorValue.value,
        tenorName: tenorValue.label,
        currentBid: "",
        currentAsk: "",
        tenorDays: tenorValue.tenorDays,
        lastAsk: "",
        lastBid: "",
        DateTime: new Date().toISOString(),
      };

      // Check if the tenor already exists in the current list
      const isExist = forwardsForTreasuryBranch.some(
        (item) => item.tenorID === tenorValue.value
      );

      if (isExist) {
        setSnackbarData({
          message: "Already exists",
        });
        return;
      }

      // Add new tenor record
      setNewTenorRecord(tenorForwardData);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (getAllTenorsData?.tenors?.length) {
      try {
        let tenorsList = [...getAllTenorsData.tenors]
          .sort((a, b) => a.tenorDays - b.tenorDays) // ascending
          .map((tenor) => ({
            ...tenor,
            label: tenor.tenorName,
            value: tenor.tenorID,
          }));

        // eslint-disable-next-line react-hooks/set-state-in-effect
        // setTenorValue({
        //   value: tenorsList[0].value,
        //   label: tenorsList[0].label,
        // });
        if (tenorsList.length > 0) {
          setTenorValue(tenorsList[0]);
        }
        setAllTenorsList(tenorsList);
      } catch (error) {
        console.error("Error processing tenors", error);
      }
    }
  }, [getAllTenorsData]);

  useEffect(() => {
    if (tenorsCreated !== null) {
      try {
        console.log(tenorsCreated, "tenorsCreatedtenorsCreated");
        const { tenor } = tenorsCreated;
        let findIsExist = getAllTenorsList.find(
          (data2, index) => data2.tenorID === tenor.tenorID
        );
        if (findIsExist === undefined) {
          let newObj = {
            ...tenor,
            value: tenor.tenorID,
            label: tenor.tenorName,
          };
          setAllTenorsList([...getAllTenorsList, newObj]);
        }
      } catch (error) {
        console.log(error);
      }
    }
  }, [tenorsCreated]);

  return (
    <>
      <Row className="mt-5 mb-2">
        <Col sm={12} md={6} lg={6}>
          <h6 className="fs-4 fw-bold color-black">Forward Premium</h6>
        </Col>
        <Col sm={12} md={6} lg={6} className="flex-fill text-end">
          {CustomButton && (
            <Suspense fallback={<div>Loading button...</div>}>
              <CustomButton
                value={"Create Tenor"}
                applyClass="createTenorBtn"
                onClick={handleOpenModal}
              />
            </Suspense>
          )}
        </Col>
        <Col sm={12} md={12} lg={12}>
          <div
            className="d-flex select-br-days flex-wrap justify-content-center"
            data-select2-id="6"
          >
            <div className="w-fix-350">
              <div className="input-group">
                {SelectDropdown && (
                  <Suspense fallback={<div>Loading dropdown...</div>}>
                    <SelectDropdown
                      isSearchable={true}
                      value={tenorValue}
                      menuPosition="bottom"
                      onChange={handleChangeTenors}
                      options={getAllTenorsList}
                      classNamePrefix={"SelectTenorDropDown"}
                    />
                  </Suspense>
                )}
                {IconElement && (
                  <Suspense fallback={<div>Loading icon...</div>}>
                    <CustomButton
                      value={"Add"}
                      iconPosition={"start"}
                      onClick={handleAddTenor}
                      applyClass="PlusButton"
                      icon={
                        <IconElement iconClass={"icon-add-circle-fill fs-4"} />
                      }
                    />
                  </Suspense>
                )}
              </div>
            </div>
          </div>
        </Col>
        {TenoreWiseCurrentAndLastRates && (
          <Col sm={12} md={12} lg={12} className="mt-3">
            <Suspense fallback={<div>Loading table...</div>}>
              <TenoreWiseCurrentAndLastRates
                newTenorRecord={newTenorRecord}
                setNewTenorRecord={setNewTenorRecord}
              />
            </Suspense>
          </Col>
        )}

        {/* {DealeAndTreasuryFeDiscountingTable && (
          <Col sm={12} md={12} lg={12} className="mt-3 position-relative">
            <Suspense fallback={<SectionLoader />}>
              <h6 className="fs-4 fw-bold color-primary">FE Discounting %</h6>
              <DealeAndTreasuryFeDiscountingTable />
            </Suspense>
          </Col>
        )}
        {DealeAndTreasuryNonFeDiscountingTable && (
          <Col sm={12} md={12} lg={12} className="mt-3 position-relative">
            <Suspense fallback={<SectionLoader />}>
              <h6 className="fs-4 fw-bold color-primary">
                Non-FE Discounting %
              </h6>
              <DealeAndTreasuryNonFeDiscountingTable />
            </Suspense>
          </Col>
        )} */}
      </Row>
      <GlobalModal
        show={createTenorModal}
        backdrop="static"
        onHide={() => {
          dispatch(setCreateTenorModal(false));
          setError({ tenorName: "", noOfDays: "" });
          setCreateTenor({
            tenorName: "",
            noOfDays: 0,
          });
        }}
        centered={true}
        footerClassName="d-block border-0"
        modalBody={
          <>
            <Row>
              <Col sm={12} md={12} lg={12} className="mb-4">
                <div className="color-blue fw-bold fs-5">Create Tenor</div>
              </Col>
              <Col sm={12} md={12} lg={12} className="mb-4">
                <label className="mb-1">Tenor</label>
                <InputFIeld
                  type="text"
                  value={createTenor.tenorName}
                  name="tenorName"
                  onChange={handleChangeCreateTenor}
                  className={"form-control"}
                />
                {error.tenorName && <span>{error.tenorName}</span>}
              </Col>
              <Col sm={12} md={12} lg={12} className="mb-2">
                <label># Of Days</label>
                <InputFIeld
                  type="text"
                  value={createTenor.noOfDays}
                  name="noOfDays"
                  onChange={handleChangeCreateTenor}
                  className={"form-control"}
                />
                {error.noOfDays && <span>{error.noOfDays}</span>}
              </Col>
            </Row>
          </>
        }
        modalFooter={
          <>
            <Row>
              <Col
                sm={12}
                md={12}
                lg={12}
                className="d-flex justify-content-center gap-2"
              >
                {CustomButton && (
                  <Suspense fallback={<div>Loading button...</div>}>
                    <CustomButton
                      value={"Create Tenor"}
                      applyClass={"createTenorModalFooterBtn"}
                      onClick={handleCreateTenor}
                      loading={createTenorLoading}
                      disabled={
                        Number(createTenor.noOfDays) !== 0 &&
                        createTenor.noOfDays !== "" &&
                        createTenor.tenorName !== ""
                          ? false
                          : true
                      }
                    />
                    <CustomButton
                      value={"Cancel"}
                      onClick={() => {
                        dispatch(setCreateTenorModal(false));
                        setError({ tenorName: "", noOfDays: "" });
                        setCreateTenor({
                          tenorName: "",
                          noOfDays: 0,
                        });
                      }}
                      applyClass={"cancelTenorModalFooterBtn"}
                    />
                  </Suspense>
                )}
              </Col>
            </Row>
          </>
        }
      />
      <NotificationSnackbar messages={snackbarData} />
    </>
  );
};

export default ForwardsPremium;
