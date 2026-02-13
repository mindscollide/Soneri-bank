import React from "react";
import { Modal } from "react-bootstrap";

const GlobalModal = ({
  show,
  centered,
  onHide,
  keyboard,
  modalBody, // Only include this once
  className,
  fullscreen,
  size,
  scrollable,
  style,
  modalFooter,
  backdrop,
  closeButton,
  modalHeader,
  headerClassName,
  bodyClassName,
  footerClassName,
}) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      animation={true}
      backdrop={backdrop}
      keyboard={keyboard}
      className={className}
      centered={centered}
      fullscreen={fullscreen}
      size={size}
      scrollable={scrollable}
      style={style}
    >
      {modalHeader && (
        <Modal.Header className={headerClassName} closeButton={closeButton}>
          {modalHeader}
        </Modal.Header>
      )}
      <Modal.Body className={bodyClassName}>{modalBody}</Modal.Body>
      {modalFooter && (
        <Modal.Footer className={footerClassName}>{modalFooter}</Modal.Footer>
      )}
    </Modal>
  );
};

export default GlobalModal;
