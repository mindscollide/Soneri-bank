import React, { useEffect, useMemo, useState } from "react";
import styles from "./FwdCalculator.module.css";
import Select from "react-select";
import InputField from "../../shareComponents/commonComponents/elements/inputField/InputField";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CustomButton from "../../shareComponents/commonComponents/elements/globalButton/button";
import { NumericFormat } from "react-number-format";
import {
  getAllTreasuryInstrumentsApi,
  GetCalculateTenorSwapAndForwardRateApi,
} from "../../store/actions/WatchlistAction";
import SelectDropdown from "../../shareComponents/commonComponents/elements/selectDropdown/SelectDropdown";
import { set } from "lodash";

// Import Export Options
const options = [
  {
    label: "Export",
    value: 1,
  },
  {
    label: "Import",
    value: 2,
  },
];

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);

const addDays = (date, days) => {
  const updatedDate = new Date(date);
  updatedDate.setDate(updatedDate.getDate() + Number(days || 0));
  return updatedDate;
};

const FwdCalculator = () => {
  const GetAllInstrumentForTreasury = useSelector(
    (state) => state.WatchListReducer.GetAllInstrumentForTreasury,
  );

  const ResultFWDRates = useSelector(
    (state) => state.WatchListReducer.GetCalculateTenorSwapAndForwardRate,
  );

  console.log(ResultFWDRates, "ResultFWDRatesResultFWDRates");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [listOfCurrencies, setListOfCurrencies] = useState([]);
  const [currency, setCurrency] = useState(null);
  const [transactionType, setTransactionType] = useState(null);
  const [readyRate, setReadyRate] = useState("");
  const [tenor, setTenor] = useState(0);
  const [swap, setSwap] = useState("0.00");
  const [calculatedRate, setCalculatedRate] = useState("");

  useEffect(() => {
    dispatch(getAllTreasuryInstrumentsApi({ navigate }));
  }, []);

  useEffect(() => {
    if (GetAllInstrumentForTreasury !== null) {
      try {
        const { forwardInstruments } = GetAllInstrumentForTreasury;
        if (forwardInstruments.length > 0) {
          let currenciesList = forwardInstruments.map((item) => ({
            value: item.instrumentID,
            label: `${item.instrumentName}PKR`,
          }));
          setCurrency(currenciesList[0]);
          setListOfCurrencies(currenciesList);
          setTransactionType(options[0]);
        }
      } catch (error) {
        console.error("Error processing GetAllInstrumentForTreasury:", error);
      }
    }
  }, [GetAllInstrumentForTreasury]);

  useEffect(() => {
    if (ResultFWDRates !== null) {
      try {
        const { forwardRate = 0, readyRate = 0, swap = 0 } = ResultFWDRates;
        setSwap(swap.toFixed(4));
        setReadyRate(readyRate);
        setCalculatedRate(forwardRate);
      } catch (error) {}
    }
  }, [ResultFWDRates]);

  const maturityDate = useMemo(() => {
    return formatDate(addDays(new Date(), tenor));
  }, [tenor]);

  const handleCalculateRate = () => {
    let Data = {
      IsBuySide: transactionType.value === 1 ? true : false,
      TenorDays: Number(tenor),
      InstrumentName: currency.label.slice(0, -3),
      InstrumentID: currency.value,
    };
    dispatch(GetCalculateTenorSwapAndForwardRateApi({ Data }));
    // const ready = Number(readyRate);
    // const swapValue = Number(swap);

    // if (!Number.isFinite(ready) || !Number.isFinite(swapValue)) {
    //   setCalculatedRate("0.00");
    //   return;
    // }

    // const finalRate =
    //   transactionType === "export" ? ready + swapValue : ready - swapValue;

    // setCalculatedRate(finalRate.toFixed(2));
  };

  const handleChangeTenor = (event) => {
    console.log(event, "eventeventevent");
    const { value } = event.target;
    setTenor(value);
  };

  const handleNumberChange = (setter) => (event) => {
    const value = event.target.value;

    if (/^-?\d*\.?\d*$/.test(value)) {
      setter(value);
    }
  };

  return (
    <div className={styles.container}>
      <section className={styles.calculator}>
        <header className={styles.header}>
          <h2 className={styles.title}>FWD Calculator</h2>

          <CustomButton
            value={"Calculate Rate"}
            onClick={handleCalculateRate}
            className={styles.calculateButton}
          />
        </header>

        <div className={styles.content}>
          <div className={styles.formSection}>
            <div className={styles.currencyRow}>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor='currency'>
                  Currency
                </label>

                <SelectDropdown
                  options={listOfCurrencies}
                  value={currency}
                  onChange={setCurrency}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label
                  className={`${styles.label} ${styles.hiddenLabel}`}
                  htmlFor='transactionType'>
                  Transaction Type
                </label>

                <SelectDropdown
                  options={options}
                  value={transactionType}
                  onChange={setTransactionType}
                />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor='readyRate'>
                Ready
              </label>
              <NumericFormat
                applyClass={"CalculatorTextfield"}
                customInput={InputField}
                disabled={true}
                value={readyRate}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor='tenor'>
                Tenor
              </label>

              <div className={styles.tenorField}>
                <NumericFormat
                  applyClass={"CalculatorTextfield"}
                  customInput={InputField}
                  onChange={handleChangeTenor}
                  value={tenor}
                />

                <div className={styles.dateDisplay}>{maturityDate}</div>
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor='swap'>
                Swap
              </label>
              <NumericFormat
                applyClass={"CalculatorTextfield"}
                customInput={InputField}
                disabled={true}
                value={swap}
              />
            </div>
          </div>

          <div className={styles.resultWrapper}>
            <div className={styles.resultBox}>{calculatedRate}</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FwdCalculator;
