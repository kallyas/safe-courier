import { MDBContainer, MDBRow, MDBCol } from "mdbreact";
import { FaPlusSquare } from 'react-icons/fa'
import './App.css'
import Navbar from './components/Navbar/Navbar';
import ParcelList from "./components/ParcelList/ParcelList";
import Sidebar from "./components/Sidebar/Sidebar";


const onClick = () => {
  console.log("clicked");
}

function App() {
  return (
    <MDBContainer>
      <MDBRow>
        <MDBCol size="12" md="8">
          <Navbar />
          <MDBContainer className="hero-section">
            <p>Chose the Most</p>
            <p>Convinient Delivery</p>
            <p onClick={onClick}>Add a new parcel <FaPlusSquare /></p>
          </MDBContainer>
          <MDBCol>
            Your Parcels
            <MDBCol>
              <ParcelList />
            </MDBCol>
          </MDBCol>
        </MDBCol>
        <MDBCol size="6" md="4"
        style={{ width: '100%'}}
        >📦Shipping
        <MDBContainer>
          <MDBRow>
            <Sidebar />
          </MDBRow>
        </MDBContainer>
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}

export default App;
