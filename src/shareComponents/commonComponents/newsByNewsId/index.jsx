import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearGetNewsDetailsByID,
  setNewsByNewsIdViewModal,
} from "../../../store/slicers/watchListSlicer/WatchListSlicer";
import styles from "./newsByNewsId.module.css";
import dayjs from "dayjs";
import { convertCurrentTimeZone } from "../utils/timeFunction";
import { useState } from "react";
import tresmarkIcon from "../../../assets/icons/tress-news.png";
import dowjhonesIcon from "../../../assets/icons/dowjhones-news.png";
import cnbcIcon from "../../../assets/icons/cnbc-news.png";
import tresmarkImg from "../../../assets/img/tresmarkImg.png";
import cnbcImg from "../../../assets/img/cnbcImg.png";
import dowjonesImg from "../../../assets/img/dowjonesImg.png";
import GlobalModal from "../elements/globalModal/Modal";
import { Col, Row } from "react-bootstrap";
import { convertToHTML } from "../../../utils/converts";

const NEWS_SOURCES = {
  cnbc: { id: 3, img: cnbcImg, icon: cnbcIcon },
  tresmark: { id: 4, img: tresmarkImg, icon: tresmarkIcon },
  dowjones: { id: 8, img: dowjonesImg, icon: dowjhonesIcon },
};
const NewsByNewsId = () => {
  const dispatch = useDispatch();

  const [newsDetails, setNewsDetails] = useState(null);
  const viewNewsModal = useSelector(
    (state) => state.WatchListReducer.NewsByNewsIdViewModal
  );
  const GetNewsDetailsByID = useSelector(
    (s) => s.WatchListReducer.GetNewsDetailsByID
  );
  useEffect(() => {
    if (GetNewsDetailsByID !== null) {
      try {
        const { newsDetail } = GetNewsDetailsByID;

        setNewsDetails(newsDetail);
      } catch (error) {
        console.log(error);
      }
    }
  }, [GetNewsDetailsByID]);

  const handleCloseModal = () => {
    dispatch(setNewsByNewsIdViewModal(false));
    setNewsDetails(null);
    dispatch(clearGetNewsDetailsByID());
  };
  return (
    <>
      <GlobalModal
        show={viewNewsModal}
        size="lg"
        centered
        footerClassName="d-block border-0"
        bodyClassName="newsModal"
        onHide={handleCloseModal}
        modalBody={
          <div className={styles.mainContainer}>
            <Row>
              <Col sm={12} md={6} lg={6}>
                <div className={styles.headerRow}>News</div>
                <span className={styles.modalDateStyle}>
                  {newsDetails?.createdOn &&
                    dayjs(
                      convertCurrentTimeZone(newsDetails?.createdOn)
                    ).format("DD-MMM-YYYY h:mm A")}
                </span>
              </Col>
              <Col
                sm={12}
                md={6}
                lg={6}
                className="d-flex justify-content-end align-items-center"
              >
                <div
                  className="cursor-pointer fw-bold"
                  onClick={handleCloseModal}
                >
                  <i className="icon-close" />
                </div>
              </Col>
            </Row>

            <Row className="mt-3">
              <Col className="d-flex align-items-center gap-2">
                <img
                  src={
                    NEWS_SOURCES[
                      Object.keys(NEWS_SOURCES).find(
                        (k) => NEWS_SOURCES[k].id === newsDetails?.newsSourceID
                      )
                    ]?.img ?? tresmarkImg
                  }
                  alt="source"
                  style={{ width: 40, height: 40 }}
                />
                <span className={styles.modalTitle}>
                  {newsDetails?.headline}
                </span>
              </Col>
            </Row>

            <Row className="mt-3">
              <Col sm={12} className={styles.modalDetailWithScroll}>
                {newsDetails?.newsSourceID === 4 ? (
                  <p
                    dangerouslySetInnerHTML={{ __html: newsDetails?.content }}
                  ></p>
                ) : newsDetails?.newsSourceID === 3 ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: convertToHTML(newsDetails?.content),
                    }}
                  ></div>
                ) : (
                  <>
                    {" "}
                    {/* Use a div with the pre-wrap styling instead of dangerouslySetInnerHTML */}
                    <div className={styles.newsContentBody}>
                      {newsDetails?.content}
                    </div>{" "}
                  </>
                )}
              </Col>
            </Row>
          </div>
        }
      />
    </>
  );
};

export default NewsByNewsId;
