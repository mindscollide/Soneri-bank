import Data from "./data.json";
export const generateData = (
  columnValue,
  tenors = [],
  instruments = [],
  forwardRates = [],
  discountRates = []
) => {
  let discountRatesResult = [];
  let forwardsRatesResult = [];

  console.log(tenors, "tenorstenorstenors");
  console.log(instruments, "tenorstenorstenors");
  console.log(forwardRates, "tenorstenorstenors");
  console.log(discountRates, "tenorstenorstenors");
  try {
    if (columnValue === 1) {
      discountRates.map((discValue, index) => {
        let findTenorName = tenors.find(
          (tenorsData) => tenorsData.tenorID === discValue.tenorID
        );
        let findInstrumentName = instruments?.find(
          (insturmentData) =>
            insturmentData.instrumentID === discValue.instrumentID
        );
        const discountRateValue = {
          key: `index ${index + 1}`,
          Tenor: findTenorName ? findTenorName.tenorName : "",
          TenorID: findTenorName ? findTenorName.tenorID : 0,
          tenorDays: findTenorName ? findTenorName.tenorDays : "",
          instrumentTitle: findInstrumentName
            ? findInstrumentName.instrumentName
            : discValue?.instrumentName
            ? discValue.instrumentName
            : "",
          InstrumentID: findInstrumentName
            ? findInstrumentName.instrumentID
            : discValue?.instumentID
            ? discValue?.instumentID
            : 0,
          value: discValue.rate,
        };

        discountRatesResult.push(discountRateValue);
      });
    } else if (columnValue === 2) {
      Data.discountRates.map((discValue, index) => {
        let findTenorName = Data.tenors.find(
          (tenorsData) => tenorsData.tenorID === discValue.tenorID
        );
        let findInstrumentName = Data.instruments.find(
          (insturmentData) =>
            insturmentData.instrumentID === discValue.instrumentID
        );

        const discountRateValue = {
          key: `index ${index + 1}`,
          Tenor: findTenorName ? findTenorName.tenorName : "",
          TenorID: findTenorName ? findTenorName.tenorID : 0,
          tenorDays: findTenorName ? findTenorName.tenorDays : "",
          instrumentTitle: findInstrumentName
            ? findInstrumentName.instrumentName
            : "",
          InstrumentID: findInstrumentName
            ? findInstrumentName.instrumentID
            : 0,
          [`${findInstrumentName.instrumentName.toLowerCase()}-rate`]:
            discValue.rate,
        };

        discountRatesResult.push(discountRateValue);
      });
    } else if (columnValue === 3) {
      // Dummy Data
      Data.forwardRates.map((forwData, index) => {
        let findTenorName = Data.tenors.find(
          (tenorsData) => tenorsData.tenorID === forwData.tenorID
        );
        let findInstrumentName = Data.instruments.find(
          (insturmentData) =>
            insturmentData.instrumentID === forwData.instrumentID
        );

        const forwardRateData = {
          key: `index ${index + 1}`,
          Tenor: findTenorName ? findTenorName.tenorName : "",
          TenorID: findTenorName ? findTenorName.tenorID : 0,
          tenorDays: findTenorName ? findTenorName.tenorDays : "",
          instrumentName: findInstrumentName
            ? findInstrumentName.instrumentName
            : "",
          InstrumentID: findInstrumentName
            ? findInstrumentName.instrumentID
            : 0,

          ask: forwData.ask,
          bid: forwData.bid,
        };

        forwardsRatesResult.push(forwardRateData);
      });
    } else if (columnValue === 4) {
      forwardRates.map((forwData, index) => {
        let findTenorName = tenors.find(
          (tenorsData) => tenorsData.tenorID === forwData.tenorID
        );
        let findInstrumentName = instruments.find(
          (insturmentData) =>
            insturmentData.instrumentID === forwData.instrumentID
        );

        const forwardRateData = {
          key: `index ${index + 1}`,
          Tenor: findTenorName ? findTenorName.tenorName : "",
          TenorID: findTenorName ? findTenorName.tenorID : 0,
          tenorDays: findTenorName ? findTenorName.tenorDays : "",
          instrumentName: findInstrumentName
            ? findInstrumentName.instrumentName
            : "",
          InstrumentID: findInstrumentName
            ? findInstrumentName.instrumentID
            : 0,

          ask: forwData.ask,
          bid: forwData.bid,
        };

        forwardsRatesResult.push(forwardRateData);
      });
    } else if (columnValue === 5) {
      const tenorMap = {};

      discountRates.forEach((discValue) => {
        const tenor = tenors.find((t) => t.tenorID === discValue.tenorID);

        const tenorID = tenor ? tenor.tenorID : discValue.tenorID;
        const instrumentName =
          discValue?.instrumentName || discValue.instrumentName || "";
        const instrumentID = discValue?.instumentID;

        if (!tenorMap[tenorID]) {
          tenorMap[tenorID] = {
            TenorID: tenorID,
            tenorDays: tenor?.tenorDays || "",
            Tenor: tenor?.tenorName || "",
          };
        }

        tenorMap[tenorID][`instrumentTitle_${instrumentName}`] = instrumentName;
        tenorMap[tenorID][`instumentID_${instrumentName}`] = instrumentID;
        tenorMap[tenorID][`${instrumentName}_rate`] = discValue.rate;
      });

      discountRatesResult = Object.values(tenorMap);
    }
  } catch (error) {
    console.log(error, "generateDatagenerateData");
  }
  console.log(discountRatesResult, forwardsRatesResult);

  return {
    discountRates: discountRatesResult,
    forwardsRates: forwardsRatesResult,
  };
};

