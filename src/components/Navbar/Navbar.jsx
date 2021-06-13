import { MDBRow } from 'mdbreact'
import { FaHamburger } from 'react-icons/fa'
import { FiBell, FiUser } from 'react-icons/fi'
import Searchbar from '../Search/Searchbar'
import './Navbar.css'

function Navbar() {
    return (
        <div className="nav-bar">
            <FaHamburger />
            <Searchbar />
            <div className="right">
                <MDBRow>
                    <FiBell />
                </MDBRow>
                <MDBRow>
                    <FiUser />
                </MDBRow>
            </div>
        </div>
    )
}

export default Navbar
