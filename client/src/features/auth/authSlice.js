import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../../service/authService";

const user = JSON.parse(localStorage.getItem("user"));

const initialState = {
  user: user ? user : null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  errorMessage: "",
};

export const loginSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    reset: (state) => {
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.errorMessage = "";
    },
  },
  extraReducers: builder => {
    builder.addCase(loginUser.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.user = action.payload;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.errorMessage = action.payload;
    });
    builder.addCase(registerUser.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isSuccess = true;
      state.user = action.payload;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.isLoading = false;
      state.isError = true;
      state.errorMessage = action.payload;
    });
    builder.addCase(logoutUser.fulfilled, state => {
      state.user = null;
    })
  },
});

// login user
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (payload, thunkAPI) => {
    try {
      return await authService.loginUser(payload);
    } catch (error) {
      const message = error.response.data.message
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const registerUser = createAsyncThunk("auth/registerUser", async (payload, thunkAPI) => {
  try {
    return await authService.registerUser(payload);
  } catch (error) {
    const message = error.response.data.message
    return thunkAPI.rejectWithValue(message);
  }
});

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  await authService.logoutUser();
})

export const { reset } = loginSlice.actions;
export const authSelector = (state) => state.auth;

export default loginSlice.reducer;
