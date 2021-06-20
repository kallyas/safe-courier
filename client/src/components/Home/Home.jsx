import useToken from "../../Utils/useToken";
import Dashboard from "../Dashboard/Dashboard";
import Sidebar from "../Sidebar/Sidebar";

function Home() {
  const { token } = useToken()
    return (
        <div className="page-container">
          <Sidebar />
          <div className="page-content">
            <Dashboard token={token} />
          </div>
        </div>
    )
}

export default Home
