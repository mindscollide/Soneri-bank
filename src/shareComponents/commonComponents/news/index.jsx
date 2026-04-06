import React, { useEffect, useState, useCallback, useRef } from "react";
import { Col, Row } from "react-bootstrap";
import styles from "./news.module.css";
import { Input } from "antd";
import tresmarkIcon from "../../../assets/icons/tress-news.png";
import dowjhonesIcon from "../../../assets/icons/dowjhones-news.png";
import cnbcIcon from "../../../assets/icons/cnbc-news.png";
import tresmarkImg from "../../../assets/img/tresmarkImg.png";
import cnbcImg from "../../../assets/img/cnbcImg.png";
import dowjonesImg from "../../../assets/img/dowjonesImg.png";
import { formatDateTimeForNews } from "../../../utils/timeFunction";
import { useDispatch, useSelector } from "react-redux";
import {
  GetNewsDetailsByIDApi,
  GetNewsHeadlinesApi,
} from "../../../store/actions/WatchlistAction";
import GlobalModal from "../elements/globalModal/Modal";
import { convertCurrentTimeZone } from "../utils/timeFunction";
import { clearGetNewsDetailsByID } from "../../../store/slicers/watchListSlicer/WatchListSlicer";
import SectionLoader from "../../elements/soneriLoader/SectionLoader";
import dayjs from "dayjs";