/**
 * Creates dynamic columns for an Ant Design table based on provided data and type.
 *
 * @param {Array} data - The data used to generate columns, containing instrument information.
 * @param {number} value - Determines the type of columns to create (1 for Discount, others for Forwards).
 * @returns {Array} - An array of column configurations for the Ant Design table.
 */
export const createColumns = (
  data,
  value,
  InputFIeld,
  onInputChange,
  InputClassName
) => {
  let baseColumns;
  if (value === 3) {
    baseColumns = [
      {
        title: "", // Empty title for a merged header style
        dataIndex: "", // No data index for this parent column
        key: "", // Key for the parent column
        align: "", // Alignment (empty for this parent column)
        width: 80, // Set column width
        children: [
          {
            title: "Tenor", // Header name for the child column
            dataIndex: "Tenor", // Data key from the dataset for Tenor
            key: "tenor", // Unique key for the child column
            align: "center", // Center align the content
            width: 80, // Set column width
          },
        ],
      },
      {
        title: "", // Empty title for a merged header style
        dataIndex: "", // No data index for this parent column
        key: "", // Key for the parent column
        align: "", // Alignment (empty for this parent column)
        width: 80, // Set column width
        children: [
          {
            title: "Days", // Header name for the child column
            dataIndex: "tenorDays", // Data key from the dataset for Tenor
            key: "tenorDays", // Unique key for the child column
            align: "center", // Center align the content
            width: 80, // Set column width
          },
        ],
      },
    ];
  } else {
    // Base column that will always be present, containing the Tenor column
    baseColumns = [
      {
        title: "", // Empty title for a merged header style
        dataIndex: "", // No data index for this parent column
        key: "", // Key for the parent column
        align: "", // Alignment (empty for this parent column)
        width: 80, // Set column width
        children: [
          {
            title: "Tenor", // Header name for the child column
            dataIndex: "Tenor", // Data key from the dataset for Tenor
            key: "tenor", // Unique key for the child column
            align: "center", // Center align the content
            width: 80, // Set column width
          },
        ],
      },
    ];
  }

  let instrumentColumns = [];

  try {
    // Check if value is 1 to create Discount columns, otherwise create Forwards columns
    if (value === 1) {
      // Create Discount columns
      instrumentColumns = data.reduce((acc, item) => {
        const instrument = item.instrumentTitle;

        // Check if the instrument column already exists in acc
        if (!acc.find((col) => col.title === instrument)) {
          acc.push({
            title: instrument, // Title of the instrument column
            key: instrument, // Unique key for the instrument column
            width: 100, // Set column width

            children: [
              {
                title: "Value", // Title for the child column
                dataIndex: "value", // Data key for Value from the dataset
                key: `${instrument}-value`, // Unique key for the child column
                align: "center", // Center align the content
                width: 100, // Set column width
              },
            ],
          });
        }

        return acc; // Return the accumulator with newly added column if applicable
      }, []);
    } else if (value === 2 || value === 3) {
      // Create Forwards columns
      instrumentColumns = data.reduce((acc, item) => {
        const instrument = item.instrumentTitle || item.instrumentName;

        // Check if the instrument column already exists in acc
        if (!acc.find((col) => col.title === instrument)) {
          acc.push({
            title: instrument, // Title of the instrument column
            key: instrument, // Unique key for the instrument column

            children: [
              {
                title: "Bid", // Title for the Bid child column
                dataIndex: "bid", // Data key for Bid from the dataset
                key: `${instrument}-bid`, // Unique key for the Bid child column
                align: "center", // Center align the content
                width: 100, // Set column width
              },
              {
                title: "Ask", // Title for the Ask child column
                dataIndex: "ask", // Data key for Ask from the dataset
                key: `${instrument}-ask`, // Unique key for the Ask child column
                align: "center", // Center align the content
                width: 100, // Set column width
              },
            ],
          });
        }

        return acc; // Return the accumulator with newly added column if applicable
      }, []);
    } else if (value === 5) {
      const baseColumns = [
        {
          title: "Tenor",
          dataIndex: "tenorName",
          key: "tenorName",
          align: "center",
          width: 80,
        },
      ];

      // Dynamically extract instruments from data keys
      const instrumentSet = new Set();

      data.forEach((item) => {
        Object.keys(item).forEach((key) => {
          if (key.startsWith("rate_")) {
            const instrumentName = key.replace("rate_", "");
            instrumentSet.add(instrumentName);
          }
        });
      });

      // Create dynamic columns
      const instrumentColumns = Array.from(instrumentSet).map((instrument) => ({
        title: instrument.toUpperCase(), // Human-readable title
        key: instrument,
        dataIndex: `rate_${instrument}`,
        width: 100,
        align: "center",
        render: (text, record) => (
          <InputFIeld
            value={record[`rate_${instrument}`]}
            onChange={(e) =>
              onInputChange(
                record.tenorID || record.TenorID,
                instrument,
                e.target.value
              )
            }
            applyClass={InputClassName}
          />
        ),
      }));

      // Combine columns
      const allColumns = [...baseColumns, ...instrumentColumns];
    }
  } catch (error) {
    console.error("Error creating columns:", error);
    // Handle error appropriately here, e.g., log error, return a default column structure, etc.
    // For example, returning only baseColumns in case of error
    return baseColumns;
  }

  // Combine base columns and dynamically generated instrument columns
  return [...baseColumns, ...instrumentColumns];
};

export const transformRatesByTenor = (data = []) => {
  const grouped = {};

  data.forEach((item) => {
    const { tenorID, instumentID, instrumentName, rate, dateTime } = item;
    const upperName = instrumentName?.toUpperCase();

    if (!grouped[tenorID]) {
      grouped[tenorID] = {
        tenorID,
        dateTime,
      };
    }

    grouped[tenorID][`instumentID_${upperName}`] = instumentID;
    grouped[tenorID][`instrumentName_${upperName}`] = instrumentName;
    grouped[tenorID][`${upperName}-rate`] = rate;
  });

  return Object.values(grouped);
};
