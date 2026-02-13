export const buildDiscountingTable = (
  value,
  Data,
  getAllTenorsData,
  getAllInstrument,
  InputFIeld,
  onInputChange
) => {
  if (!Data || !getAllTenorsData || !getAllInstrument) {
    return { rowData: [], columnsData: [] };
  }

  try {
    const { tenors } = getAllTenorsData;
    const { instruments } = getAllInstrument;

    // Step 1: Filter applicable instruments and tenors
    const applicableInstruments =
      value === 1
        ? instruments?.filter((inst) => inst.discountingApplicable) || []
        : value === 3 || value === 5
        ? instruments
        : instruments;

    const applicableTenors =
      value === 1 || value === 3 || value === 5
        ? tenors?.filter((tenor) => tenor.isDiscountingApplicable) || []
        : tenors;

    // Step 2: Create a map using composite key (instrumentID-tenorID)
    const rateMap = {};
    Data?.forEach((rate) => {
      const key = `${rate.instrumentID}-${rate.tenorID}`;
      rateMap[key] = rate.rate;
    });

    // Step 3: Build the row data
    const rowData = applicableTenors.map((tenor) => {
      const row = {
        TenorID: tenor.tenorID,
        tenorName: tenor.tenorName,
        tenorDays: tenor.tenorDays,
        discountDays: tenor.discountingDays,
      };

      applicableInstruments.forEach((instrument) => {
        const compositeKey = `${instrument.instrumentID}-${tenor.tenorID}`;

        const rateValue = rateMap[compositeKey] ?? 0;

        row[`rate_${instrument.instrumentName}`] = rateValue;
        row[`InstrumentID_${instrument.instrumentName}`] =
          instrument.instrumentID;
        row[`InstrumentName_${instrument.instrumentName}`] =
          instrument.instrumentName;
      });

      return row;
    });
    let columnsData = [];
    if (value === 1 || value === 5) {
      columnsData = [
        {
          title: "Tenor",
          dataIndex: "tenorName",
          key: "tenorName",
          width: 80,
        },
        {
          title: "Tenor Days",
          dataIndex: "discountDays",
          key: "discountingDays",
          align: "center",
          width: 50,
        },
        ...applicableInstruments.map((inst) => ({
          title: inst.instrumentName,
          dataIndex: `rate_${inst.instrumentName}`,
          key: `rate_${inst.instrumentName}`,
          align: "center",
          width: 60,
          render: (text, record) => (
            <InputFIeld
              value={text}
              record={record}
              instrumentName={inst.instrumentName}
              onInputChange={onInputChange}
            />
          ),
        })),
      ];
    } else if (value === 3) {
      columnsData = [
        {
          title: "",
          dataIndex: "",
          key: "",
          width: 80,
          children: [
            {
              title: "Tenor",
              dataIndex: "tenorName",
              key: "tenorName",
              align: "center",
              width: 80,
            },
            {
              title: "Tenor Days",
              dataIndex: "discountDays",
              key: "discountingDays",
              align: "center",
              width: 50,
            },
          ],
        },
        ...applicableInstruments.map((inst) => ({
          title: inst.instrumentName,
          key: `rate_${inst.instrumentName}`,
          align: "center",
          width: 80,
          children: [
            {
              title: "Value",
              dataIndex: `rate_${inst.instrumentName}`,
              align: "center",
              width: 80,

              render: (text, record) => (
                <InputFIeld value={text} record={record} />
              ),
            },
          ],
        })),
      ];
    } else {
      columnsData = [
        {
          title: "Tenor",
          dataIndex: "tenorName",
          key: "tenorName",
          width: 80,
        },
        ...applicableInstruments.map((inst) => ({
          title: inst.instrumentName,
          key: `rate_${inst.instrumentName}`,
          align: "center",
          width: 60,
          children: [
            {
              title: "value",
              dataIndex: `rate_${inst.instrumentName}`,
              width: 60,

              render: (text, record) => (
                <InputFIeld value={text} record={record} />
              ),
            },
          ],
        })),
      ];
    }
    // Step 4: Build the column definitions

    return { rowData, columnsData };
  } catch (error) {
    console.error("Error while building discounting table:", error);
    return { rowData: [], columnsData: [] };
  }
};