const News = () => {
  // ✅ This is the ONLY change needed in News.jsx
  // On mount: unsubscribes all other topics, subscribes REAL_TIME_FEED_NEWS
  // On unmount: unsubscribes REAL_TIME_FEED_NEWS
  // useMqttTopics(["REAL_TIME_FEED_NEWS"]);
  const dispatch = useDispatch();

  // Map icons to their source IDs
  const sourceIdMap = {
    cnbc: 3,
    tresmark: 4,
    dowjones: 8,
  };

  const newsSourceIconMap = {
    3: cnbcImg,
    4: tresmarkImg,
    8: dowjonesImg,
  };

  // Track each icon's state independently
  const [activeStates, setActiveStates] = useState({
    tresmark: true,
    dowjones: true,
    cnbc: true,
  });

  const [searchVal, setSearchVal] = useState("");
  const [newsByIdModal, setNewsByIdModal] = useState(false);
  const [newsList, setNewsList] = useState([]);
  const [sRow, setSRow] = useState(0);
  const [recordsLength, setRecordLength] = useState(0);
  const debounceRef = useRef(null);
  const scrollRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newsById, setNewsById] = useState("");
  // const [loadingNewsHeadline, setLoadingNewsHeadline] = useState(true);

  // GlobalState
  const GetNewsHeadlines = useSelector(
    (state) => state.WatchListReducer.GetNewsHeadlines
  );
  const GetNewsHeadlinesLoading = useSelector(
    (state) => state.WatchListReducer.GetNewsHeadlinesLoading
  );

  const GetNewsDetailsByID = useSelector(
    (state) => state.WatchListReducer.GetNewsDetailsByID
  );
  const realTimeNewsFeed = useSelector(
    (state) => state.RealtimeActionsSlice.realTimeNewsFeed
  );

  // Function to get active source IDs based on active states
  const getActiveSourceIds = useCallback(() => {
    const activeIds = [];

    if (activeStates.tresmark) activeIds.push(sourceIdMap.tresmark);
    if (activeStates.dowjones) activeIds.push(sourceIdMap.dowjones);
    if (activeStates.cnbc) activeIds.push(sourceIdMap.cnbc);

    return activeIds;
  }, [activeStates]);

  useEffect(() => {
    setNewsById("");
    setNewsByIdModal(false);
    return () => {
      dispatch(clearGetNewsDetailsByID());
    };
  }, []);

  useEffect(() => {
    if (GetNewsDetailsByID && GetNewsDetailsByID.newsDetail !== null) {
      setNewsById(GetNewsDetailsByID.newsDetail);
      setNewsByIdModal(true);
    }
  }, [GetNewsDetailsByID]);

  // Function to fetch news with current filters
  const fetchNews = useCallback(
    (searchText = "", startRow = 0) => {
      const activeSourceIds = getActiveSourceIds();

      if (activeSourceIds.length === 0) {
        setNewsList([]);
        return;
      }

      const Data = {
        NewsSourceIDs: activeSourceIds,
        length: 10,
        sRow: startRow,
        SearchText: searchText,
        FromDate: "",
        ToDate: "",
      };

      dispatch(GetNewsHeadlinesApi({ Data }));
    },
    [dispatch, getActiveSourceIds]
  );

  // Refetch when active states change
  useEffect(() => {
    setNewsList([]);
    setSRow(0);
    setRecordLength(0);
    setIsLoading(false);
    fetchNews(searchVal, 0);
  }, [activeStates]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);
  useEffect(() => {
    if (GetNewsHeadlines !== null) {
      const { newsList: newData, totalCount } = GetNewsHeadlines;

      if (sRow === 0) {
        // 🔥 first load OR search OR filter
        setNewsList(newData);
      } else {
        // 🔥 append on scroll
        // setNewsList((prev) => [...prev, ...newData]);

        setNewsList((prev) => {
          const combined = [...prev, ...newData];

          const unique = Array.from(
            new Map(combined.map((item) => [item.newsID, item])).values()
          );

          return unique;
        });
      }

      setSRow((prev) => prev + newData.length);
      setRecordLength(totalCount);
      setIsLoading(false); // ✅ reset loading
    }
  }, [GetNewsHeadlines]);

  // Handle icon toggle
  const toggleActive = (key) => {
    setActiveStates((prev) => {
      const newState = {
        ...prev,
        [key]: !prev[key],
      };

      // Log the active source IDs after toggle (for debugging)
      const activeIds = [];
      if (newState.tresmark) activeIds.push(sourceIdMap.tresmark);
      if (newState.dowjones) activeIds.push(sourceIdMap.dowjones);
      if (newState.cnbc) activeIds.push(sourceIdMap.cnbc);

      console.log("Active Source IDs:", activeIds);

      return newState;
    });
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchVal(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.length >= 3) {
      debounceRef.current = setTimeout(() => {
        setNewsList([]);
        setSRow(0);
        fetchNews(value, 0);
      }, 500);
    } else if (value.length === 0) {
      setNewsList([]);
      setSRow(0);
      fetchNews("", 0);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (searchVal.length >= 3 || searchVal.length === 0) {
        fetchNews(searchVal);
      }
    }
  };

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
    // API for Search News By Id
    const Data = { NewsID: Number(newsID) };
    dispatch(GetNewsDetailsByIDApi({ Data }));
  };

  const handleScroll = useCallback(
    (e) => {
      const { scrollTop, scrollHeight, clientHeight } = e.target;

      if (scrollHeight <= clientHeight) return;

      const isBottom = scrollTop + clientHeight >= scrollHeight - 20;

      if (isBottom && !isLoading) {
        if (recordsLength === newsList.length) return;

        setIsLoading(true); // ✅ VERY IMPORTANT

        const Data = {
          NewsSourceIDs: getActiveSourceIds(),
          length: 10, // ✅ small l
          sRow: sRow,
          SearchText: searchVal,
          FromDate: "",
          ToDate: "",
        };

        dispatch(GetNewsHeadlinesApi({ Data }));
      }
    },
    [
      isLoading,
      recordsLength,
      newsList.length,
      sRow,
      searchVal,
      getActiveSourceIds,
      dispatch,
    ]
  );

  const handleClickViewAll = () => {
    window.open("/SONERI/allnews", "_blank");
  };

  const handleCloseModal = () => {
    setNewsByIdModal(false);
    setNewsById(""); // ✅ clear local state
    dispatch(clearGetNewsDetailsByID()); // ✅ clear redux
  };

  // Realtime work
  useEffect(() => {
    if (realTimeNewsFeed !== null) {
      try {
        const incomingNews = realTimeNewsFeed.News;

        setNewsList((prev) => {
          // ❌ duplicate
          const alreadyExists = prev.some(
            (item) => item.newsID === incomingNews.NewsID
          );

          if (alreadyExists) return prev;

          // ✅ normalize incoming structure to match your UI
          const formattedNews = {
            newsID: incomingNews.NewsID,
            newsSourceID: incomingNews.NewsSourceID,
            headline: incomingNews.Headline,
            content: incomingNews.Content,
            newsDateTime: incomingNews.NewsDateTime,
          };

          // ✅ add on top
          return [formattedNews, ...prev];
        });
        dispatch(setClearNewsMQTT());
      } catch (error) {
        console.log(error);
      }
    }
  }, [realTimeNewsFeed]);

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
            <div className={styles.newsViewAll} onClick={handleClickViewAll}>
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
              onChange={handleSearchChange}
              onKeyDown={handleKeyPress}
              value={searchVal}
              allowClear
            />
          </Col>
          <Col sm={12} md={6} lg={6} className={`d-flex justify-content-end `}>
            <div className="d-flex align-items-center">
              <button
                className={`news-toggle-button ${
                  activeStates.tresmark ? "active" : "inactive"
                }`}
                onClick={() => toggleActive("tresmark")}
                title="Toggle Tresmark News"
              >
                <img src={tresmarkIcon} alt="Tresmark" />
              </button>
              <button
                className={`news-toggle-button ${
                  activeStates.dowjones ? "active" : "inactive"
                }`}
                onClick={() => toggleActive("dowjones")}
                title="Toggle Dow Jones News"
              >
                <img src={dowjhonesIcon} alt="Dow Jhones" />
              </button>
              <button
                onClick={() => toggleActive("cnbc")}
                className={`news-toggle-button ${
                  activeStates.cnbc ? "active" : "inactive"
                }`}
                title="Toggle CNBC News"
              >
                <img src={cnbcIcon} alt="SNBC" />
              </button>
            </div>
          </Col>
        </Row>
        <Row>
          <Col lg={12}>
            <div
              onScroll={handleScroll}
              ref={scrollRef}
              className={styles.newsScrollArea}
            >
              {getActiveSourceIds().length === 0 ? (
                <div className="text-center p-3 text-muted">
                  Please select at least one news source
                </div>
              ) : (
                Object.keys(groupedNews)
                  .sort((a, b) => new Date(b) - new Date(a))
                  .map((date) => (
                    <div key={date}>
                      <div className={styles.dateHeader}>{date}</div>

                      {groupedNews[date].map((item) => (
                        <div key={item.newsID} className={styles.newsRow}>
                          <div className={styles.newsTime}>{item.time}</div>

                          <div className={styles.newsIcon}>
                            {item.newsSourceID === 3 ? (
                              <img src={cnbcImg} alt="CNBC Icon" />
                            ) : item.newsSourceID === 4 ? (
                              <img src={tresmarkImg} alt="Tresmark Icon" />
                            ) : item.newsSourceID === 8 ? (
                              <img src={dowjonesImg} alt="Dowjones Icon" />
                            ) : (
                              <img src={tresmarkImg} alt="Tresmark Icon" />
                            )}
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
                  ))
              )}
              {/* Initial / filter / search loader */}
              {GetNewsHeadlinesLoading && sRow === 0 ? (
                <SectionLoader />
              ) : (
                getActiveSourceIds().length > 0 &&
                newsList.length === 0 && (
                  <div className="text-center p-3 text-muted">
                    No news available
                  </div>
                )
              )}
            </div>
          </Col>
        </Row>
      </div>

      <GlobalModal
        show={newsByIdModal}
        onHide={handleCloseModal}
        size={"lg"}
        centered={true}
        footerClassName={"d-block border-0"}
        bodyClassName={"newsModal"}
        // modalHeader={}
        modalBody={
          <div className={styles.mainContainer}>
            <Row>
              <Col sm={12} md={6} lg={6}>
                <div className={`${styles.headerRow}`}>News</div>
                <span className={styles.modalDateStyle}>
                  {newsById.createdOn &&
                    dayjs(convertCurrentTimeZone(newsById.createdOn)).format(
                      "DD-MMM-YYYY h:mm A"
                    )}
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
                  X
                </div>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col className="d-flex align-items-center gap-2">
                <span>
                  {newsById.newsSourceID && (
                    <img
                      src={newsSourceIconMap[newsById.newsSourceID]}
                      alt="source"
                      style={{ width: "40px", height: "40px" }}
                    />
                  )}
                </span>
                <span className={styles.modalTitle}>{newsById.headline}</span>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col
                sm={12}
                md={12}
                lg={12}
                className={styles.modalDetailWithScroll}
              >
                {newsById.content}
              </Col>
            </Row>
          </div>
        }
      />
      {isLoading && (
        <div className="text-center p-2 text-muted">Loading more news...</div>
      )}
    </>
  );
};

export default News;
