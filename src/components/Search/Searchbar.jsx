import React from 'react'
import { FaSearch } from 'react-icons/fa'
import './Searchbar.css'

function Searchbar() {

    const onChange = (e) => {
        console.log(e.target.value);
    }    
    return (
        <>
        <FaSearch className="search-icon" />
        <input type="search" placeholder="search by track number" onChange={onChange}/>
        </>
    )
}

export default Searchbar
