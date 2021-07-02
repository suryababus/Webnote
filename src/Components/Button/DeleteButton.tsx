import React from 'react'
import "./style.css"
type button_type = {
    title: string,
    onClick: () => void
}


export default function DeleteButton({ title, onClick }: button_type) {
    return (
        <span className="deleteButton" onClick={onClick}>
            {title}
        </span>
    )
}
