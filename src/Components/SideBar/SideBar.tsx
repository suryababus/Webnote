import React from 'react'
import { exportNotes, importNotes } from '../../Utils/Storage'
import "./style.css"



export default function SideBar() {
    return (
        <div className="side-bar-overlay">
            <div className="side-bar">
                <span className="notes-icon-container">
                    <img className="appIcon" src="app-icon.png" alt="Italian Trulli"></img>
                    WebNote
                </span>

                <div className="options-container" >
                    <div className="option" onClick={importNotes} >
                        <span className="icon-container"><img className="icon" src="import-icon.png" alt="Italian Trulli"></img></span>

                        <span className="option-text" >Import</span>
                    </div>
                    <div className="option" onClick={exportNotes}>
                        <span className="icon-container"><img style={{ paddingLeft: "12px" }} className="icon" src="export-icon.png" alt="Italian Trulli"></img></span>

                        <span className="option-text">Export</span>
                    </div>
                    {/* <div className="option">
                        <span className="icon-container"> <img style={{ paddingLeft: "1px" }} className="icon" src="theme-icon.png" alt="Italian Trulli"></img></span>

                        <span className="option-text">Theme</span>
                    </div> */}
                </div>
            </div>
        </div>
    )
}
