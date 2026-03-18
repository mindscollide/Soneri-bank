import React, { useEffect, useState, useCallback, useRef } from "react";
import { Col, Row } from "react-bootstrap";
import styles from "./allNews.module.css";
import tresmarkIcon from "../../assets/icons/tress-news.png";
import dowjhonesIcon from "../../assets/icons/dowjhones-news.png";
import mintIcon from "../../assets/icons/mint-news.png";
import tresmarkImg from "../../assets/img/tresmarkImg.png";
import { useDispatch, useSelector } from "react-redux";
import {
  GetNewsDetailsByIDApi,
  GetNewsHeadlinesApi,
} from "../../store/actions/WatchlistAction";
import { formatDateTimeForNews } from "../../utils/timeFunction";
import GlobalModal from "../../shareComponents/commonComponents/elements/globalModal/Modal";
import CustomButton from "../../shareComponents/commonComponents/elements/globalButton/button";
// import DatePicker from "react-multi-date-picker";
import { DatePicker, Input } from "antd";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

const News = () => {
  const dispatch = useDispatch();

  // Map icons to their source IDs
  const sourceIdMap = {
    tresmark: 3,
    dowjones: 4,
    mint: 8,
  };

  // Track each icon's state independently
  const [activeStates, setActiveStates] = useState({
    tresmark: true,
    dowjones: true,
    mint: true,
  });

  const [allNews, setAllNews] = useState({
    dateFrom: {
      value: null, // ✅ no default
      errorMessage: "",
      errorStatus: false,
    },
    dateTo: {
      value: null,
      errorMessage: "",
      errorStatus: false,
    },
  });

  const [searchVal, setSearchVal] = useState("");
  const [newsByIdModal, setNewsByIdModal] = useState(false);
  const [newsList, setNewsList] = useState([]);
  const [sRow, setSRow] = useState(0);
  const [recordsLength, setRecordLength] = useState(0);
  const debounceRef = useRef(null);
  const scrollRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const GetNewsHeadlines = useSelector(
    (state) => state.WatchListReducer.GetNewsHeadlines
  );
  const GetNewsDetailsByID = useSelector(
    (state) => state.WatchListReducer.GetNewsDetailsByID
  );

  // Function to get active source IDs based on active states
  const getActiveSourceIds = useCallback(() => {
    const activeIds = [];

    if (activeStates.tresmark) activeIds.push(sourceIdMap.tresmark);
    if (activeStates.dowjones) activeIds.push(sourceIdMap.dowjones);
    if (activeStates.mint) activeIds.push(sourceIdMap.mint);

    return activeIds;
  }, [activeStates]);

  const formatToUTCString = (date, type) => {
    if (!date) return "";

    if (type === "start") {
      return date.startOf("day").utc().format("YYYYMMDDHHmmss");
    }

    if (type === "end") {
      return date.endOf("day").utc().format("YYYYMMDDHHmmss");
    }

    return date.utc().format("YYYYMMDDHHmmss");
  };

  const handleSearch = useCallback(
    ({ searchText = searchVal, startRow = 0 } = {}) => {
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
        FromDate: formatToUTCString(allNews.dateFrom.value),
        ToDate: formatToUTCString(allNews.dateTo.value),
      };

      dispatch(GetNewsHeadlinesApi({ Data }));
    },
    [dispatch, getActiveSourceIds, searchVal, allNews]
  );
  // Refetch when active states change
  useEffect(() => {
    setNewsList([]);
    setSRow(0);
    setRecordLength(0);
    setIsLoading(false);

    handleSearch({ searchText: searchVal, startRow: 0 });
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
        setNewsList((prev) => [...prev, ...newData]);
      }

      setSRow((prev) => prev + newData?.length);
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
      if (newState.mint) activeIds.push(sourceIdMap.mint);

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
        handleSearch({ searchText: value, startRow: 0 });
      }, 500);
    } else if (value.length === 0) {
      setNewsList([]);
      setSRow(0);
      handleSearch({ searchText: value, startRow: 0 });
    }
  };

  // Handle Enter key press
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      if (searchVal.length >= 3 || searchVal.length === 0) {
        setNewsList([]);
        setSRow(0);
        handleSearch({ searchText: searchVal, startRow: 0 });
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
    setNewsByIdModal(true);
    console.log("NewsID:", newsID);
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
          FromDate: allNews.dateFrom.value
            ? allNews.dateFrom.value.format("YYYY-MM-DD")
            : "",
          ToDate: allNews.dateTo.value
            ? allNews.dateTo.value.format("YYYY-MM-DD")
            : "",
        };

        handleSearch({ startRow: sRow });
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
      allNews,
      handleSearch,
    ]
  );
  useEffect(() => {
    if (GetNewsDetailsByID !== null) {
      setNewsByIdModal(true);
    }
  }, [GetNewsDetailsByID]);

  const handleDateChange = (fieldName, date) => {
    setAllNews((prev) => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        value: date,
        errorMessage: "",
        errorStatus: false,
      },
    }));

    // Validation
    if (
      fieldName === "dateFrom" &&
      allNews.dateTo.value &&
      date?.isAfter(allNews.dateTo.value)
    ) {
      setAllNews((prev) => ({
        ...prev,
        dateFrom: {
          ...prev.dateFrom,
          errorMessage: "Start date cannot be after end date.",
          errorStatus: true,
        },
      }));
    }
  };

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
            All News
          </Col>
        </Row>
        <Row className={`${styles.searchRow}`}>
          <Col
            sm={12}
            md={2}
            lg={2}
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
          <Col
            sm={12}
            md={2}
            lg={2}
            className={`d-flex justify-content-start `}
          >
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
                onClick={() => toggleActive("mint")}
                className={`news-toggle-button ${
                  activeStates.mint ? "active" : "inactive"
                }`}
                title="Toggle Mint News"
              >
                <img src={mintIcon} alt="Mint" />
              </button>
            </div>
          </Col>

          <Col
            lg={8}
            md={8}
            sm={12}
            className="d-flex align-items-center justify-content-end pe-4"
          >
            <span className="fs-normal fw-bold nowrap me-1">
              Search by date:
            </span>
            <DatePicker
              placeholder="Start date"
              onChange={(date, dateString) =>
                handleDateChange("dateFrom", date, dateString)
              }
              value={allNews.dateFrom.value}
              disabledDate={(current) => {
                return (
                  (current &&
                    allNews.dateTo.value &&
                    current.isAfter(allNews.dateTo.value)) ||
                  current.isAfter(dayjs(), "day")
                );
              }}
              format="YYYY-MM-DD" // or whatever format you need
              className={styles["Tradecount-Datepicker-left"]}
              allowClear={true}
              // If you want to disable manual input:
              inputReadOnly={true}
            />
            <label className={styles["Tradecount-date-to"]}>to</label>

            <DatePicker
              placeholder="End Date"
              onChange={(date, dateString) =>
                handleDateChange("dateTo", date, dateString)
              }
              value={allNews.dateTo.value}
              disabledDate={(current) => {
                return (
                  current &&
                  // ❌ disable dates before start date
                  ((allNews.dateFrom.value &&
                    current.isBefore(allNews.dateFrom.value, "day")) ||
                    // ❌ disable future dates
                    current.isAfter(dayjs(), "day"))
                );
              }}
              format="YYYY-MM-DD"
              className={styles["Tradecount-Datepicker-right"]}
              allowClear={true}
              inputReadOnly={true}
            />
            <CustomButton
              value={"Search"}
              applyClass="searchAllNews"
              onClick={() => {
                setNewsList([]);
                setSRow(0);
                handleSearch({ startRow: 0 });
              }}
            />
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
                  ))
              )}
              {getActiveSourceIds().length > 0 && newsList.length === 0 && (
                <div className="text-center p-3 text-muted">
                  No news available for selected sources
                </div>
              )}
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
      {isLoading && (
        <div className="text-center p-2 text-muted">Loading more news...</div>
      )}
    </>
  );
};

export default News;
