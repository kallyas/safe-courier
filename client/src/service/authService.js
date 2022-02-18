import axios from "axios";

const LOGIN_API_URL = process.env.REACT_APP_API_URL + "/auth/login";
const REG_API_URL = process.env.REACT_APP_API_URL + "/auth/signup";

const loginUser = async (payload) => {
  const response = await axios.post(LOGIN_API_URL, payload);
  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

const registerUser = async (payload) => {
  const response = await axios.post(REG_API_URL, payload);
  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

const logoutUser = () => {
  localStorage.removeItem("user");
};



const authService = {
    loginUser,
    registerUser,
    logoutUser
};

export default authService;