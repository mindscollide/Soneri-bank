import React from "react";
import { Modal } from "react-bootstrap";
import "./downloadHistoryModal.css";
import { useSelector } from "react-redux";

const DownloadHistoryModal = () => {
  const downloadHistoryModal = useSelector(
    (state) => state.WatchListReducer.showDownloadHistoryModal,
  );
  return (
    <Modal
      show={downloadHistoryModal}
      size='md'
      centered
      backdrop={true}
      backdropClassName={"downloadHistoryModal_backdrop"}
      animation={true}
      scrollable={true}>
      <Modal.Header>
        <Modal.Title>Export Data</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>This is the download history modal content.</p>
      </Modal.Body>
    </Modal>
  );
};

export default DownloadHistoryModal;
