import { Col, Row } from "react-bootstrap";
import { useErrorBoundary } from "react-error-boundary";
import "./ErrorBoundary.css";
import CustomButton from "../../commonComponents/elements/globalButton/button";
export const ErrorFallback = ({ error }) => {
  const { resetBoundary } = useErrorBoundary();
  console.log(error, "ErrorFallback");
  return (
    <section className="ErrorWrapperContainer">
      <Row>
        <Col
          sm={12}
          lg={12}
          md={12}
          className="d-flex justify-content-center align-items-center mb-2"
        ></Col>
        <Col
          sm={12}
          lg={12}
          md={12}
          className="d-flex justify-content-center align-items-center mb-3 error-heading"
        >
          {"Something went wrong"}
        </Col>

        <Col
          sm={12}
          lg={12}
          md={12}
          className="d-flex justify-content-center align-items-center "
        >
          <CustomButton
            applyClass={"TryAgainButton"}
            onClick={resetBoundary}
            value={"Try again"}
          />
        </Col>
      </Row>
    </section>
  );
};

export const logErrors = (error, info) => {
  console.log("logErrors error :", error);
  console.log("logErrors error :", JSON.stringify(info));
};
