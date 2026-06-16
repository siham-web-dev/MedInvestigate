import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface InvestigationState {
  isProcessing: boolean;
}

const initialState: InvestigationState = {
  isProcessing: false,
};

export const investigationSlice = createSlice({
  name: 'investigation',
  initialState,
  reducers: {
    setProcessing: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
    },
  },
});

export const { setProcessing } = investigationSlice.actions;
export default investigationSlice.reducer;
