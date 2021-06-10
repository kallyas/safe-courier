import React from 'react'
import {FaBell, FaUser, FaHamburger } from 'react-icons/fa'
import Searchbar from '../Search/Searchbar'
import './Navbar.css'

function Navbar() {
    return (
        <div className="nav-bar">
            <FaHamburger />
            <Searchbar />
            <div className="right">
                <FaBell />
                <FaUser />
            </div>
        </div>
    )
}

export default Navbar
