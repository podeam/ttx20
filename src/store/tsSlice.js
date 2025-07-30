import { createSlice } from '@reduxjs/toolkit';

const tsSlice = createSlice({
  name: 'ts',
  initialState: { selectedTs: '', selectedTsValue: '' },
  reducers: {
    setTs: (state, action) => {
        state.selectedTs = action.payload;
    },
    setTsValue: (state, action) => {
      state.selectedTsValue = action.payload;
  },
  },
});

export const { setTs, setTsValue } = tsSlice.actions;
export default tsSlice.reducer;
