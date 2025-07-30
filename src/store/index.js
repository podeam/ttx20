import { configureStore } from '@reduxjs/toolkit';
import countryReducer from './countrySlice';
import tsReducer from './tsSlice';
import actionReducer from './actionSlice';
import creditsReducer from './creditsSlice';
import defenceReducer from './defenceStepSlice';
import attackReducer from './attackSlice';

const store = configureStore({
  reducer: {
    country: countryReducer,
    action: actionReducer,
    ts: tsReducer,
    credits: creditsReducer,
    defence: defenceReducer,
    attack: attackReducer,
  },
});

export default store;
