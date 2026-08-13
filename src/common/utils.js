// utils/secureFormData.js
import CryptoJS from "crypto-js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";

// Function to set custom headers
// Function to set custom headers
const setCustomHeaders = (isDoc, ext) => {
  const token = localStorage.getItem("token");

  const extensionToContentType = {
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    txt: "text/plain",
  };

  try {
    const headers = {};

    if (isDoc && ext && extensionToContentType[ext]) {
      headers["Content-Type"] = extensionToContentType[ext];
      headers["Content-Disposition"] = `attachment; filename=template.${ext}`;
    } else {
      headers["Content-Type"] = "multipart/form-data";
    }

    return headers;
  } catch (error) {
    console.error("Error setting headers:", error);
    return {};
  }
};

const emailValidation = (text) => {
  // Correct regex pattern for email validation
  let emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Test if the input text matches the regex pattern
  const isValid = emailRegex.test(text);

  return isValid; // Return true if valid, false otherwise
};

const roleBasedNavigation = (navigate, roleID) => {
  if (roleID === 7) {
    navigate("/SONERI/dealer");
  } else if (roleID === 8) {
    navigate("/SONERI/treasury");
  } else if (roleID === 10) {
    navigate("/SONERI/management");
  }
};
export { setCustomHeaders, emailValidation, roleBasedNavigation };

export const getCookieValue = (cookieName) => {
  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (name === cookieName) {
      return value;
    }
  }
  return null; // Return null if the cookie is not found
};

// Utility to format date as "Wed, May 31, 2023"
export const formatDate = (date) => {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

// utils/crypto.js
export const xorEncryptDecrypt = (input, key) => {
  let out = "";
  for (let i = 0; i < input.length; i++) {
    out += String.fromCharCode(
      input.charCodeAt(i) ^ key.charCodeAt(i % key.length),
    );
  }
  return out;
};
export const encrypt = (data, key) => {
  try {
    const encrypted = xorEncryptDecrypt(data, key);
    return btoa(encrypted); // base64 encode
  } catch (e) {
    console.log("Encrypt Error:", e);
    return null;
  }
};

export const decrypt = (data, key) => {
  try {
    const decoded = atob(data); // base64 decode
    return xorEncryptDecrypt(decoded, key);
  } catch (e) {
    console.log("Decrypt Error:", e);
    return null;
  }
};

/**
 * Converts FormData to a plain object
 */
const formDataToObject = (formData) => {
  const obj = {};
  for (const [key, value] of formData.entries()) {
    obj[key] = value;
  }
  return obj;
};

/**
 * Converts plain object back to FormData
 */
const objectToFormData = (obj) => {
  const form = new FormData();
  for (const key in obj) {
    form.append(key, obj[key]);
  }
  return form;
};

/**
 * Encrypt FormData using AES
 */
export const encryptFormData = (formData, key) => {
  const plainObj = formDataToObject(formData);
  const jsonString = JSON.stringify(plainObj);
  const encrypted = CryptoJS.AES.encrypt(jsonString, key).toString();
  return encrypted;
};

/**
 * Decrypt AES-encrypted FormData
 */
export const decryptFormData = (encrypted, key) => {
  const bytes = CryptoJS.AES.decrypt(encrypted, key);
  const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
  const parsed = JSON.parse(decryptedText);
  return objectToFormData(parsed);
};

// utils/dateUtils.js (or inside same file if small)
export const calculateDates = (tenorDays, optionDays) => {
  const today = new Date();
  let tenorDt = new Date(today);
  let optionDt = new Date(today);

  const tenorNum = parseInt(tenorDays || "0", 10);
  const optionNum = parseInt(optionDays || "0", 10);

  if (!tenorNum && !optionNum) {
    // Case 1: both empty
    tenorDt = today;
    optionDt = today;
  } else if (tenorNum && !optionNum) {
    // Case 2: only tenor filled
    tenorDt.setDate(today.getDate() + tenorNum);
    optionDt = new Date(tenorDt);
  } else if (!tenorNum && optionNum) {
    // Case 3: only option filled
    tenorDt = today;
    optionDt.setDate(today.getDate() + optionNum);
  } else {
    // Case 4: both filled
    tenorDt.setDate(today.getDate() + tenorNum);
    optionDt = new Date(tenorDt);
    optionDt.setDate(optionDt.getDate() + optionNum);
  }

  return { tenorDt, optionDt };
};

export const isWeekend = (date) => {
  const day = date.getDay(); // 0 = Sunday, 6 = Saturday
  return day === 0 || day === 6;
};

dayjs.extend(utc);
dayjs.extend(customParseFormat);

export const convertUTCToLocal = (dateTime) => {
  if (!dateTime) return "";

  return dayjs.utc(dateTime, "YYYYMMDDHHmmss").local().format("YYYYMMDDHHmmss");
};
