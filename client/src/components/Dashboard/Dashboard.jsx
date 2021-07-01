import { useState, useEffect } from "react";
import { Redirect, useHistory, useLocation } from "react-router-dom";
import { Loading } from "elementz"
import decode from "jwt-decode";
import Form from "../AddParcel/Form";
import Header from "../Header/Header";
import Panel from "../Panel/Panel";
import ParcelList from "../ParcelList/ParcelList";
import Map from "../Map/Map"
import EditParcel from "../Edit/EditParcel";
require('dotenv').config();

function Dashboard({ token }) {
  const history = useHistory();
  const location = useLocation();
  const { state } = useLocation()
  const [items, setItems] = useState([]);
  const [render, setRender] = useState(false);
  const [alert, setAlert] = useState(true);
  const [alerted, setAlerted] = useState(false);
  const [loading, setLoading] = useState(false)

  const user = decode(token);

  const API = process.env.REACT_APP_API_URL //|| "http://localhost:5000/api/v1"

  // get all parcel orders
  const fetchItems = async () => {
    setLoading(true)
    const res = await fetch(`${API}/parcels`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    setLoading(false)
    return data;
  };

  //cancel parcel order
  const cancelParcel = async (id) => {
    setLoading(true)
    const cancel = await fetchItem(id);
    const update = { ...cancel, status: "cancelled" };

    const res = await fetch(
      `${API}/parcels/${id}/cancel`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(update),
      }
    );

    const data = await res.json();

    setItems(
      items.map((item) =>
        item.id === id ? { ...item, status: data.status } : item
      )
    );
    setRender(true);
    setLoading(false)
  };

  const fetchItem = async (id) => {
    const res = await fetch(`${API}/parcels/${id}`);
    const data = await res.json();
    return data;
  };

  // add a new parcel order
  const onAddParcel = async (parcel) => {
    setLoading(true)
    const res = await fetch(`${API}/parcels`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(parcel),
    });

    const data = await res.json();
    setItems([...items, data.result])
    setRender(true)
    setLoading(false)
    window.alert("Parcel added successfully")
  };


  const logOut = () => {
    localStorage.removeItem("token");
  };
  useEffect(() => {
    const getParcels = async () => {
      const response = await fetchItems(token);
      console.log(response);
      if (response.message === "No Parcels Found!") {
        setItems([]);
        return;
      }

      setItems(
       user.isAdmin ? response : response.filter(
         item => item.sender.username === user.username && !item.sender.isAdmin
       )
      );
    };
    getParcels();
    if (decode(token).exp * 1000 < new Date().getTime()) logOut();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [render]);

  if (location.pathname === "/add") {
    if (!token) {
      return "Not authenticated, Redirecting..."(<Redirect to="/login" />);
    }
  }



  return (
    <>
      <Header />
      <div className="page-inner">
        <div className="page-title">
          <h3 className="breadcrumb-header">
            {location.pathname === "/home"
              ? "Dashboard"
              : location.pathname === "/add"
              ? "Add new Parcel"
              : location.pathname === `/details/${state?.items._id}`
              ? "Details"
              : ""}
          </h3>
          {alert && !alerted && (
            <div
              id="toast-container"
              className="toast-top-right"
              onClick={() => {
                setAlert(false);
                setAlerted(true);
              }}
            >
              <div className="toast toast-success" aria-live="polite">
                <div className="toast-message">
                  Welcome back {user.username.toUpperCase()}<br />
                  <small>click to dismiss</small>
                </div>
              </div>
            </div>
          )}
        </div>
        <div id="main-wrapper">
          <div className="row">
            <div className="col-lg-3 col-md-6">
              <Panel title="0" info="sent" />
            </div>
            <div className="col-lg-3 col-md-6">
              <Panel title="0" info="Recieved" />
            </div>
            <div className="col-lg-3 col-md-6">
              <Panel title="0" info="Cancelled" />
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
                      onClick={() =>
                        location.pathname === "/home"
                          ? history.push("/add")
                          : location.pathname === `/details/${state?.items._id}`
                          ? history.push("/add")
                          : history.push("/home")
                      }
                    >
                      <i
                        className={`fa ${
                          location.pathname === "/add" ? "fa-times" : "fa-plus"
                        }`}
                        style={{ marginRight: "5px" }}
                      ></i>
                      {location.pathname === "/add" ? "close" : "Add parcel"}
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
                      : location.pathname === "/home"
                      ? "Your Parcels"
                      :"Parcel Details"
                      }
                  </h4>
                </div>
                <div className="panel-body">
                  {location.pathname === "/home" ? (
                    <>
                    <Loading.Skeleton isLoading={loading}>
                         <Loading.Skeleton.Custom reactangle>
                         <ParcelList items={items} cancelParcel={cancelParcel} />
				                </Loading.Skeleton.Custom>
                    </Loading.Skeleton>
                    </>
                  ) : location.pathname === "/add" ? (
                    <Form onAdd={onAddParcel} id={user._id} loading={loading} />
                  ) : location.pathname === `/details/${state?.items._id}` ? (
                    <>
                    <p><strong>Sender:</strong> {state?.items.sender.username}</p>
                    <p><strong>Reciever:</strong> {state?.items.recipient.name}</p>
                    <p><strong>Location From:</strong> {state?.items.locationFrom}</p>
                    <p><strong>Destination:</strong> {state?.items.locationTo}</p>
                    <p><strong>Status:</strong> {state?.items.status}</p>
                    <p><strong>Tracking Code:</strong> {state?.items.trackingCode}</p>
                    <p><strong>Price:</strong> {state?.items.price}</p>
                    <p><strong>Weight:</strong> {state?.items.weight}</p>
                    </>
                  ) : location.pathname === `/edit/${state?.items._id}` ? (
                    <>
                    <EditParcel state={state} loading={loading} />
                    </>
                  ): ""}
                </div>
              </div>
            </div>
          </div>
          {location.pathname === `/details/${state?.items._id}` && (
            <>
            <div className="row">
              <div className="col-lg-12 col-md-12">
                <div className="panel panel-white">
                  <div className="panel-heading clearfix">
                    <h4 className="panel-title">Location on Map</h4>
                  </div>
                  <div className="panel-body">
                    <Map />
                  </div>
                </div>
              </div>
            </div>
            </>
          )}
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
