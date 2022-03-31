const BASE_URL = process.env.REACT_APP_API_URL;

class API {
  static async get(url) {
    const res = await fetch(`${BASE_URL}${url}`);
    return await res.json();
  }

  static async post(url, data) {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify(data),
    });
    return await res.json();
  }

  static async put(url, data) {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
      body: JSON.stringify(data),
    });
    return await res.json();
  }

  static async delete(url) {
    const res = await fetch(`${BASE_URL}${url}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    return await res.json();
  }

  static async refreshToken() {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('refresh_token')}`,
      },
    });
    return await res.json();
  }

  static async logout() {
    const res = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    });
    return await res.json();
  }

  static async logoutRefresh() {
    const res = await fetch(`${BASE_URL}/auth/logout/refresh`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('refresh_token')}`,
      },
    });
    return await res.json();
  }
}


export default  API