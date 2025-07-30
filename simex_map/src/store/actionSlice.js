import { createSlice } from '@reduxjs/toolkit';

const actionSlice = createSlice({
  name: 'action',
  initialState: { 
    selectedAction: 0, 
    selectedActionTemp: 0, 
    currentAction: {},
    selectedActions: [],
    typeNewGen: '',
    showConfirm: false,
    showHistory: false,
  },
  reducers: {
    setActionTemp: (state, action) => {
        state.selectedActionTemp = action.payload;
    },
    setAction: (state, action) => {
        state.selectedAction = action.payload;
    },
    setCurrentAction: (state, action) => {
        state.currentAction = action.payload;
    },
    setTypeNewGen: (state, action) => {
        state.typeNewGen = action.payload;
    },
    addAction: (state, action) => {
      if (!state.selectedActions.includes(action.payload)) {
        state.selectedActions.push(action.payload);
      }
    },
    updateAction: (state, action) => {
      const { id, updates } = action.payload;
      //const index = state.selectedActions.findIndex(item => item.id === id);
      //console.log(id);
      //console.log(updates);
      //console.log(index);
      if (id !== -1) {
        state.selectedActions[id] = {
          ...state.selectedActions[id],
          ...updates
        };
      }
    },
    
    removeAction: (state, action) => {
      //console.log('Removing:', action.payload); // debug
      //console.log('Before:', [...state.selectedActions]); // debug
      const index = action.payload;
      if (index >= 0 && index < state.selectedActions.length) {
        state.selectedActions.splice(index, 1);
      }
      //console.log('After:', [...state.selectedActions]); // debug
    },
    showHideConfirm: (state) => {
      state.showConfirm = !state.showConfirm;
    },
    showHideHistory: (state) => {
      state.showHistory = !state.showHistory;
    }
  },
});

export const { setActionTemp, setAction, setTypeNewGen, addAction, updateAction, removeAction, setCurrentAction, showHideConfirm, showHideHistory } = actionSlice.actions;
export default actionSlice.reducer;
