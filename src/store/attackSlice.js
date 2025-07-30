import { createSlice } from '@reduxjs/toolkit';

const attackSlice = createSlice({
  name: 'attackCurrentElement',
  initialState: { 
    currentElementNode: '', 
    currentElementCarrier: '', 
    currentElementType: '',
    currentElementType2: '',
    currentElementPerc: 0,
    selectedAttackActions: [],
    previousAttackActions: [],
    showConfirm: false,
    showHistory: false,
  },
  reducers: {
    setAction: (state, action) => {
        state.currentElementNode = action.payload.node;
        state.currentElementCarrier = action.payload.carrier;
        state.currentElementType = action.payload.type;
        state.currentElementType2 = action.payload.type2;
    },
    removeAction: (state) => {
        state.currentElementNode = '';
        state.currentElementCarrier = '';
        state.currentElementType = '';
        state.currentElementType2 = '';
        state.currentElementPerc = 0;
      },
    updateAction: (state, action) => {
        state.currentElementPerc = action.payload;
      },
      /***/
    addAction: (state, action) => {
        if (!state.selectedAttackActions.includes(action.payload)) {
          state.selectedAttackActions.push(action.payload);
        }
      },
    deleteAction: (state, action) => {
        //console.log('Removing:', action.payload);
        //console.log('Before:', [...state.selectedAttackActions]);
        const index = action.payload;
        if (index >= 0 && index < state.selectedAttackActions.length) {
          state.selectedAttackActions.splice(index, 1);
        }
        //console.log('After:', [...state.selectedAttackActions]);
      },
      archiveCurrentActions: (state) => {
        if (state.selectedAttackActions.length > 0) {
          state.previousAttackActions.push([...state.selectedAttackActions]);
          state.selectedAttackActions = [];
        }
      },
      showHideConfirm: (state) => {
        state.showConfirm = !state.showConfirm;
      },
      showHideHistory: (state) => {
        state.showHistory = !state.showHistory;
      }
    }
});

export const { setAction, removeAction, updateAction, addAction, deleteAction, archiveCurrentActions, showHideConfirm, showHideHistory } = attackSlice.actions;
export default attackSlice.reducer;
