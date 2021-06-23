import React from "react";
import { useHistory } from "react-router-dom";

function ParcelList({ items, cancelParcel, onDetails }) {
  const history = useHistory();
  return (
    <div className="panel-body">
      {items.length > 0 ? (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Type</th>
                <th>Sender</th>
                <th>Destination</th>
                <td>Tracking Code</td>
                <th>Date</th>
                <th>status</th>
                <th>price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => {
                return [
                  <tr key={i}>
                    <th scope="row">#</th>
                    <td>{item.parcelType}</td>
                    <td>{item.sender.username}</td>
                    <td>{item.locationTo}</td>
                    <td>{item.trackingCode}</td>
                    <td>{new Date(item.createdAt).toDateString()}</td>
                    <td>
                      <span
                        className={`label ${
                          item.status === "delivered"
                            ? "label-success"
                            : item.status === "transit"
                            ? "label-warning"
                            : item.status === "pending"
                            ? "label-default"
                            : item.status === "cancelled"
                            ? "label-danger"
                            : " "
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>{item.price}</td>
                    <td>
                      <button
                        onClick={() => {
                          onDetails(item._id);
                          history.push("/details");
                        }}
                      >
                        Details
                      </button>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-success">Edit</button>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm btn-danger ${
                          item.status === "cancelled" ||
                          item.status === "delivered"
                            ? "disabled"
                            : ""
                        }`}
                        onClick={() =>
                          item.status === "cancelled"
                            ? ""
                            : item.status === "delivered"
                            ? ""
                            : cancelParcel(item._id)
                        }
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>,
                ];
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p>No parcel orders Available</p>
      )}
    </div>
  );
}

export default ParcelList;