export const buildForwardsTable = (
  value,
  Data,
  getAllTenorsData,
  getAllInstrument,
  InputFIeld,
  onInputChange
) => {
  if (!Data || !getAllTenorsData || !getAllInstrument) {
    return { rowData: [], columnsData: [] };
  }
  try {
    const { tenors } = getAllTenorsData;
    const { instruments } = getAllInstrument;

    const applicableInstruments =
      value === 1
        ? instruments?.filter((inst) => inst.discountingApplicable) || []
        : value === 3
        ? // value 3 for when  treasury forwards application is used
          instruments
        : instruments;

    const applicableTenors =
      value === 1
        ? tenors?.filter((tenor) => tenor.isForwardingApplicable) || []
        : value === 3
        ? tenors?.filter((tenor) => tenor.isForwardingApplicable) || []
        : tenors;

    // Step 1: Create rateMap with bid/ask
    const rateMap = {};
    Data.forEach((entry) => {
      const key = `${entry.instrumentID}-${entry.tenorID}`;
      rateMap[key] = {
        bid: entry.bid ?? 0,
        ask: value === 3 ? entry.offer : entry.ask ?? 0,
      };
    });

    // Step 2: Create rows
    const rowData = applicableTenors.map((tenor) => {
      const row = {
        tenorID: tenor.tenorID,
        tenorName: tenor.tenorName,
        tenorDays: tenor.tenorDays,
      };

      applicableInstruments.forEach((instrument) => {
        const key = `${instrument.instrumentID}-${tenor.tenorID}`;
        const rates = rateMap[key] || { bid: 0, ask: 0 };

        row[`bid_${instrument.instrumentName}`] = rates.bid;
        row[`ask_${instrument.instrumentName}`] = rates.ask;
        row[`InstrumentID_${instrument.instrumentName}`] =
          instrument.instrumentID;
        row[`InstrumentName_${instrument.instrumentName}`] =
          instrument.instrumentName;
      });

      return row;
    });

    // Step 3: Create columns
    let columnsData = [];

    if (value === 1) {
      // Discounting layout
      columnsData = [
        {
          title: "Tenor",
          dataIndex: "tenorName",
          key: "tenorName",
          width: 80,
        },
        ...applicableInstruments.map((inst) => ({
          title: inst.instrumentName,
          dataIndex: `bid_${inst.instrumentName}`, // fallback
          key: `rate_${inst.instrumentName}`,
          align: "center",
          width: 60,
          render: (text, record) => (
            <InputFIeld
              value={text}
              record={record}
              instrumentName={inst.instrumentName}
              onInputChange={onInputChange}
            />
          ),
        })),
      ];
    } else {
      // Forwards layout
      columnsData = [
        {
          title: "",
          key: "tenorName",
          width: 60,
          children: [
            {
              title: "Tenor",
              dataIndex: `tenorName`,
              key: "tenorName",
              width: 120,

              align: "center",
            },
          ],
        },
        ...applicableInstruments.map((inst) => ({
          title: inst.instrumentName,
          key: `group_${inst.instrumentName}`,
          align: "center",
          width: 180,
          children: [
            {
              title: "Bid",
              dataIndex: `bid_${inst.instrumentName}`,
              key: `bid_${inst.instrumentName}`,
              width: 60,

              align: "center",
              render: (text, record) => (
                <InputFIeld value={text} record={record} />
              ),
            },
            {
              title: "Ask",
              dataIndex: `ask_${inst.instrumentName}`,
              key: `ask_${inst.instrumentName}`,
              width: 60,

              align: "center",
              render: (text, record) => (
                <InputFIeld value={text} record={record} />
              ),
            },
          ],
        })),
      ];
    }

    return { rowData, columnsData };
  } catch (error) {
    console.error("Error while building forwards table:", error);
    return { rowData: [], columnsData: [] };
  }
};

export const buildCurrentRatesPayload = (rowData) => {
  const currentRates = [];

  rowData.forEach((row) => {
    Object.keys(row).forEach((key) => {
      if (key.startsWith("rate_")) {
        const instrumentName = key.replace("rate_", "");
        const instrumentIDKey = `InstrumentID_${instrumentName}`;
        const rate = row[key];

        if (!isNaN(rate)) {
          currentRates.push({
            TenorID: row.TenorID,
            InstrumentID: row[instrumentIDKey],
            InstrumentName: instrumentName,
            Rate: String(rate),
          });
        }
      }
    });
  });

  return currentRates;
};

export const buildTresmarkCrossPremiumTable = (
  value,
  Data,
  getAllTenorsData,
  getAllInstrument
) => {
  if (!Data || !getAllTenorsData || !getAllInstrument) {
    return { rowData: [], columnsData: [] };
  }
  try {
    const { tenors } = getAllTenorsData;
    const { instruments } = getAllInstrument;

    const applicableInstruments =
      value === 3
        ? // value 3 for when  treasury forwards application is used
          instruments
        : instruments;

    const applicableTenors =
      value === 3
        ? tenors?.filter((tenor) => tenor.isForwardStandard) || []
        : tenors;

    // Step 1: Create rateMap with bid/ask
    const rateMap = {};
    Data.forEach((entry) => {
      const key = `${entry.instrumentID}-${entry.tenorID}`;
      rateMap[key] = {
        bid: entry.bidPremium ?? "-",
        ask: entry.bidPremium ?? "-",
      };
    });

    // Step 2: Create rows
    const rowData = applicableTenors.map((tenor) => {
      const row = {
        tenorID: tenor.tenorID,
        tenorName: tenor.tenorName,
        tenorDays: tenor.tenorDays,
      };

      applicableInstruments.forEach((instrument) => {
        const key = `${instrument.instrumentID}-${tenor.tenorID}`;
        const rates = rateMap[key] || { bid: 0, ask: 0 };

        row[`bid_${instrument.instrumentName}`] = rates.bid;
        row[`ask_${instrument.instrumentName}`] = rates.ask;
        row[`InstrumentID_${instrument.instrumentName}`] =
          instrument.instrumentID;
        row[`InstrumentName_${instrument.instrumentName}`] =
          instrument.instrumentName;
      });

      return row;
    });

    // Step 3: Create columns
    let columnsData = [];

    if (value === 3) {
      // Forwards layout
      columnsData = [
        {
          title: "",
          key: "tenorName",
          width: 60,
          children: [
            {
              title: "Tenor",
              dataIndex: `tenorName`,
              key: "tenorName",
              width: 120,

              align: "center",
            },
          ],
        },
        ...applicableInstruments.map((inst) => ({
          title: inst.instrumentName,
          key: `group_${inst.instrumentName}`,
          align: "center",
          width: 180,
          children: [
            {
              title: "Bid",
              dataIndex: `bid_${inst.instrumentName}`,
              key: `bid_${inst.instrumentName}`,
              width: 60,
              align: "center",
            },
            {
              title: "Ask",
              dataIndex: `ask_${inst.instrumentName}`,
              key: `ask_${inst.instrumentName}`,
              width: 60,
              align: "center",
            },
          ],
        })),
      ];
    }

    return { rowData, columnsData };
  } catch (error) {
    console.error("Error while building forwards table:", error);
    return { rowData: [], columnsData: [] };
  }
};
