import React, { useEffect, useState, useRef, useCallback } from "react";
import { Col, Row } from "react-bootstrap";
import styles from "./allNews.module.css";
import tresmarkIcon from "../../assets/icons/tress-news.png";
import dowjhonesIcon from "../../assets/icons/dowjhones-news.png";
import cnbcIcon from "../../assets/icons/cnbc-news.png";
import tresmarkImg from "../../assets/img/tresmarkImg.png";
import cnbcImg from "../../assets/img/cnbcImg.png";
import dowjonesImg from "../../assets/img/dowjonesImg.png";
import { useDispatch, useSelector } from "react-redux";
import {
  GetNewsDetailsByIDApi,
  GetNewsHeadlinesApi,
} from "../../store/actions/WatchlistAction";
import { formatDateTimeForNews } from "../../utils/timeFunction";
import GlobalModal from "../../shareComponents/commonComponents/elements/globalModal/Modal";
import CustomButton from "../../shareComponents/commonComponents/elements/globalButton/button";
import { Input, DatePicker } from "antd";
import dayjs from "dayjs";
import {
  convertCurrentTimeZone,
  formatToUTCString,
} from "../../shareComponents/commonComponents/utils/timeFunction";
import { clearGetNewsDetailsByID } from "../../store/slicers/watchListSlicer/WatchListSlicer";

const NEWS_SOURCES = {
  cnbc: { id: 3, img: cnbcImg, icon: cnbcIcon },
  tresmark: { id: 4, img: tresmarkImg, icon: tresmarkIcon },
  dowjones: { id: 8, img: dowjonesImg, icon: dowjhonesIcon },
};

