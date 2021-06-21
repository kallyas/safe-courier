import { useState, useEffect } from "react";
import { Redirect, useHistory, useLocation } from "react-router-dom";
import decode from "jwt-decode";
import Form from "../AddParcel/Form";
import Header from "../Header/Header";
import Panel from "../Panel/Panel";
import ParcelList from "../ParcelList/ParcelList";
import Map from "../Map/Map"
require('dotenv').config();

function Dashboard({ token }) {
  const history = useHistory();
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [render, setRender] = useState(false);
  const [alert, setAlert] = useState(true);
  const [alerted, setAlerted] = useState(false);
  const [itemDetails, setItemDetails] = useState([])
  const [loading, setLoading] = useState(false)

  const user = decode(token);

  const API = process.env.REACT_APP_API_URL //|| "http://localhost:5000/api/v1"

  // get all parcel orders
  const fetchItems = async () => {
    const res = await fetch(`${API}/parcels`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
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
      setLoading(false)
    setRender(true);
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
    console.log(data);
    console.log(user._id);
  };

  // get parcel details
  const getDetails = async (id) => {
    const data = await fetchItem(id)
    //setItems([data])
    console.log(data.sender);
    // const result = [data]
    // console.log(result);
    //console.log(result.filter((dat) => dat._id === id ))
    setItemDetails([...itemDetails, data])
    setRender(true)
    console.log(itemDetails);
  }

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
        response.filter((item) => {
          if (item.sender.isAdmin === true) {
            return (
              item.sender.isAdmin === true || item.sender.isAdmin === false
            );
          } else {
            return (
              item.sender.username === user.username &&
              item.sender.isAdmin === false
            );
          }
        })
      );
    };
    getParcels();
    console.log(decode(token));
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
              : location.pathname === "/details"
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
                  Welcome back {user.username.toUpperCase()}
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
                          : location.pathname === "/details"
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
                      : location.pathname === "/home"
                      ? "Your Parcels"
                      : location.pathname === "/details"
                      ? "Parcel Details"
                      : ""}
                  </h4>
                </div>
                <div className="panel-body">
                  {location.pathname === "/home" ? (
                    <ParcelList items={items} cancelParcel={cancelParcel} onDetails={getDetails}  />
                  ) : location.pathname === "/add" ? (
                    <Form onAdd={onAddParcel} id={user._id} loading={loading} />
                  ) : location.pathname === "/details" && render ? (
                    <>
                    <p>{items[0].sender.name}</p>
                    <Map />
                    </>
                  ) : (
                    ""
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
