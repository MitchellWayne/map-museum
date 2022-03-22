import { useState, useEffect } from "react";
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

function SeriesList(props: any){
  const [serieslist, setSerieslist] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSeriesDel = async (id: string, name: string) => {
    setLoading(true);
    try {
      let response = await fetch(`/series/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const parsedResponse = await response.json();

      if (response.status === 200){
        console.log(parsedResponse);
        window.alert('Successfully deleted series: ' + name);
        props.setSeriesListActive(false);
      } else {
        window.alert('The series must have all its associated notes deleted first');
        setLoading(false);
        console.log(parsedResponse);
      }

    } catch(err) {
      console.log('----- Series Delete ERROR -----');
      console.log(err);
    }
  }

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

  return(
    <div className="SeriesForm bg-black/50 w-72 absolute top-0 z-10 flex flex-col items-center h-screen overflow-auto text-white">
      <FontAwesomeIcon
        className="hover:text-gray-700 absolute top-0 right-0 mt-1 mr-2 text-2xl"
        icon={faTimes}
        onClick={() => {props.setSeriesListActive(false)}}
      />
      <h2 className="m-2 text-sm text-center">
        <span className='font-gideon-roman text-xl font-bold'>Series List</span>
      </h2>
      {
        !loading ?
        <ul className="flex flex-col w-full">
        {
          serieslist.map((series: seriesitem) => {
            return (
              <li key={series._id} value={series._id}
                className="bg-black/50 w-full p-1 my-0.5 h-14 flex flex-row justify-between"
              >
                <span className="flex w-11/12">
                  <img
                    src={series.image ? `/series/${series._id}/image/${series.image}` : ''}
                    alt=""
                    className="aspect-square bg-black/50 h-full object-cover"
                  />
                  <span className="w-9/12 ml-2">
                    <h2 className="h-1/2 truncate">{series.name}</h2>
                    <h4 className="h-1/2">{series.notes.length} notes</h4>
                  </span>
                </span>
                <FontAwesomeIcon
                  className="hover:text-red-600 active:scale-90 text-2xl mr-1 justify-self-end"
                  icon={faTimes}
                  onClick={() => {handleSeriesDel(series._id, series.name)}}
                />
              </li>
            )
          })
        }
        </ul>
        :
        <h4 className="m-2 text-sm text-center">
          <span className='font-gideon-roman text-xl font-bold'>Deleting series...</span>
        </h4>
      }
    </div>
  );
}

export default SeriesList;