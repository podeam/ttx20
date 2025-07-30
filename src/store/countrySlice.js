import { createSlice } from '@reduxjs/toolkit';

const countrySlice = createSlice({
  name: 'country',
  initialState: { selectedCountry: '', countryName: '' },
  reducers: {
    setCountry: (state, action) => {
      if(state.selectedCountry == action.payload){
        state.selectedCountry = '';
        state.countryName = '';
      }
      else{
        state.selectedCountry = action.payload;
        switch(state.selectedCountry){
          case 'EE':
            state.countryName = 'Estonia';
            break;
          case 'LT':
            state.countryName = 'Lithuania';
            break;
          case 'LV':
            state.countryName = 'Latvia';
            break;
        }
      }      
    },
  },
});

export const { setCountry } = countrySlice.actions;
export default countrySlice.reducer;
