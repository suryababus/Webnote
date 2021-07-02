import { type } from 'os'
import React from 'react'
type Note = {
    note: string,
    pageUrl: string,
    description: string,
    position: {
        x: number,
        y: number
    }
}

let url = "";
let tabId = "";
(window as any).chrome.tabs.query({ currentWindow: true, active: true }, function (tabs: any) {
    //console.log(tabs[0].url);
    url = tabs[0].url;
    tabId = tabs[0].id;
});

export const getPageUrl = () => {
    return url;
}
export const storeNotes = (url: String, notes: Note[]) => {
    return new Promise((resolve, reject) => {
        (window as any).chrome.storage.local.set({ [url.toString()]: notes }, function () {
            resolve("success");
            updateNotesBatch();
        });
    })
}


export const getAllNote = () => {
    return new Promise((resolve, reject) => {
        (window as any).chrome.storage.local.get(null, (items: any) => {
            resolve(items);
        });
    })

}

export const getNoteForURL = (url: string) => {
    return new Promise((resolve, reject) => {
        (window as any).chrome.storage.local.get(url, (items: any) => {
            if (!items) {
                resolve([]);
            } else {
                resolve(items);
            }
        });
    })
}
export const getThisPageNotes = () => {
    return new Promise((resolve, reject) => {
        (window as any).chrome.storage.local.get(url, (items: any) => {
            resolve(items);
        });
    })

}

export const deleteNote = (deleteNote: Note) => {
    return new Promise((resolve, reject) => {
        (window as any).chrome.storage.local.get(deleteNote.pageUrl, (notes: any) => {
            //console.log(notes, deleteNote);
            notes = notes[url];
            var newNotes = notes.filter((note: any) => note.note != deleteNote.note)
            //console.log(newNotes);
            storeNotes(url, newNotes);
        });
    })
}


export const exportNotes = () => {
    //console.log("export notes")
    getAllNote().then((result: any) => {
        //console.log(result)
        // downloadString("this bkjfvh siovjibnjjioj n hsdkjb iohjf", "text", "webnote_export")
        downloadString(JSON.stringify(result), "text", "webnote_export")
    })
}
export const importNotes = () => {
    var input = document.createElement("input")
    input.style.display = "none"
    input.type = "file"
    input.accept = ".txt"
    input.addEventListener('change', function (e) {

        var fr = new FileReader();
        fr.onload = function () {
            //console.log(fr.result);
            if (fr.result != null) {
                addFileToNotes(fr.result.toString())
            }
        }
        if (this.files != null) {
            fr.readAsText(this.files[0]);
        }
    })
    document.body.appendChild(input);
    input.click()
}
function downloadString(text: string, fileType: string, fileName: string) {
    //console.log(text, "download")
    var blob = new Blob([text], { type: fileType });
    (window as any).chrome.downloads.download({
        url: URL.createObjectURL(blob),
        filename: fileName + "." + fileType// Optional
    });
}

const addFileToNotes = (data: string) => {
    let json = JSON.parse(data)
    let addUrls = Object.keys(json);
    addUrls.forEach(url => {
        var importNotes = json[url]
        getNoteForURL(url).then((result: any) => {
            if (result[url]) {
                result[url].forEach((note: any) => {
                    if (importNotes.filter((lNote: any) => lNote.id === note.id).length > 0) {
                        return
                    }
                    importNotes.push(note);
                })
            }
            storeNotes(url, importNotes);
        })
    })
}

const updateNotesBatch = () => {

    //console.log(url);

    (window as any).chrome.storage.local.get([url], function (notes: any) {
        notes = notes[url];
        //console.log(notes)
        if (notes) {
            (window as any).chrome.browserAction.setBadgeText({
                tabId: tabId,
                text: notes.length.toString()
            });
        } else {
            (window as any).chrome.browserAction.setBadgeText({
                tabId: tabId,
                text: '0'
            });
        }


    });
}


