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
      second: "2-digit",
      hour12: false,
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

export const formatCompactDate = (input) => {
  if (!input || input.length < 8) return "";

  const day = input.slice(0, 2);
  const month = input.slice(2, 4);
  const year = input.slice(4, 8);

  const date = new Date(`${year}-${month}-${day}T00:00:00`);

  const monthNames = [
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

  return `${day}-${monthNames[date.getUTCMonth()]}-${date.getUTCFullYear()}`;
};

export const formatTimeForSwapsinUSD = (input) => {
  if (!input || input.length < 8) return "";

  const day = input.slice(0, 2);
  const month = input.slice(2, 4);
  const year = input.slice(4, 8);

  const date = new Date(`${year}-${month}-${day}T00:00:00`);

  const monthNames = [
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

  return `${day}-${monthNames[date.getUTCMonth()]}-${date.getUTCFullYear()}`;
};

export function convertUTCTimeToLocalTime(timeStr) {
  try {
    if (!timeStr || timeStr.length !== 6) return "";

    const hour = parseInt(timeStr.slice(0, 2));
    const minute = parseInt(timeStr.slice(2, 4));
    const second = parseInt(timeStr.slice(4, 6));

    const now = new Date();

    // Create UTC date
    const utcDate = new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        hour,
        minute,
        second
      )
    );

    // Format to HH:MM:SS
    return utcDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch (error) {
    console.log(error);
  }
}

export const formatTodayForRateSheet = (date = new Date()) => {
  const day = date.toLocaleDateString("en-GB", { day: "2-digit" });
  const month = date.toLocaleDateString("en-GB", { month: "short" });
  const year = date.getFullYear();
  const weekday = date.toLocaleDateString("en-GB", { weekday: "long" });

  return `${day}-${month}-${year} - ${weekday}`;
};

export const formatDateTimeForNews = (dateTime) => {
  const year = dateTime.slice(0, 4);
  const month = dateTime.slice(4, 6);
  const day = dateTime.slice(6, 8);
  const hour = dateTime.slice(8, 10);
  const minute = dateTime.slice(10, 12);
  const second = dateTime.slice(12, 14);

  // ✅ Create UTC date correctly
  const dateObj = new Date(
    Date.UTC(year, month - 1, day, hour, minute, second)
  );

  // ✅ Convert to local automatically
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
  });

  const formattedTime = dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // change to false if you want 24-hour
  });

  return {
    date: formattedDate,
    time: formattedTime,
  };
};
