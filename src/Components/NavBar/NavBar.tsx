import React, { useState } from 'react'
import "./style.css"

type params = {
    searchKeyChanged: (key: string) => void
}
export default function NavBar({ searchKeyChanged }: params) {

    const showSideBar = () => {
        //console.log("showSideBar");
        (window.document.getElementsByClassName("side-bar-overlay")[0] as HTMLElement).style.opacity = "1";
        (window.document.getElementsByClassName("side-bar-overlay")[0] as HTMLElement).style.pointerEvents = "all";
        (window.document.getElementsByClassName("side-bar")[0] as HTMLElement).style.left = "0px";
        (window.document.getElementsByClassName("side-bar-overlay")[0] as HTMLElement).onclick = () => {
            //console.log("clciked");
            hideSideBar();
        }
    }
    const hideSideBar = () => {
        (window.document.getElementsByClassName("side-bar-overlay")[0] as HTMLElement).style.opacity = "0";
        (window.document.getElementsByClassName("side-bar")[0] as HTMLElement).style.left = "-200px";
        (window.document.getElementsByClassName("side-bar-overlay")[0] as HTMLElement).style.pointerEvents = "none";
    }

    const _searchKeyChanged = (key: string) => {
        searchKeyChanged(key);
    }


    return (
        <div className="navBar">
            <span onClick={showSideBar}>
                <img className="sideBarIcon" src="side-bar-icon.png" alt="Italian Trulli"></img>
            </span>
            <img className="appIcon" src="app-icon.png" alt="Italian Trulli"></img>
            <span className="notesTitle">
                WebNote
            </span>


            <span className="searchBarContainer">
                <img
                    className="searchIcon"
                    src="search-icon.png"
                    alt="Italian Trulli"></img>
                <input
                    className="searchBar"
                    type="text"
                    onChange={(t) => { _searchKeyChanged(t.target.value) }}
                />

            </span>
        </div>
    )
}
