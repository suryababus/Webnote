import React from 'react'
import "./style.css"
type button_type = {
    title: string,
    onClick: () => void
}


export default function Button({ title, onClick }: button_type) {
    return (
        <span className="button" onClick={onClick}>
            {title}
        </span>
    )
}
