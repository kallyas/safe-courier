import { useState } from "react";
import { Loading } from "elementz"

function EditParcel({ state, loading, onUpdate }) {
    const [name, setName] = useState(state.items.recipient.name);
    const [email, setEmail] = useState(state.items.recipient.email);
    const [addressTo, setAddressTo] = useState(state.items.locationTo);
    const [city, setCity] = useState(state.items.city);
    const [type, setType] = useState(state.items.parcelType);
    const [weight, setWeight] = useState(state.items.weight);
    const [addressFrom, setAddressFrom] = useState(state.items.locationFrom);
    const [error, setError] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log({name, email, addressTo, city, weight, addressFrom});
    }
    return (
        <>
        {state.items.sender.isAdmin ? (
          <>
          <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className={`form-group ${error ? "has-error" : ""} col-md-4`}>
              <label htmlFor="name">Recipient Name</label>
              <input
                type="text"
                disabled
                className={`form-control`}
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter Recipient Name"
              />
            </div>
            <div className={`form-group ${error ? "has-error" : ""} col-md-4`}>
              <label htmlFor="recipient-email">Recepient Email</label>
              <input
                type="email"
                value={email}
                disabled
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
                id="recipient-email"
                placeholder="enter recipient email"
              />
            </div>
          </div>
          <div className={`form-group ${error ? "has-error" : ""} col-md-4`}>
            <label htmlFor="inputAddress">Recipient Address</label>
            <input
              type="text"
              value={addressTo}
              disabled
              onChange={(e) => {
                setAddressTo(e.target.value);
                setError(false);
              }}
              className="form-control"
              id="inputAddress"
              placeholder="1234 Main St"
            />
          </div>
          <div className={`form-group ${error ? "has-error" : ""} col-md-4`}>
            <label htmlFor="inputAddress2">Sender Address </label>
            <input
              value={addressFrom}
              onChange={(e) => setAddressFrom(e.target.value)}
              type="text"
              disabled
              className="form-control"
              id="inputAddress2"
              required
              placeholder="Apartment, studio, or floor"
            />
          </div>
          <div className="form-row">
            <div className={`form-group ${error ? "has-error" : ""} col-md-4`}>
              <label htmlFor="inputCity">City</label>
              <input
                type="text"
                value={city}
                disabled
                onChange={(e) => setCity(e.target.value)}
                className="form-control"
                id="inputCity"
              />
            </div>
            <div className="form-group col-md-4">
              <label htmlFor="inputState">Courier Type</label>
              <select
                id="inputState"
                className="form-control"
                value={type}
                required
                disabled
                onChange={(e) => setType(e.target.value)}
              >
                <option value="choose">Choose...</option>
                <option value="courier">Courier</option>
                <option value="shipping">Shipping</option>
              </select>
            </div>
            <div className="form-group col-md-2">
              <label htmlFor="inputZip">Weight</label>
              <input
                type="text"
                className="form-control"
                id="inputZip"
                value={weight}
                required
                disabled
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
          </div>
          {loading && <Loading primary lg style={{ marginBottom: "5px"}}/>}
          <button
            type="submit"
            className={`btn btn-primary ${loading ? "disabled" : ""}`}
            style={{ marginLeft: "15px" }}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
                Updating Order...
              </>
            ) : (
              "Edit order"
            )}
          </button>
        </form>
          </>
        ) : "You are not authorized to view this page"}
      </>
    )
}

export default EditParcel
