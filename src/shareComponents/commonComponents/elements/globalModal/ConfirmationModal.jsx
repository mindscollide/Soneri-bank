import React from "react";
import { Modal, Button, Row, Col } from "react-bootstrap";
import styles from "./ConfirmationModal.module.css";

export const GlobalConfirmatioModal = ({
  show,
  onClose,
  onProceed,
  message,
}) => {
  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      dialogClassName={styles["modal-Approval"]}
    >
      <Modal.Body className="d-flex flex-column justify-content-center align-items-center">
        <p className={styles["paragraph-accepting"]}>{message}</p>
        <Row className={styles["modal-Approval-footer"]}>
          <Col className={styles["footer-approval-btn-col"]}>
            <Button className={styles["discard-accept-btn"]} onClick={onClose}>
              Discard
            </Button>
            <Button className={styles["proceed-btn"]} onClick={onProceed}>
              Proceed
            </Button>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};
