
const API = process.env.REACT_APP_API_URL

const AuthService = { 
    signUp: async (body) => {
        const res = await fetch(`${API}/auth/signup/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        })

        const data = await res.json()
        return data
    },

    login: async (body) => {
        const res = await fetch(`${API}/auth/login/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        })

        const data = await res.json()
        return data
    },

    logout: () => {
        localStorage.removeItem("token")
    },
    verifyToken: async (token) => {
        const res = await fetch(`${API}/verify/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({token: token})
        })
        if(res.status === 200) {
            return true
        } else {
            return false
        }
    }
}

export default AuthService