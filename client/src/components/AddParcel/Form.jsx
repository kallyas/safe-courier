import { useState } from "react";

function Form({ onAdd, id }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [addressTo, setAddressTo] = useState("")
  const [city, setCity] = useState("")
  const [type, setType] = useState("")
  const [weight, setWeight] = useState("")
  const [addressFrom, setAddressFrom] = useState("")
  const [error, setError] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if(!name){
      setError(true)
      return
    }
    
    onAdd({ 
      sender: id, 
      recipient: {
        name,
        email
      }, 
      locationTo: addressTo, 
      city, 
      parcelType: type,
      weight,
      locationFrom: addressFrom,
      trackingCode: "LK".concat(Math.random().toString(36).slice(2, 7).toUpperCase())
    })

    setAddressFrom("")
    setAddressTo("")
    setCity("")
    setWeight("")
    setType("")
    setName("")
    setEmail("")
  }
  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className={`form-group ${error ? "has-error" : ""} col-md-6`}>
            <label htmlFor="name">Recipient Name</label>
            <input
              type="text"
              className={`form-control`}
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter Recipient Name"
            />
          </div>
          <div className={`form-group ${error ? "has-error" : ""} col-md-6`}>
            <label htmlFor="recipient-email">Recepient Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              id="recipient-email"
              placeholder="enter recipient email"
            />
          </div>
        </div>
        <div className={`form-group ${error ? "has-error" : ""} col-md-6`}>
          <label htmlFor="inputAddress">Recipient Address</label>
          <input
            type="text"
            value={addressTo}
            onChange={(e) => { setAddressTo(e.target.value); setError(false)}}
            className="form-control"
            id="inputAddress"
            placeholder="1234 Main St"
          />
        </div>
        <div className={`form-group ${error ? "has-error" : ""} col-md-6`}>
          <label htmlFor="inputAddress2">Sender Address </label>
          <input
            value={addressFrom}
            onChange={(e) => setAddressFrom(e.target.value)}
            type="text"
            className="form-control"
            id="inputAddress2"
            required
            placeholder="Apartment, studio, or floor"
          />
        </div>
        <div className="form-row">
          <div className={`form-group ${error ? "has-error" : ""} col-md-6`}>
            <label htmlFor="inputCity">City</label>
            <input type="text" 
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="form-control" 
            id="inputCity" />
          </div>
          <div className="form-group col-md-4">
            <label htmlFor="inputState">Courier Type</label>
            <select id="inputState" 
            className="form-control" 
            value={type}
            required
            onChange={(e) => setType(e.target.value)}
            >
              <option value="choose">Choose...</option>
              <option value="courier">Courier</option>
              <option value="shipping">Shipping</option>
            </select>
          </div>
          <div className="form-group col-md-2">
            <label htmlFor="inputZip">Weight</label>
            <input type="text" 
            className="form-control" 
            id="inputZip"
            value={weight}
            required
            onChange={(e) => setWeight(e.target.value)} 
            />
          </div>
        </div>
        <button type="submit" 
        className="btn btn-primary"
        style={{marginLeft: "15px"}}>
          create order
        </button>
      </form>
    </>
  );
}

export default Form;
