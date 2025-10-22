import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import api from '../api';

export interface Report {
  _id: string;
  title: string;
  test: string;
  hospital: string;
  doctor: string;
  date: string;
  price: string;
  flag: boolean;
  pdfUrl?: string;
  summary?: string;
  familyMemberId?: string;
}

interface ReportState {
  items: Report[];
  loading: boolean;
  error: string | null;
}

const initialState: ReportState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchReports = createAsyncThunk(
  'reports/fetchReports',
  async (familyMemberId: string) => {
    const response = await api.report.list({ familyMemberId });
    return Array.isArray(response) ? response : response?.data || [];
  }
);

export const uploadReport = createAsyncThunk(
  'reports/uploadReport',
  async ({ form }: { form: FormData }) => {
    const response = await api.report.uploadPdf(form);
    return response;
  }
);

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action: PayloadAction<Report[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch reports';
      })
      .addCase(uploadReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadReport.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(uploadReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to upload report';
      });
  },
});

export default reportSlice.reducer;