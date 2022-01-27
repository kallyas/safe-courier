const API = process.env.REACT_APP_API_URL


const fetchItem = async (id, token) => {
    const res = await fetch(`${API}/parcels/${id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    const data = await res.json();
    return data;
}

export const ParcelService = {
    fetchItems: async (token) => {
        const res = await fetch(`${API}/parcels`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        return data;
      },

    cancelParcel: async (token, id) => {
        const cancel = await fetchItem(id, token);
        const update = { ...cancel, status: "cancelled" };
        const res = await fetch(`${API}/parcels/${id}/cancel`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(update),
        });

        const data = await res.json();
        return data;
    },

    createParcel: async (token, parcel) => {
        const res = await fetch(`${API}/parcels`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(parcel),
        });

        const data = await res.json();
        return data;
    },

    searchParcel: async (token, search) => {
        const res = await fetch(`${API}/parcels/search`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(search),
        });

        const data = await res.json();
        return data;
    },
    getParcel: async (id, token) => {
        const res = await fetch(`${API}/parcels/${id}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        const data = await res.json();
        return data;
    }

}