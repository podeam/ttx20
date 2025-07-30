import { createSlice } from '@reduxjs/toolkit';

const creditsSlice = createSlice({
  name: 'credits',
  initialState: { 
    creditsInit: 3000,
    creditsRemaining: 3000,
    creditsSpent: 0,
    creditsAttackInit: 3000,
    creditsAttackRemaining: 3000,
    creditsAttackSpent: 0
  },
  reducers: {
    /*************************Defence */
    setCreditsRemaining: (state, action) => {
      state.creditsRemaining = (Number(state.creditsInit) - Number(action.payload));
    },
    setCreditsSpent: (state, action) => {
      state.creditsSpent = (Number(action.payload));
    },
    /*************************Attack */
    setCreditsAttackRemaining: (state, action) => {
      state.creditsAttackRemaining = (Number(state.creditsAttackInit) - Number(action.payload));
    },
    setCreditsAttackSpent: (state, action) => {
      state.creditsAttackSpent = (Number(action.payload));
    },
  },
});

export const { setCreditsRemaining, setCreditsSpent, setCreditsAttackRemaining, setCreditsAttackSpent } = creditsSlice.actions;
export default creditsSlice.reducer;
