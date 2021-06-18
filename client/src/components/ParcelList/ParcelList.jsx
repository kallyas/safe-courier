import React from "react";

function ParcelList({ items }) {
  return (
    <div className="panel-body">
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
                <tr key={i} style={{cursor: "pointer"}} onClick={() => updateMap(item)}>
                  <th scope="row">#</th>
                  <td>{item.parcelType}</td>
                  <td>{item.sender.username}</td>
                  <td>{item.locationTo}</td>
                  <td>{item.trackingCode}</td>
                  <td>{new Date(item.createdAt).toDateString()}</td>
                  <td>
                    <span className={`label ${
                    item.status === "delivered" ? "label-success" : 
                    item.status === "transit" ? "label-warning": 
                    item.status === "cancelled" ? "label-danger":
                    " "}`}>{item.status}</span>
                  </td>
                  <td>{item.price}</td>
                  <td><button className="btn btn-sm btn-success">Edit</button></td>
                  <td><button className={`btn btn-sm btn-danger ${item.status === "cancelled" ? "disabled": ""}`}>cancel</button></td>
                </tr>,
              ];
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const updateMap = (items) => {
  console.log({to: items.locationTo, from: items.locationFrom});
}
export default ParcelList;
