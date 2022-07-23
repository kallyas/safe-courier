import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../service/authService';

const user = JSON.parse(localStorage.getItem('user'));

export const logout = createAsyncThunk('auth/logout', async () => {
  const response = await authService.logoutUser();
  return response;
});

// login user
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (payload, thunkAPI) => {
    try {
      return await authService.loginUser(payload);
    } catch (error) {
      const message = error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (payload, thunkAPI) => {
    try {
      return await authService.registerUser(payload);
    } catch (error) {
      const message = error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (thunkAPI) => {
    try {
      return await authService.logoutUser();
    } catch (error) {
      const message = error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  user: user ? user : null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  errorMessage: '',
};

export const loginSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.errorMessage = '';
    },
  },
  extraReducers: {
    [loginUser.pending]: (state) => {
      state.isLoading = true;
    },
    [loginUser.fulfilled]: (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.user = action.payload;
    },
    [loginUser.rejected]: (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.errorMessage = action.payload;
    },
    [logout.fulfilled]: (state) => {
      state.user = null;
    },
    [registerUser.pending]: (state) => {
      state.isLoading = true;
    },
    [registerUser.fulfilled]: (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.user = action.payload;
    },
    [registerUser.rejected]: (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.errorMessage = action.payload;
    },
  },
});

export const { reset } = loginSlice.actions;
export const authSelector = (state) => state.auth;

export default loginSlice.reducer;
