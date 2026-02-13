// redux/slices/modalSlice.js
// Importing the `createSlice` function from Redux Toolkit, which simplifies the process of creating Redux slices.
import { createSlice } from "@reduxjs/toolkit";

// Defining the initial state for the modal slice.
// This object contains various properties that represent the visibility state of different modals in the application.
const initialState = {
  createTenorModal: false, // Controls the visibility of the "Create Tenor" modal.
  iSellAndBuyModal: false, // Controls the visibility of the "I Sell and Buy" modal.
  settingModal: false, // Controls the visibility of the "Settings" modal.
  chatModal: false, // Controls the visibility of the "Chat" modal.
  dealModalRequest: false, // Controls the visibility of the "Deal Request" modal.
  discountingQuoteModal: false,
  forwardQuoteModal: false,
  spotQuoteModal: false, // Controls the visibility of the "View Deal" modal.
  chatModalTransactionId: "", // Stores the transaction ID associated with the "Chat" modal.
  treasuryPersonID: 0, // Stores the ID of the treasury person, used in modals where applicable.
  settingsRecord: {
    // Stores user-specific settings related to modals and notifications.
    BD_Enable2FA: false, // Indicates whether two-factor authentication (2FA) is enabled.
    BD_SoundOnEveryMessage: false, // Indicates whether a sound should play for every message.
    BD_EmailOnEveryMessage: false, // Indicates whether an email should be sent for every message.

    CU_Enable2FA: false, // Indicates whether two-factor authentication (2FA) is enabled.
    CU_SoundOnEveryMessage: false, // Indicates whether a sound should play for every message.
    CU_EmailOnEveryMessage: false, // Indicates whether an email should be sent for every message.
  },
  transactionInfoModal: false, // Controls the visibility of the "Transaction Info" modal.
  rfqModalOpen: false, // Controls the visibility of the "Request for Quote (RFQ)" modal.
  IBuySellData: null, // Stores data related to the "I Buy/Sell" functionality, initially set to null.
  publishedSpotRates: false, // Show When Spot Current Rate is above 2.5% for first time and 0.25% other time.
  forwardRFQModal: false, // Controls the visibility of the "Forward Quote" modal.
  DiscountingRFQModal: false, // Controls the visibility of the "Discounting Quote" modal.
  ChatRecordInfoData: null,
  resetSearchConfirmationModal: false,
  publishedSpotRateSheet: false,
};

// Creating a Redux slice for managing modal states.
// The `createSlice` function automatically generates action creators and action types based on the reducers defined.
const modalSlice = createSlice({
  name: "modal", // The name of the slice, which will be used as a prefix for the generated action types.
  initialState, // The initial state of the slice, defined above.
  reducers: {
    setChatRecordInfoData(state, { payload }) {
      state.ChatRecordInfoData = payload;
    },
    setForwardRFQModal(state, { payload }) {
      state.forwardRFQModal = payload; // Updates the state with the payload value for Forward RFQ modal visibility.
    },
    setDiscountingRFQModal(state, { payload }) {
      state.DiscountingRFQModal = payload; // Updates the state with the payload value for Forward RFQ modal visibility.
    },
    setDiscountingQuoteModal(state, { payload }) {
      state.discountingQuoteModal = payload;
    },
    setForwardQuoteModal(state, { payload }) {
      state.forwardQuoteModal = payload;
    },
    // Reducer to set the visibility of the "Create Tenor" modal.
    setCreateTenorModal(state, action) {
      state.createTenorModal = action.payload; // Updates the state with the payload value.
    },
    // Reducer to set the visibility of the "I Sell and Buy" modal.
    setISellAndBuyModal(state, action) {
      state.iSellAndBuyModal = action.payload; // Updates the state with the payload value.
    },
    // Reducer to set the visibility of the "Settings" modal.
    setSettingModal(state, action) {
      state.settingModal = action.payload; // Updates the state with the payload value.
    },
    // Reducer to set the visibility of the "Chat" modal.
    setChatModal(state, action) {
      state.chatModal = action.payload; // Updates the state with the payload value.
    },
    // Reducer to set the transaction ID for the "Chat" modal.
    setChatModalTransactionId(state, action) {
      state.chatModalTransactionId = action.payload; // Updates the state with the payload value.
    },
    // Reducer to set the visibility of the "Transaction Info" modal.
    setTransactionInfoModal(state, action) {
      state.transactionInfoModal = action.payload; // Updates the state with the payload value.
    },
    // Reducer to set the visibility of the "Deal Request" modal.
    setDealModalRequest(state, { payload }) {
      state.dealModalRequest = payload; // Updates the state with the payload value.
    },
    // Reducer to set the visibility of the "View Deal" modal.
    setViewDealModal(state, { payload }) {
      state.spotQuoteModal = payload; // Updates the state with the payload value.
    },
    // Reducer to set the treasury person ID.
    setTreasuryPersonID(state, { payload }) {
      state.treasuryPersonID = payload; // Updates the state with the payload value.
    },
    setRfqModalOpen(state, { payload }) {
      state.rfqModalOpen = payload; // Updates the state with the payload value for RFQ modal visibility.
    },

    setIBuySellData(state, { payload }) {
      state.IBuySellData = payload; // Updates the state with the payload value for "I Buy/Sell" data.
    },
    // Reducer to set the visibility of the "Create Tenor" modal.
    setPublishedSpotRates(state, action) {
      state.publishedSpotRates = action.payload; // Updates the state with the payload value.
    },
    setPublishedSpotRateSheet(state, action) {
      state.publishedSpotRateSheet = action.payload; // Updates the state with the payload value.
    },
    setSettingRecords(state, { payload }) {
      state.settingsRecord = payload;
    },
    setExportTransactionModal(state, { payload }) {
      state.exportTransactionModal = payload;
    },

    setResetSearchConfirmationModal(state, { payload }) {
      state.resetSearchConfirmationModal = payload;
    },
    // Reducer to reset the modal state to its initial state.
    resetModalState() {
      return initialState; // Resets the state to the predefined `initialState`.
    },
  }, // Closing bracket for the previous reducer block.
});

// Exporting the action creators generated by `createSlice`.
// These actions can be dispatched to update the state.
export const {
  setChatRecordInfoData,
  setForwardQuoteModal,
  setDiscountingQuoteModal,
  setIBuySellData,
  setRfqModalOpen, // Action to update the visibility of the RFQ modal.
  setTreasuryPersonID, // Action to update the treasury person ID.
  setDealModalRequest, // Action to update the "Deal Request" modal visibility.
  setViewDealModal, // Action to update the "View Deal" modal visibility.
  setCreateTenorModal, // Action to update the "Create Tenor" modal visibility.
  setISellAndBuyModal, // Action to update the "I Sell and Buy" modal visibility.
  setSettingModal, // Action to update the "Settings" modal visibility.
  setChatModal, // Action to update the "Chat" modal visibility.
  setChatModalTransactionId, // Action to update the transaction ID for the "Chat" modal.
  setSettingRecords, // Action to update the user-specific settings.
  setTransactionInfoModal, // Action to update the "Transaction Info" modal visibility.
  resetModalState, // Action to reset the modal state to its initial state.
  setPublishedSpotRates,
  setDiscountingRFQModal,
  setForwardRFQModal,
  setExportTransactionModal,
  setResetSearchConfirmationModal,
  setPublishedSpotRateSheet,
} = modalSlice.actions;

// Exporting the reducer function generated by `createSlice`.
// This reducer will be used to handle state updates in the Redux store.
export default modalSlice.reducer;
