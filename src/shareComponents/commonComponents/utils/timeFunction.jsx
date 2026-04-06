import moment from "moment";

export function formatDateTimeToUTCTime(dateTimeStr) {
  try {
    // Extract year, month, day, hour, minute, second from the string
    const year = dateTimeStr.substring(0, 4);
    const month = dateTimeStr.substring(4, 6) - 1; // Months are 0-indexed in JS
    const day = dateTimeStr.substring(6, 8);
    const hour = dateTimeStr.substring(8, 10);
    const minute = dateTimeStr.substring(10, 12);
    const second = dateTimeStr.substring(12, 14);

    // Create a new Date object in UTC
    const date = new Date(Date.UTC(year, month, day, hour, minute, second));

    // Format the time in HH:MM:SS
    const formattedTime = date.toTimeString().substring(0, 9); // Extracting the time part from ISO string

    return formattedTime;
  } catch (error) {
    throw new Error(error);
  }
}

export function formatDateUTCToGMT(dateTimeStr) {
  try {
    if (!dateTimeStr) return;
    // Extract year, month, day, hour, minute, second from the string
    const year = dateTimeStr.substring(0, 4);
    const month = dateTimeStr.substring(4, 6) - 1; // Months are 0-indexed in JS
    const day = dateTimeStr.substring(6, 8);
    const hour = dateTimeStr.substring(8, 10);
    const minute = dateTimeStr.substring(10, 12);
    const second = dateTimeStr.substring(12, 14);

    // Create a new Date object in UTC
    const date = new Date(Date.UTC(year, month, day, hour, minute, second));

    return date;
  } catch (error) {
    console.log(error);
  }
}

export function formatCompactDateTime(input) {
  const year = input.slice(0, 4);
  const month = input.slice(4, 6);
  const day = input.slice(6, 8);
  const hour = input.slice(8, 10);
  const minute = input.slice(10, 12);
  const second = input.slice(12, 14);

  const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);

  return date.toLocaleDateString("en-US", {
    weekday: "short", // e.g., "Tue"
    year: "numeric", // e.g., "2025"
    month: "short", // e.g., "Jul"
    day: "numeric", // e.g., "15"
  });
}

export function extractTimeFromCompactDate(input) {
  const year = input.slice(0, 4);
  const month = input.slice(4, 6);
  const day = input.slice(6, 8);
  const hour = input.slice(8, 10);
  const minute = input.slice(10, 12);
  const second = input.slice(12, 14);

  const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);

  return date
    .toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase();
}

export const convertUTCToLocalDateWithToday = (timeStr) => {
  // Extract hours and minutes from the input string
  const [utcHours, utcMinutes] = timeStr.split(":").map(Number);

  // Get today's date parts in the local timezone
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();

  // Create a Date object in UTC using the provided time and today's date
  const utcDate = new Date(Date.UTC(year, month, day, utcHours, utcMinutes));

  // Convert it to a local time Date object
  const localDate = new Date(utcDate);

  return localDate;
};

export function convertUTCToDateTime(input) {
  const year = input.slice(0, 4);
  const month = input.slice(4, 6);
  const day = input.slice(6, 8);
  const hour = input.slice(8, 10);
  const minute = input.slice(10, 12);
  const second = input.slice(12, 14);

  // Create date object (months are 0-indexed in JS)
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));

  // Month abbreviations
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Get components
  const dayFormatted = day;
  const monthFormatted = months[parseInt(month) - 1];
  const yearFormatted = year;

  // Format hour for 12-hour clock
  let hourFormatted = parseInt(hour) % 12;
  hourFormatted = hourFormatted === 0 ? 12 : hourFormatted; // Convert 0 to 12

  // Format minute
  const minuteFormatted = minute;

  // Determine AM/PM
  const ampm = parseInt(hour) >= 12 ? "PM" : "AM";

  return `${dayFormatted}-${monthFormatted}-${yearFormatted} ${hourFormatted}:${minuteFormatted} ${ampm}`;
}

export const convertCurrentTimeZone = (dateTime) => {
  try {
    if (dateTime !== null && dateTime !== undefined) {
      if (!dateTime || dateTime.length < 14) {
        return "Invalid date";
      }
    }
    let fullDateYear =
      dateTime.slice(0, 4) +
      "-" +
      dateTime.slice(4, 6) +
      "-" +
      dateTime.slice(6, 8) +
      "T" +
      dateTime.slice(8, 10) +
      ":" +
      dateTime.slice(10, 12) +
      ":" +
      dateTime.slice(12, 14) +
      ".000Z";

    let convertTime = new Date(fullDateYear);

    return convertTime;
  } catch (error) {
    console.error("Error converting date:", error);
    return "Invalid date";
  }
};

export const formatToUTCString = (date, type) => {
  if (!date) return "";

  const m = moment(date).utcOffset(0); // don't mutate original

  if (type === "start") {
    return m
      .clone()
      .set({ hour: 0, minute: 0, second: 0, millisecond: 0 })
      .format("YYYYMMDDHHmmss");
  }

  if (type === "end") {
    return m
      .clone()
      .set({ hour: 23, minute: 59, second: 59, millisecond: 999 })
      .format("YYYYMMDDHHmmss");
  }

  return m.format("YYYYMMDDHHmmss");
};