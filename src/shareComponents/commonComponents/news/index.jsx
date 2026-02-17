import React from "react";
import { Col, Row } from "react-bootstrap";
import styles from "./news.module.css";

const News = () => {
  return (
    <div className={styles.mainNewsContainer}>
      <Row className={styles.mainHeaderRow}>
        <Col
          sm={12}
          md={6}
          lg={6}
          className={`d-flex justify-content-start align-items-center ${styles.newsHeadingStyles}`}
        >
          News
        </Col>
        <Col
          sm={12}
          md={6}
          lg={6}
          className={`d-flex justify-content-end align-items-center ${styles.newsViewAll}`}
        >
          View All
        </Col>
      </Row>
    </div>
  );
};

export default News;
