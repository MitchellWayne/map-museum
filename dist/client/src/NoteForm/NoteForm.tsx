import React, { useEffect, useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

interface seriesitem {
  description: string;
  image: string;
  mainImage: string;
  name: string;
  notes: Array<string>;
  _id: string;
}

function NoteForm(props: any) {
  const [latlng, setLatlng] = useState(''); // For parsing props.latlng
  const [simpleForm, setSimpleForm] = useState(false);
  const [serieslist, setSerieslist] = useState([]);

  // Required fields
  const [series, setSeries] = useState<string>('');
  const [title, setTitle] = useState<string>('');

  // Three below are optional fields
  const [location, setLocation] = useState<string>('');
  const [locdetails, setLocdetails] = useState<string>('');
  const [synopsis, setSynopsis] = useState<string>('');

  // Required image fields
  const [img, setImg] = useState<Blob>();
  const [seriesImg, setSeriesImg] = useState<Blob>();
  const [fixedImg, setFixedImg] = useState<string>();
  const [fixedSeriesImg, setFixedSeriesImg] = useState<string>();

  // Other UI States
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('Loading...');

  const clearForm = () => {
    setSeries('')
    setTitle('');
    setLocation('');
    setLocdetails('');
    setSynopsis('');
    setFixedImg('');
    setFixedSeriesImg('');
  }

  const readImage = useCallback((isIRL: boolean, img: Blob) => {
    let fr = new FileReader();
    fr.readAsDataURL(img);
    fr.onload = (e) => {
      if (e.target && e.target.result) {
        if (isIRL) setFixedImg(e.target.result as string);
        else if (!isIRL) setFixedSeriesImg(e.target.result as string);
      }
    }
  }, []);

  const deleteNote = async () => {
    setLoading(true);
    if (props.updateNote) {
      try {
        let response = await fetch(`/note/${props.updateNote._id}`, {
          method: "DELETE",
          credentials: "include",
        });
        const parsedResponse = await response.json();

        if (response.status === 201){
          console.log(parsedResponse);
          setLoadingMsg('Successfully deleted note');
          props.setUpdateNote(null);
          props.setNoteActive(false);
          window.alert('Successfully deleted note');
          props.setReload(true);
          props.setReload(false);
        } else {
          console.log(parsedResponse);
          setLoadingMsg('Delete failed, seek admin assistance');
        }

      } catch(err) {
        console.log('----- Note delete ERROR -----');
        console.log(err);
        setLoadingMsg('Delete note failed, seek admin assistance');
      }
    }
  }

  const createNote = async () => {    
    setLoading(true);
    let formData = new FormData();

    if (series && title && img && seriesImg) {
      formData.append('series', series);
      formData.append('title', title);
      formData.append('imgfile', img);
      formData.append('imgfile', seriesImg);
      formData.append('latlong', latlng[0] + ',' + latlng[1]);
    }

    if (!simpleForm) {
      formData.append('location', location);
      formData.append('locdetails', locdetails);
      formData.append('synopsis', synopsis);
    } else {
      formData.append('location', '');
      formData.append('locdetails', '');
      formData.append('synopsis', '');
    }

    try {
      let response = await fetch(props.updateNote ? `/note/${props.updateNote._id}`: `/note`, {
        method: props.updateNote ? "PUT" : "POST",
        body: formData,
        credentials: "include",
      });
      const parsedResponse = await response.json();

      if (response.status === 201 || response.status === 200){
        console.log(parsedResponse);
        setLoadingMsg('Successfully uploaded/updated note');
        props.setUpdateNote(null);
        props.setNoteActive(false);
        window.alert('Successfully uploaded/updated note');
      } else {
        console.log(parsedResponse);
        setLoadingMsg('Upload/update failed, seek admin assistance');
      }

    } catch(err) {
      console.log('----- Note Post/Update ERROR -----');
      console.log(err);
      setLoadingMsg('Upload/Update failed, seek admin assistance');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await createNote();
    props.setReload(true);
    props.setReload(false);
  }

  // Lifecycle ----------------------------------------------------------------
  useEffect(() => {
    const getSeriesList = async () => {
      try {
        let response = await fetch(`/series`, {
          method: "GET",
          credentials: "include",
        });
        const parsedResponse = await response.json();

        if (response.status === 200){
          setSerieslist(parsedResponse);
        } else {
          console.log(parsedResponse);
        }

      } catch(err) {
        console.log('----- Serieslist Get ERROR -----');
        console.log(err);
      }
    }
    getSeriesList();
  }, [])
  
  useEffect(() => {
    if (img) readImage(true, img);
  }, [img, readImage]);

  useEffect(() => {
    if (seriesImg) readImage(false, seriesImg);
  }, [seriesImg, readImage]);

  useEffect(() => {
    if (props.updateNote) {
      const note = props.updateNote;
      // console.log(note);
      setLatlng(note.latlong.split(','));
      setSeries(note.series);
      setTitle(note.title);
      if(note.location) setLocation(note.location);
      if(note.locdetails) setLocdetails(note.locdetails);
      if(note.synopsis) setSynopsis(note.synopsis);
      if(note.image) setFixedImg(`/note/${note._id}/image/${note.image}`);
      if(note.seriesimage) setFixedSeriesImg(`/note/${note._id}/image/${note.seriesimage}`);
    } else {
      clearForm();
    }
  }, [props.updateNote]);

  useEffect(() => {
    if (props.latlng !== '') {
      setLatlng(props.latlng);
    }
  }, [props.latlng])

  return (
    <div className="bg-black/50 NoteForm w-72 absolute top-0 z-10 flex flex-col items-center h-screen text-white overflow-auto">
      <FontAwesomeIcon
        className="hover:text-gray-700 absolute top-0 right-0 mt-1 mr-2 text-2xl"
        icon={faTimes}
        onClick={() => {props.setNoteActive(false)}}
      />
      <h2 className="m-2 text-sm text-center">
        <span className='font-gideon-roman text-xl font-bold'>Create a new note at:</span>
        <div className="text-left">Latitude: {latlng[0]}</div>
        <div className="text-left">Longitude: {latlng[1]}</div>
      </h2>
      <div className="formToggleWrapper justify-evenly font-gideon-roman flex flex-row w-full mt-2 text-xl">
        <button
          className={`grow ${simpleForm ? 'text-white bg-black hover:bg-gray-700' : 'text-black bg-white'}`}
          onClick={() => {setSimpleForm(false)}}
        >
          Detailed
        </button>
        <button
          className={`grow ${simpleForm ? 'text-black bg-white' : 'text-white bg-black hover:bg-gray-700'} `}
          onClick={() => {setSimpleForm(true)}}
        >
          Simple
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col items-start justify-start w-full">

        <span className="mt-2.5 px-2.5 pb-2.5 flex justify-between w-full">
          <label className="font-gideon-roman" htmlFor="series">Assigned Series</label>
          <select className="w-36 font-gideon-roman text-black" name="series" id="series"
            onChange={e => setSeries(e.target.value)}
            value={series}
            required
          >
            <option value='' disabled>Select a series</option>
            {
              serieslist.map((item: seriesitem) => {
                return (
                  <option
                    key={item._id}
                    value={item._id}
                    className="text-black"
                  >
                  { item.name }
                  </option>
                )
              })
            }
          </select>
        </span>

        <span className="px-2.5 pb-2.5 flex justify-between w-full">
          <label className="font-gideon-roman" htmlFor="name">Title</label>
          <input className="pl-2.5 w-56 text-black" type="text" name="name" id="name"
            onChange={e => setTitle(e.target.value)}
            value={title}
            required
          />
        </span>

        {
          !simpleForm ?
          <span className="px-2.5 pb-2.5 flex justify-between w-full">
            <label className="font-gideon-roman" htmlFor="location">Location</label>
            <input className="pl-2.5 w-48 text-black" type="text" name="location" id="location"
              onChange={e => setLocation(e.target.value)}
              value={location}
              required={!simpleForm}
            />
          </span>
          :
          null
        }

        {
          !simpleForm ?
          <span className="px-2.5 pb-2.5 flex flex-col w-full">
            <label className="font-gideon-roman" htmlFor="locationdet">Location Details</label>
            <textarea className="pl-2.5 text-black w-full" name="locationdet" id="locationdet"
              onChange={e => setLocdetails(e.target.value)}
              value={locdetails}
              required={!simpleForm}
            />
          </span>
          :
          null
        }

        {
          !simpleForm ?
          <span className="px-2.5 pb-2.5 flex flex-col w-full">
            <label className="font-gideon-roman" htmlFor="synopsis">Note Synopsis</label>
            <textarea className="pl-2.5 text-black w-full" name="synopsis" id="synopsis"
              onChange={e => setSynopsis(e.target.value)}
              value={synopsis}
              required={!simpleForm}
            />
          </span>
          :
          null
        }

        <span className="px-2.5 pb-2.5 flex flex-col w-full">
          <label htmlFor="irlimg">IRL Image</label>
          <input type="file" name="irlimg" id="irlimg"
            onChange={e => {if (e.target.files && e.target.files.length > 0) {setImg(e.target.files[0])}}}
            required
          />
        </span>

        <span className="px-2.5 pb-2.5 flex flex-col w-full">
          <label htmlFor="seriesimg">In-series Image</label>
          <input type="file" name="seriesimg" id="seriesimg"
            onChange={e => {if (e.target.files && e.target.files.length > 0) {setSeriesImg(e.target.files[0])}}}
            required
          />
        </span>

        {
          !loading ?
          <button
            className="self-center my-5 px-5 text-xl font-bold text-white border border-white rounded-full active:scale-95 hover:border-white w-min whitespace-nowrap hover:bg-gradient-to-tr from-green-600 to-green-400 hover:text-white"
            type="submit"
          >
          {
            !props.updateNote ?
            <React.Fragment>Create Note</React.Fragment>
            :
            <React.Fragment>Update Note</React.Fragment>
          }
          </button>
          :
          <h2 className="font-gideon-roman text-xl font-bold text-center items-center w-full text-green-500">
            {loadingMsg}
          </h2>
        }

        {
          !loading && props.updateNote ?
          <button
            className="self-center mb-5 px-5 text-xl font-bold text-white border border-white rounded-full active:scale-95 hover:border-white w-min whitespace-nowrap hover:bg-gradient-to-tr from-red-800 to-red-600 hover:text-white"
            onClick={deleteNote}
          >
          Delete Note
          </button>
          :
          null
        }
      </form>

      {
        fixedImg ?
        <React.Fragment>
          <h3>IRL Image Preview</h3>
          <img className="aspect-[8/5] w-full object-cover" src={fixedImg} alt="" />
        </React.Fragment>
        :
        null
      }
      {
        fixedSeriesImg ?
        <React.Fragment>
          <h3>In-series Image Preview</h3>
          <img className="aspect-[8/5] w-full object-cover" src={fixedSeriesImg} alt="" />
        </React.Fragment>
        :
        null
      }
    </div>
  );
}

export default NoteForm;
