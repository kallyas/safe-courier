import React from 'react'
import {FaBell, FaUser } from 'react-icons/fa'
import Searchbar from '../Search/Searchbar'
import './Navbar.css'

function Navbar() {
    return (
        <div className="nav-bar">
            <Searchbar />
            <div className="right">
                <FaBell />
                <FaUser />
            </div>
        </div>
    )
}

export default Navbar
