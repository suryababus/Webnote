// const { uuid } = require('uuidv4');
window.onload = () => {
    function create_UUID() {
        var dt = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }
    //console.log('hello');
    var showTooltip = () => {
        if (document.activeElement.tagName == "INPUT") return
        var tooltip = document.getElementById("tool-tip-notes");
        const position = getSelectionPoints();
        tooltip.style.top = position.top + "px";
        tooltip.style.left = position.left + "px";
        tooltip.style.display = "";
    }
    var hideTooltip = () => {
        var tooltip = document.getElementById("tool-tip-notes");
        tooltip.style.display = "none";
    }
    addNewText = (note) => {
        const url = window.location.href.toString()
        chrome.storage.local.get([url], function (result) {
            //console.log(result);
            var previousValues = result[url] || []
            previousValues.push({ ...note, id: create_UUID() })
            chrome.storage.local.set({ [url]: previousValues }, function () {
                //console.log(previousValues.toString() + ' is added');
            });
            highlightInDom(note)
            chrome.runtime.sendMessage({ type: "updateBatch" });
        });
    }
    deleteText = (text, callback) => {
        const url = window.location.href.toString()
        chrome.storage.local.get([url], function (result) {
            var previousValues = result[url] || []
            previousValues = previousValues.filter((value) => { return (value.selectionText != text) })
            chrome.storage.local.set({ [url]: previousValues }, function () {
                //console.log(previousValues.toString() + ' is deleted');
                callback()
            });
        });
    }
    const addSelection = () => {

        let selectionText = getHTMLOfSelection()
        let raw = getHTMLOfSelection()
        if (!selectionText.includes("<table")) {
            selectionText = window.getSelection().toString()
        }
        let offset = {
            x: scrollX,
            y: scrollY
        }
        let rposition = getSelectionPoints();
        //console.log(rposition)

        if (selectionText) {
            // alert(selectionText)
            const note = {
                "note": selectionText,
                raw,
                "description": "",
                "position": offset,
                "pageUrl": window.location.href.toString(),
                rposition
            }

            showMNotePopup(selectionText, note)
        } else {
            alert("Please select text")
        }

    }
    document.addEventListener('keydown', (e) => {
        //console.log("here", e.ctrlKey)
        if (e.ctrlKey && (e.key === 'w' || e.key === 'W')) {
            addSelection()
            // e.preventDefault();
            // e.stopPropagation();
        }
    })

    document.onmouseup = () => {
        var v = window.getSelection().toString().trim()
        if (v != "") {
            //console.log(v)
            position = getSelectionPoints()
            //console.log(position)
            showTooltip()
        } else {
            hideTooltip()
        }
    }
    function getHTMLOfSelection() {
        var range;
        if (document.selection && document.selection.createRange) {
            range = document.selection.createRange();
            return range.htmlText;
        }
        else if (window.getSelection) {
            var selection = window.getSelection()
            const temp = selection.toString().trim().split(" ")
            if (selection.rangeCount > 0) {
                range = selection.getRangeAt(0);
                var clonedSelection = range.cloneContents();
                var div = document.createElement('div');
                div.appendChild(clonedSelection);
                const result = div.innerHTML.toString()
                return result
            }
            else {
                return '';
            }
        }
        else {
            return '';
        }
    }
    findInDom = (note) => {
        var text = note.raw
        if (typeof (note) == "string") {
            note = JSON.parse(note)
        }
        var src_str = document.getElementsByTagName("body")[0].innerHTML;
        src_str = src_str.replace(`<mark id="note-mark">`, "")
        src_str = src_str.replace(`</mark>`, "")
        src_str = src_str.replace(text, `<mark id="note-mark">${text}</mark>`)

        document.getElementsByTagName("body")[0].innerHTML = (src_str);
        const href = "#note-mark"
        let offsetTop = document.querySelector(href)?.offsetTop - 100 || undefined;
        if (!offsetTop && note) {
            offsetTop = note.position.y
        }
        //console.log(offsetTop)
        scroll({
            top: offsetTop,
            behavior: "smooth"
        });
    }

    highlightInDom = (note) => {
        var text = note.raw
        if (typeof (note) == "string") {
            note = JSON.parse(note)
        }



        var src_str = document.getElementsByTagName("body")[0].innerHTML;
        // style="background-image:url(${chrome.runtime.getURL("tooltip-background.svg")} 
        src_str = src_str.replace(text, `
        <span class="note-highlight">${text}</span> 
        <span class="desciption-tool-tip">
            <span class="desciption-text">
            ${note.description}
            </span>
        </span>
    `)

        document.getElementsByTagName("body")[0].innerHTML = (src_str);

    }

    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            //console.log(sender.tab ?
            // "from a content script:" + sender.tab.url :
            // "from the extension");
            if (request.greeting == "hello")
                sendResponse({ farewell: "goodbye" });
            else if (request.greeting == "search") {
                //console.log(request.note)
                const url = window.location.href.toString()
                if (request.note.pageUrl && request.note.pageUrl != url) {

                } else {
                    findInDom(request.note)
                    sendResponse({ farewell: "ok" });
                }
            }
        }
    );

    const showMNotePopup = (text, note) => {
        //console.log("called me");
        disableScroll();
        let overlay = document.createElement("div");
        overlay.id = "overlay";
        overlay.style.zIndex = findHighestZIndex('div') + 2000;
        let popupBackground = document.createElement("div");
        popupBackground.id = "popupBackground";
        let notesView = document.createElement("div");
        notesView.id = "notesView";
        notesView.innerText = text;
        popupBackground.appendChild(notesView);
        let desciption = document.createElement("input");
        desciption.id = "desciption";
        desciption.placeholder = "description";
        desciption.innerText = "";
        popupBackground.appendChild(desciption);

        let saveBtn = document.createElement("span");
        saveBtn.className = "saveBtn";
        saveBtn.innerText = "Save"
        saveBtn.onclick = () => {
            //console.log("save clicked")
            overlay.remove()
            note.description = desciption.value
            addNewText(note)
            enableScroll()
        }
        let cancelBtn = document.createElement("span");
        cancelBtn.className = "cancelBtn";
        cancelBtn.innerText = "Cancel"
        cancelBtn.onclick = () => {
            //console.log("cancel clicked")
            overlay.remove()
            enableScroll()
        }

        let buttonContainer = document.createElement("div");
        buttonContainer.className = "buttonContainer";
        buttonContainer.appendChild(saveBtn)
        buttonContainer.appendChild(cancelBtn)


        popupBackground.append(buttonContainer)


        overlay.appendChild(popupBackground);

        document.body.append(overlay);
    }

    function findHighestZIndex(elem) {
        var elems = document.getElementsByTagName(elem);
        var highest = Number.MIN_SAFE_INTEGER || -(Math.pow(2, 53) - 1);
        for (var i = 0; i < elems.length; i++) {
            var zindex = Number.parseInt(
                document.defaultView.getComputedStyle(elems[i], null).getPropertyValue("z-index"),
                10
            );
            if (zindex > highest) {
                highest = zindex;
            }
        }
        return highest;
    }





    // left: 37, up: 38, right: 39, down: 40,
    // spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
    var keys = { 37: 1, 38: 1, 39: 1, 40: 1 };

    function preventDefault(e) {
        e.preventDefault();
    }

    function preventDefaultForScrollKeys(e) {
        if (keys[e.keyCode]) {
            preventDefault(e);
            return false;
        }
    }

    // modern Chrome requires { passive: false } when adding event
    var supportsPassive = false;
    try {
        window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
            get: function () { supportsPassive = true; }
        }));
    } catch (e) { }

    var wheelOpt = supportsPassive ? { passive: false } : false;
    var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

    // call this to Disable
    function disableScroll() {
        window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
        window.addEventListener(wheelEvent, preventDefault, wheelOpt); // modern desktop
        window.addEventListener('touchmove', preventDefault, wheelOpt); // mobile
        window.addEventListener('keydown', preventDefaultForScrollKeys, false);
    }

    // call this to Enable
    function enableScroll() {
        window.removeEventListener('DOMMouseScroll', preventDefault, false);
        window.removeEventListener(wheelEvent, preventDefault, wheelOpt);
        window.removeEventListener('touchmove', preventDefault, wheelOpt);
        window.removeEventListener('keydown', preventDefaultForScrollKeys, false);
    }





    function showPinsForNotes() {
        const url = window.location.href.toString()
        chrome.storage.local.get([url], function (notes) {
            notes = notes[url]

            if (!notes) return;




            notes.forEach(function (note) {
                if (!note.rposition) return

                // var pin = document.createElement("img");
                // pin.className = "pin"
                // pin.style.top = note.rposition.top - 12 + "px"
                // pin.style.left = note.rposition.left + "px"
                // pin.src = chrome.runtime.getURL("pin-icon.png");
                // document.body.append(pin)
                highlightInDom(note)
            })

        })

    }
    showPinsForNotes()

    var getSelectionPoints = (function () {
        var markerTextChar = "\ufeff";
        var markerTextCharEntity = "&#xfeff;";

        var markerEl, markerId = "sel_" + new Date().getTime() + "_" + Math.random().toString().substr(2);

        var selectionEl;

        return function (win) {
            win = win || window;
            var doc = win.document;
            var sel, range;
            // Branch for IE <= 8
            if (doc.selection && doc.selection.createRange) {
                // Clone the TextRange and collapse
                range = doc.selection.createRange().duplicate();
                range.collapse(false);

                // Create the marker element containing a single invisible character by creating literal HTML and insert it
                range.pasteHTML('<span id="' + markerId + '" style="position: relative;">' + markerTextCharEntity + '</span>');
                markerEl = doc.getElementById(markerId);
            } else if (win.getSelection) {
                sel = win.getSelection();
                range = sel.getRangeAt(0).cloneRange();
                range.collapse(false);

                // Create the marker element containing a single invisible character using DOM methods and insert it
                markerEl = doc.createElement("span");
                markerEl.id = markerId;
                markerEl.appendChild(doc.createTextNode(markerTextChar));
                range.insertNode(markerEl);
            }

            if (markerEl) {
                // Lazily create element to be placed next to the selection
                if (!selectionEl) {
                    selectionEl = doc.createElement("div");
                    selectionEl.style.border = "solid darkblue 1px";
                    selectionEl.style.backgroundColor = "lightgoldenrodyellow";
                    selectionEl.innerHTML = "&lt;- selection";
                    selectionEl.style.position = "absolute";

                    doc.body.appendChild(selectionEl);
                }

                // Find markerEl position http://www.quirksmode.org/js/findpos.html
                var obj = markerEl;
                var left = 0, top = 0;
                do {
                    left += obj.offsetLeft;
                    top += obj.offsetTop;
                } while (obj = obj.offsetParent);

                selectionEl.style.left = left + "px";
                selectionEl.style.top = top + "px";

                markerEl.remove()
                selectionEl.remove()
                return { left, top };
            }
        };
    })();
    const initTootTip = () => {
        var tooltip = document.createElement("div");
        tooltip.id = "tool-tip-notes";
        tooltip.style.zIndex = findHighestZIndex('div') + 1000;
        tooltip.className = "tool-tip";
        tooltip.style.backgroundImage = "url(" + chrome.runtime.getURL("tooltip-background.svg") + ")";

        var addAppIcon = document.createElement("img");
        addAppIcon.className = "add-app-icon"
        addAppIcon.src = chrome.runtime.getURL("app-icon.png");
        addAppIcon.id = "addWebNote"
        tooltip.appendChild(addAppIcon);
        document.body.append(tooltip)
        document.body.onclick = (e) => {
            if (e.target.id === "addWebNote") {
                addSelection()
            }
        }
        hideTooltip()
    }
    initTootTip()
}


