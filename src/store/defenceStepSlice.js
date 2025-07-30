import { createSlice } from '@reduxjs/toolkit';

const defenceStepSlice = createSlice({
  name: 'defence',
  initialState: { actionNumber: 1, step: 1 },
  reducers: {
    setActionNumber: (state, action) => {
        state.actionNumber += 1;
    },
    setStep: (state, action) => {
        state.step += 1;
    },
    setStep2: (state, action) => {
      state.step = action.payload;
    },
  },
});

export const { setActionNumber, setStep, setStep2 } = defenceStepSlice.actions;
export default defenceStepSlice.reducer;