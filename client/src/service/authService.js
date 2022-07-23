import API from '../api/index';

const LOGIN_API_URL = process.env.REACT_APP_API_URL + '/auth/login';
const REG_API_URL = process.env.REACT_APP_API_URL + '/auth/register';

const loginUser = async (payload) => {
  const response = await fetch(LOGIN_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json();

  if (data.tokens) {
    localStorage.setItem('access_token', JSON.stringify(data.tokens.access));
    localStorage.setItem('refresh_token', JSON.stringify(data.tokens.refresh));
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
  } else {
    throw new Error(data.message);
  }
};

const registerUser = async (payload) => {
  const response = await fetch(REG_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (data.code && data.code === 400) {
    throw new Error(data.message);
  }

  return data;
};

const logoutUser = async () => {
  const data = await API.logout();
  // const data2 = await API.logoutRefresh();
  if (data.message === 'Successfully logged out') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    return data.message;
  } else {
    throw new Error(data.message);
  }
};
const authService = {
  loginUser,
  registerUser,
  logoutUser,
};

export default authService;