const News = () => {
  const dispatch = useDispatch();

  // ── Filters ─────────────────────────────────────────────────────────────
  const [searchVal, setSearchVal] = useState("");
  const [dateFrom, setDateFrom] = useState(null); // dayjs | null
  const [dateTo, setDateTo] = useState(null); // dayjs | null
  const [sources, setSources] = useState({
    cnbc: true,
    tresmark: true,
    dowjones: true,
  });

  // ── News list & pagination ───────────────────────────────────────────────
  const [newsList, setNewsList] = useState([]);
  const [sRow, setSRow] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // ── Modal ────────────────────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [newsDetail, setNewsDetail] = useState(null);

  // ── Refs (avoid stale closures in scroll handler) ────────────────────────
  const sRowRef = useRef(0);
  const totalCountRef = useRef(0);
  const newsListLenRef = useRef(0);
  const isLoadingRef = useRef(false);
  const debounceRef = useRef(null);
  const scrollRef = useRef(null);

  // keep refs in sync
  useEffect(() => {
    sRowRef.current = sRow;
  }, [sRow]);
  useEffect(() => {
    totalCountRef.current = totalCount;
  }, [totalCount]);
  useEffect(() => {
    newsListLenRef.current = newsList.length;
  }, [newsList]);
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // ── Redux ────────────────────────────────────────────────────────────────
  const GetNewsHeadlines = useSelector(
    (s) => s.WatchListReducer.GetNewsHeadlines
  );
  const GetNewsDetailsByID = useSelector(
    (s) => s.WatchListReducer.GetNewsDetailsByID
  );

  // ── Helpers ──────────────────────────────────────────────────────────────
  const getActiveSourceIds = () =>
    Object.entries(sources)
      .filter(([, active]) => active)
      .map(([key]) => NEWS_SOURCES[key].id);

  // FromDate → 00:00:00,  ToDate → 23:59:58
  const toFromUTC = (d) =>
    d ? formatToUTCString(d.startOf("day").toDate()) : "";
  const toToUTC = (d) =>
    d ? formatToUTCString(d.hour(23).minute(59).second(58).toDate()) : "";

  // ── Core fetch ───────────────────────────────────────────────────────────
  // Always pass everything explicitly — no hidden refs or defaults
  const fetchNews = useCallback(
    (params) => {
      const { search, startRow, activeIds, from, to } = params;

      if (activeIds.length === 0) {
        setNewsList([]);
        return;
      }

      dispatch(
        GetNewsHeadlinesApi({
          Data: {
            NewsSourceIDs: activeIds,
            length: 10,
            sRow: startRow,
            SearchText: search,
            FromDate: toFromUTC(from),
            ToDate: toToUTC(to),
          },
        })
      );
    },
    [dispatch]
  );

  // Shared helper: reset list and fetch from page 0
  const resetAndFetch = useCallback(
    (overrides = {}) => {
      setNewsList([]);
      setSRow(0);
      sRowRef.current = 0;
      setTotalCount(0);
      setIsLoading(false);

      fetchNews({
        search: overrides.search ?? searchVal,
        startRow: 0,
        activeIds: overrides.activeIds ?? getActiveSourceIds(),
        from: overrides.from ?? dateFrom,
        to: overrides.to ?? dateTo,
      });
    },
    [fetchNews, searchVal, sources, dateFrom, dateTo]
  );

  // ── Effects ──────────────────────────────────────────────────────────────

  // Initial load
  useEffect(() => {
    resetAndFetch();
    return () => {
      dispatch(clearGetNewsDetailsByID());
    };
  }, []);

  // Handle news list response
  useEffect(() => {
    if (!GetNewsHeadlines) return;
    const { newsList: newData, totalCount: count } = GetNewsHeadlines;

    setNewsList((prev) => {
      if (sRowRef.current === 0) return newData; // fresh fetch
      // infinite scroll — append & dedupe
      const combined = [...prev, ...newData];
      return Array.from(new Map(combined.map((n) => [n.newsID, n])).values());
    });

    const nextRow = sRowRef.current + newData.length;
    setSRow(nextRow);
    sRowRef.current = nextRow;

    setTotalCount(count);
    totalCountRef.current = count;

    setIsLoading(false);
    isLoadingRef.current = false;
  }, [GetNewsHeadlines]);

  // Handle news detail response
  useEffect(() => {
    if (GetNewsDetailsByID?.newsDetail) {
      setNewsDetail(GetNewsDetailsByID.newsDetail);
      setModalOpen(true);
    }
  }, [GetNewsDetailsByID]);

  // Cleanup debounce
  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    []
  );

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleSourceToggle = (key) => {
    const updated = { ...sources, [key]: !sources[key] };
    setSources(updated);
    const activeIds = Object.entries(updated)
      .filter(([, v]) => v)
      .map(([k]) => NEWS_SOURCES[k].id);
    resetAndFetch({ activeIds });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchVal(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length >= 3 || value.length === 0) {
      debounceRef.current = setTimeout(() => {
        resetAndFetch({ search: value });
      }, 500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      resetAndFetch({ search: searchVal });
    }
  };

  const handleSearchClick = () => {
    resetAndFetch({ search: searchVal, from: dateFrom, to: dateTo });
  };

  const handleDateFromChange = (date) => {
    setDateFrom(date);
  };

  const handleDateToChange = (date) => {
    setDateTo(date);
  };

  // Infinite scroll
  const handleScroll = useCallback(
    (e) => {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      const isBottom = scrollTop + clientHeight >= scrollHeight - 20;

      if (!isBottom || isLoadingRef.current) return;
      if (newsListLenRef.current >= totalCountRef.current) return;

      setIsLoading(true);
      isLoadingRef.current = true;

      dispatch(
        GetNewsHeadlinesApi({
          Data: {
            NewsSourceIDs: getActiveSourceIds(),
            length: 10,
            sRow: sRowRef.current,
            SearchText: searchVal,
            FromDate: toFromUTC(dateFrom),
            ToDate: toToUTC(dateTo),
          },
        })
      );
    },
    [dispatch, sources, searchVal, dateFrom, dateTo]
  );

  const handleNewsClick = (newsID) => {
    dispatch(GetNewsDetailsByIDApi({ Data: { NewsID: Number(newsID) } }));
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setNewsDetail(null);
    dispatch(clearGetNewsDetailsByID());
  };

  // ── Group news by date ───────────────────────────────────────────────────
  const groupNewsByDate = (list) => {
    const grouped = {};
    list.forEach((news) => {
      const { date, time } = formatDateTimeForNews(news.newsDateTime);
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push({ ...news, time });
    });
    return grouped;
  };

  const groupedNews = groupNewsByDate(newsList);
  const activeIds = getActiveSourceIds();
  const noSourceSelected = activeIds.length === 0;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <div className={styles.mainNewsContainer}>
        {/* Header */}
        <Row className={styles.mainHeaderRow}>
          <Col
            sm={12}
            md={6}
            lg={6}
            className={`d-flex justify-content-start align-items-center ${styles.newsHeadingStyles}`}>
            All News
          </Col>
        </Row>

        {/* Search & Filters */}
        <Row className={styles.searchRow}>
          {/* Text search */}
          <Col sm={12} md={2} lg={2} className='d-flex align-items-center'>
            <Input
              placeholder='Search News'
              className={styles.SearchBoxStyle}
              value={searchVal}
              onChange={handleSearchChange}
              onKeyDown={handleKeyPress}
              allowClear
            />
          </Col>

          {/* Source toggles */}
          <Col sm={12} md={2} lg={2} className='d-flex align-items-center'>
            {Object.entries(NEWS_SOURCES).map(([key, src]) => (
              <button
                key={key}
                className={`news-toggle-button ${
                  sources[key] ? "active" : "inactive"
                }`}
                onClick={() => handleSourceToggle(key)}
                title={`Toggle ${key} News`}>
                <img src={src.icon} alt={key} />
              </button>
            ))}
          </Col>

          {/* Date filters */}
          <Col
            lg={8}
            md={8}
            sm={12}
            className='d-flex align-items-center justify-content-end pe-4 gap-2'>
            <span className='fs-normal fw-bold nowrap'>Search by date:</span>

            <DatePicker
              placeholder='Start date'
              value={dateFrom}
              onChange={handleDateFromChange}
              disabledDate={(current) =>
                current &&
                ((dateTo && current.isAfter(dateTo, "day")) ||
                  current.isAfter(dayjs(), "day"))
              }
              allowClear
              inputReadOnly
            />

            <label className={styles["Tradecount-date-to"]}>to</label>

            <DatePicker
              placeholder='End date'
              value={dateTo}
              onChange={handleDateToChange}
              disabledDate={(current) =>
                current &&
                ((dateFrom && current.isBefore(dateFrom, "day")) ||
                  current.isAfter(dayjs(), "day"))
              }
              allowClear
              inputReadOnly
            />

            <CustomButton
              value='Search'
              applyClass='searchAllNews'
              onClick={handleSearchClick}
            />
          </Col>
        </Row>

        {/* News List */}
        <Row>
          <Col lg={12}>
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className={styles.newsScrollArea}>
              {noSourceSelected ? (
                <div className='text-center p-3 text-muted'>
                  Please select at least one news source
                </div>
              ) : newsList.length === 0 ? (
                <div className='text-center p-3 text-muted'>
                  No news available for selected sources
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
                            <img
                              src={
                                NEWS_SOURCES[
                                  Object.keys(NEWS_SOURCES).find(
                                    (k) =>
                                      NEWS_SOURCES[k].id === item.newsSourceID
                                  )
                                ]?.img ?? tresmarkImg
                              }
                              alt='source'
                            />
                          </div>
                          <div
                            className={styles.newsHeadline}
                            onClick={() => handleNewsClick(item.newsID)}>
                            {item.headline}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))
              )}

              {isLoading && (
                <div className='text-center p-2 text-muted'>
                  Loading more news...
                </div>
              )}
            </div>
          </Col>
        </Row>
      </div>

      {/* News Detail Modal */}
      <GlobalModal
        show={modalOpen}
        size='lg'
        centered
        footerClassName='d-block border-0'
        bodyClassName='newsModal'
        onHide={handleCloseModal}
        modalBody={
          newsDetail && (
            <div className={styles.mainContainer}>
              <Row>
                <Col sm={12} md={6} lg={6}>
                  <div className={styles.headerRow}>News</div>
                  <span className={styles.modalDateStyle}>
                    {dayjs(convertCurrentTimeZone(newsDetail.createdOn)).format(
                      "DD-MMM-YYYY h:mm A"
                    )}
                  </span>
                </Col>
                <Col
                  sm={12}
                  md={6}
                  lg={6}
                  className='d-flex justify-content-end align-items-center'>
                  <div
                    className='cursor-pointer fw-bold'
                    onClick={handleCloseModal}>
                    X
                  </div>
                </Col>
              </Row>

              <Row className='mt-3'>
                <Col className='d-flex align-items-center gap-2'>
                  <img
                    src={
                      NEWS_SOURCES[
                        Object.keys(NEWS_SOURCES).find(
                          (k) => NEWS_SOURCES[k].id === newsDetail.newsSourceID
                        )
                      ]?.img ?? tresmarkImg
                    }
                    alt='source'
                    style={{ width: 40, height: 40 }}
                  />
                  <span className={styles.modalTitle}>
                    {newsDetail.headline}
                  </span>
                </Col>
              </Row>

              <Row className='mt-3'>
                <Col sm={12} className={styles.modalDetailWithScroll}>
                  {newsDetail.content}
                </Col>
              </Row>
            </div>
          )
        }
      />
    </>
  );
};

export default News;
