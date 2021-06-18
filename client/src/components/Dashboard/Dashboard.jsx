import { useState, useEffect } from "react";
import { Redirect, useHistory, useLocation } from "react-router-dom";
import decode from "jwt-decode"
import Form from "../AddParcel/Form";
import Header from "../Header/Header";
import Panel from "../Panel/Panel";
import ParcelList from "../ParcelList/ParcelList";


function Dashboard({ token }) {
  const history = useHistory();
  const location = useLocation();
  const [items, setItems] = useState([])
  const [render, setRender] = useState(false)

  const user = decode(token)
  
  const fetchItems = async () => {
    const res = await fetch("http://localhost:5000/api/v1/parcels", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
    const data = await res.json()
    return data
  }

  const cancelParcel = async (id) => {
    const cancel = await fetchItem(id)
    const update = {...cancel, status: "cancelled"}

    const res = await fetch(`http://localhost:5000/api/v1/parcels/${id}/cancel`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(update)
    })

    const data = await res.json()
    
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, status: data.status } : item
      )
    )

    setRender(true)

  }

  const fetchItem = async (id) => {
    const res = await fetch(`http://localhost:5000/api/v1/parcels/${id}`)
    const data = await res.json()
    return data
  }

  const onAddParcel = async (parcel) => {
    const res = await fetch("http://localhost:5000/api/v1/parcels", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "content-type" : "application/json"
      },
      body: JSON.stringify(parcel)
    })

    const data = await res.json()
    console.log(data);
  }

  const logOut = () => {
    localStorage.removeItem("token")
  }
  useEffect(() => {
    const getParcels = async () => {
      const response = await fetchItems(token)
      console.log(response);
      setItems(response.filter((item) => item.sender.username === user.username && item.sender.role === "user"))
    }
    getParcels()
    console.log(decode(token));
    if(decode(token) < new Date().getTime()) logOut()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [render])

  if(location.pathname === "/add") {
    if(!token) {
      return ("Not authenticated, Redirecting...",  <Redirect to="/login" />)
    }
  }

  return (
    <>
      <Header />
      <div className="page-inner">
        <div className="page-title">
          <h3 className="breadcrumb-header">
            {location.pathname === "/home" ? "Dashboard" : "Add new Parcel"}
          </h3>
        </div>
        <div id="main-wrapper">
          <div className="row">
            <div className="col-lg-3 col-md-6">
              <Panel title="$1920" info="Total Income" />
            </div>
            <div className="col-lg-3 col-md-6">
              <Panel title="$1920" info="Total Income" />
            </div>
            <div className="col-lg-3 col-md-6">
              <Panel title="$1920" info="Total Income" />
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="panel panel-white stats-widget">
                <div className="panel-body">
                  <div className="pull-left">
                    <button
                      type="button"
                      className={`btn btn-lg ${
                        location.pathname === "/add"
                          ? "btn-danger"
                          : "btn-success"
                      } btn-addon`}
                      onClick={() => location.pathname === "/home" ?  history.push("/add") :  history.push("/home")}
                    >
                      <i
                        className={`fa ${
                          location.pathname === "/add" ? "fa-times" : "fa-plus"
                        }`}
                        style={{ marginRight: "5px" }}
                      ></i>
                      {location.pathname === "/add" ? "cancel" : "Add parcel"}
                    </button>
                  </div>
                  <div className="pull-right">
                    <i className="icon-arrow_upward stats-icon"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-12 col-md-12">
              <div className="panel panel-white">
                <div className="panel-heading clearfix">
                  <h4 className="panel-title">
                    {location.pathname === "/add"
                      ? "Add Parcel"
                      : "Your Parcels"}
                  </h4>
                </div>
                <div className="panel-body">
                  {location.pathname === "/home" ? (
                    <ParcelList items={items} cancelParcel={cancelParcel} />
                  ) : (
                    <Form onAdd={onAddParcel}/>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="row"></div>
        </div>
        <div className="page-footer">
          <p>
            Made with <i className="fa fa-heart"></i> by Iden
          </p>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
