import React, { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";
import styles from "./news.module.css";
import { Input } from "antd";
import tresmarkIcon from "../../../assets/icons/tress-news.png";
import dowjhonesIcon from "../../../assets/icons/dowjhones-news.png";
import mintIcon from "../../../assets/icons/mint-news.png";
import tresmarkImg from "../../../assets/img/tresmarkImg.png";
import { formatDateTimeForNews } from "../../../utils/timeFunction";
import { useDispatch, useSelector } from "react-redux";
import {
  GetNewsDetailsByIDApi,
  GetNewsHeadlinesApi,
} from "../../../store/actions/WatchlistAction";
import GlobalModal from "../elements/globalModal/Modal";
import CustomButton from "../elements/globalButton/button";

const News = () => {
  const dispatch = useDispatch();
  // Track each icon's state independently
  const [activeStates, setActiveStates] = useState({
    tresmark: true,
    dowjones: true,
    mint: true,
  });

  const [newsByIdModal, setNewsByIdModal] = useState(false);

  const [newsList, setNewsList] = useState([]);

  const GetNewsHeadlines = useSelector(
    (state) => state.WatchListReducer.GetNewsHeadlines
  );
  const GetNewsDetailsByID = useSelector(
    (state) => state.WatchListReducer.GetNewsDetailsByID
  );
  const toggleActive = (key) => {
    setActiveStates((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  useEffect(() => {
    const Data = {
      NewsSourceIDs: [3, 4, 8],
      length: 10,
      sRow: 0,
      SearchText: "",
      FromDate: "",
      ToDate: "",
    };
    dispatch(GetNewsHeadlinesApi({ Data }));
  }, []);

  useEffect(() => {
    setNewsList(GetNewsHeadlines?.newsList || []);
  }, [GetNewsHeadlines]);

  const groupNewsByDate = (newsList) => {
    const grouped = {};

    newsList.forEach((news) => {
      const { date, time } = formatDateTimeForNews(news.newsDateTime);

      if (!grouped[date]) {
        grouped[date] = [];
      }

      grouped[date].push({
        ...news,
        time,
      });
    });

    return grouped;
  };
  const groupedNews = groupNewsByDate(newsList);

  const handleClickNewsHeading = (newsID) => {
    setNewsByIdModal(true);
    console.log("NewsID:", newsID);
    // API for Search News  By Id
    const Data = { NewsID: Number(newsID) };
    dispatch(GetNewsDetailsByIDApi({ Data }));
  };

  useEffect(() => {
    if (GetNewsDetailsByID !== null) {
      setNewsByIdModal(true);
    }
  }, [GetNewsDetailsByID]);
  return (
    <>
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
            className={`d-flex justify-content-end align-items-center `}
          >
            <div className={styles.newsViewAll}>
              <i className="icon-external-link color-blue fs-6 pe-2"></i>
              View All
            </div>
          </Col>
        </Row>
        <Row className={`${styles.searchRow}`}>
          <Col
            sm={12}
            md={6}
            lg={6}
            className={`d-flex justify-content-start align-items-center`}
          >
            <Input
              placeholder="Search News"
              className={styles.SearchBoxStyle}
            />
          </Col>
          <Col sm={12} md={6} lg={6} className={`d-flex justify-content-end `}>
            <div class="d-flex align-items-center">
              <button
                className={`news-toggle-button ${
                  !activeStates.tresmark && "active"
                }`}
                onClick={() => toggleActive("tresmark")}
              >
                <img src={tresmarkIcon} alt="Tresmark" />
              </button>
              <button
                className={`news-toggle-button ${
                  !activeStates.dowjones && "active"
                }`}
                onClick={() => toggleActive("dowjones")}
              >
                <img src={dowjhonesIcon} alt="Dow Jhones" />
              </button>
              <button
                onClick={() => toggleActive("mint")}
                className={`news-toggle-button ${
                  !activeStates.mint && "active"
                }`}
              >
                <img src={mintIcon} alt="Mint" />
              </button>
            </div>
          </Col>
        </Row>
        <Row>
          <Col lg={12}>
            <div className={styles.newsScrollArea}>
              {Object.keys(groupedNews)
                .sort((a, b) => new Date(b) - new Date(a))
                .map((date) => (
                  <div key={date}>
                    <div className={styles.dateHeader}>{date}</div>

                    {groupedNews[date].map((item) => (
                      <div key={item.newsID} className={styles.newsRow}>
                        <div className={styles.newsTime}>{item.time}</div>

                        <div className={styles.newsIcon}>
                          <img src={tresmarkImg} alt="" />
                        </div>

                        <div
                          className={styles.newsHeadline}
                          onClick={() => handleClickNewsHeading(item.newsID)}
                        >
                          {item.headline}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          </Col>
        </Row>
      </div>

      <GlobalModal
        show={newsByIdModal}
        centered={true}
        footerClassName={"d-block border-0"}
        bodyClassName={"b-0"}
        onHide={() => setNewsByIdModal(false)}
        modalBody={
          <div className={styles.mainContainer}>
            <Row className={styles.headerRow}>
              <Col sm={12} md={6} lg={6}>
                <div className="color-blue fw-bold">News</div>
                <span className="color-black fs-sm"> 18-Dec-2025 3:30 PM</span>
              </Col>
              <Col
                sm={12}
                md={6}
                lg={6}
                className="d-flex justify-content-end align-items-center"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => setNewsByIdModal(false)}
                >
                  X
                </div>
              </Col>
            </Row>
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
          </div>
        }
      />
    </>
  );
};

export default News;
