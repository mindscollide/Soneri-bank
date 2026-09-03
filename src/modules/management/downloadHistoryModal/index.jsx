import React from "react";
import { Modal } from "react-bootstrap";
import "./downloadHistoryModal.css";
import { useDispatch, useSelector } from "react-redux";
import { setDownloadHistoryModal } from "../../../store/slicers/watchListSlicer/WatchListSlicer";
import CustomButton from "../../../shareComponents/commonComponents/elements/globalButton/button";

const DownloadHistoryModal = () => {
  const dispatch = useDispatch();

  const downloadHistoryModal = useSelector(
    (state) => state.WatchListReducer.showDownloadHistoryModal,
  );
  const downloadHistoryData = useSelector(
    (state) => state.WatchListReducer.DownloadHistoryData,
  );

  const handleClose = () => {
    dispatch(setDownloadHistoryModal(false));
  };

  const instrumentLabel =
    downloadHistoryData?.instrumentName ||
    downloadHistoryData?.tenorName ||
    downloadHistoryData?.currencyName ||
    downloadHistoryData?.displayName ||
    downloadHistoryData?.tenor ||
    "";

  return (
    <Modal
      show={downloadHistoryModal}
      onHide={handleClose}
      size='md'
      centered
      backdrop={true}
      backdropClassName={"downloadHistoryModal_backdrop"}
      animation={true}
      
      scrollable={true}>
      <Modal.Header closeButton>
        <Modal.Title>Export Data</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {instrumentLabel && (
          <p className='fw-bold mb-2'>{instrumentLabel}</p>
        )}
        <p>This is the download history modal content.</p>
      </Modal.Body>
      <Modal.Footer>
        <CustomButton value={"Close"} onClick={handleClose} />
      </Modal.Footer>
    </Modal>
  );
};

export default DownloadHistoryModal;
