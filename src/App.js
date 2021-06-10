import './App.css';
import { MDBContainer, MDBRow, MDBCol } from "mdbreact";
import Navbar from './components/Navbar/Navbar';

function App() {
  return (
    <MDBContainer>
      <MDBRow>
      <MDBCol size="12" md="8">
        <Navbar />
      </MDBCol>
      <MDBCol size="6" md="4">.col-6 .col-md-4</MDBCol>
      </MDBRow>
    </MDBContainer>
  );
}

export default App;
