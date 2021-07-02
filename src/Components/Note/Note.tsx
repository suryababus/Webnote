import { link } from 'fs';
import React from 'react'
import Button from '../Button/Button';
import DeleteButton from '../Button/DeleteButton';
import LinkButton from '../Button/LinkButton';
import './style.css';
import $ from "jquery";
import { getPageUrl } from '../../Utils/Storage';

type Note = {
    note: string,
    pageUrl: string,
    raw: string,
    description: string,
    position: {
        x: number,
        y: number
    },
    deleteNote: (note: any) => void,
    searchRegex: RegExp
}



export default function NoteComponent({ note, description, pageUrl, position, deleteNote, raw, searchRegex }: Note,) {

    const takeMeThere = () => {
        if (pageUrl != getPageUrl()) {
            openLinkInNewTab(pageUrl);
            return;
        }
        (window as any).chrome.tabs.query({ active: true, currentWindow: true }, function (tabs: any) {
            (window as any).chrome.tabs.sendMessage(tabs[0].id, { greeting: "search", note: { note, description, pageUrl, position, raw } }, function (response: any) {
                //console.log(response)
            });
        });
    }

    const replaceSearchKey = (str: string) => {
        if (searchRegex.test(str) && !searchRegex.test("")) {
            return `<span>${str.replace(searchRegex, `<span class="mark-searchkey">$1</span>`)}</span>`
        } else {
            return `<span>${str}</span>`
        }
    }

    const openLinkInNewTab = (link: string) => {
        (window as any).chrome.tabs.create({ url: link });
    }
    return (
        <div className="noteCard">
            <div className="noteTitle">
                Note:
            </div>
            <div className="noteText"
                dangerouslySetInnerHTML={{ __html: replaceSearchKey(note) }}
            >

            </div>
            <div className="noteTitle"

            >
                Description:
            </div>
            <div className="noteText"
                dangerouslySetInnerHTML={{ __html: replaceSearchKey(description) }}
            >
            </div>
            <div className="buttonContainer">
                <LinkButton
                    link={replaceSearchKey(pageUrl.substr(0, 30) + (pageUrl.length > 30 ? "..." : ""))}
                    // link={pageUrl}
                    onClick={() => openLinkInNewTab(pageUrl)}
                />
                <div style={{ flex: 1 }}>

                </div>
                <DeleteButton
                    title="Delete"
                    onClick={() => { deleteNote({ note, description, pageUrl, position }) }}
                />
                <Button
                    title="Take me there"
                    onClick={takeMeThere}
                />
            </div>
        </div >
    )
}
