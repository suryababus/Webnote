import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import NoteComponent from './Components/Note/Note';
import NavBar from './Components/NavBar/NavBar';
import SideBar from './Components/SideBar/SideBar';
import { deleteNote, getAllNote, getThisPageNotes } from './Utils/Storage';


type Note = {
  note: string,
  pageUrl: string,
  description: string,
  raw: string,
  position: {
    x: number,
    y: number
  }
}


function App() {

  const [notes, setNotes] = useState<Note[]>([]);
  const [searchKey, setSearchKey] = useState("");
  const [searchRegex, setRegex] = useState(new RegExp("()", "i"));
  useEffect(() => {
    setThisPageNotes();
  }, [])

  useEffect(() => {
    if (searchKey == "") {
      setThisPageNotes();
      return
    }
    getAllNote().then((result: any) => {
      //console.log(result);
      var notesArray: Note[] = []


      Object.keys(result).forEach(key => {
        result[key].forEach((note: Note) => {
          if (searchRegex.test(note.description) || searchRegex.test(note.note) || searchRegex.test(note.pageUrl.substr(0, 30))) {
            notesArray.push(note)
            //console.log(searchRegex.test(note.description), searchRegex.test(note.note), searchRegex.test(note.pageUrl.substr(0, 30)))
          }
        })
      })
      //console.log(searchKey, notesArray);
      setNotes(notesArray);
    });
  }, [searchRegex])



  const setThisPageNotes = () => {
    getThisPageNotes().then((result: any) => {
      //console.log(result);
      var notesArray: Note[] = []
      Object.keys(result).forEach(key => {
        result[key].forEach((note: any) => {
          notesArray.push(note)
        })
      })
      //console.log(notesArray);
      setNotes(notesArray);
    });
  }

  const searchKeyChanged = (searchKey: string) => {
    //console.log(searchKey);
    setSearchKey(searchKey);
    try {
      setRegex(new RegExp("(" + searchKey + ")", "i"));
    } catch (Ex) {
      //console.log(Ex)
      setRegex(new RegExp("()", "i"))
    }
    if (searchKey == "") {
      setThisPageNotes();
    }

  }

  const _deleteNote = (note: Note) => {
    deleteNote(note);
    //console.log(note);
    var newNotes = notes.filter(lnote => lnote.note != note.note)
    setNotes(newNotes);
  }


  return (
    <div className="App">
      <NavBar
        searchKeyChanged={searchKeyChanged}

      />
      <SideBar />
      <div className="AppBody">
        {
          notes.map(_note => {
            var note = (_note as Note);
            return <NoteComponent
              note={note.note}
              description={note.description}
              pageUrl={note.pageUrl}
              position={note.position}
              raw={note.raw}
              deleteNote={_deleteNote}
              searchRegex={searchRegex}
            />
          })
        }
      </div>
    </div>
  );
}

export default App;
