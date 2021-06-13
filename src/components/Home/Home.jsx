import { useState } from 'react'
import { MDBContainer, MDBRow, MDBCol } from "mdbreact";
import { FaPlusSquare } from 'react-icons/fa'
import Navbar from '../Navbar/Navbar';
import ParcelList from "../ParcelList/ParcelList";
import Sidebar from "../Sidebar/Sidebar";
import Modal from '../Modal/Modal';
import AddParcel from '../AddParcel/AddParcel';

function Home() {
    const [showModal, setshowModal] = useState(false)


    const onClick = () => {
        setshowModal(true)
      }
    return (
        <>
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
    <Modal show={showModal} handleClose={() => setshowModal(false)}>
         <AddParcel />
    </Modal>
        </>
    )
}

export default Home
