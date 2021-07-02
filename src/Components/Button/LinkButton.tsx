import React from 'react'
import "./style.css"
type button_type = {
    link: string,
    onClick: () => void
}


export default function LinkButton({ link, onClick }: button_type) {
    return (
        <span className="linkButton" onClick={onClick}

            dangerouslySetInnerHTML={{ __html: `${link}` }}
        >


        </span>
    )
}
