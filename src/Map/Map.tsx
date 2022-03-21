import React, { useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
// import { clientPropSet } from '../interfaces';

interface Note {
  _id: string;
  series: string;
  title: string;
  location: string;
  synopsis: string;
  locdetails: string;
  latlong: string;
  image: string;
  seriesimage: string;
}

const Map = React.memo((props: any) => {
  // States and variables -----------------------------------------------------
  let map: google.maps.Map | null = null;
  let key = '';
  let activeMarker: google.maps.Marker;
  let notelist: Note[];
  let markers: google.maps.Marker[] = [];

  const { setNoteActive, setSeriesActive, setLatlng, setUpdateNote } = props;

  // Methods ------------------------------------------------------------------
  const fetchNotes = async () => {
    try {
      let response = await fetch(`/note/detailed`, {
        method: "GET",
        credentials: "include",
      });
      const parsedResponse = await response.json();

      if (response.status === 200){
        notelist = parsedResponse;
        // console.log(notelist);
      } else {
        console.log("--- Failed to fetch detailed note list ---");
      }

    } catch(err) {
      console.log('--- !!! fetchNotes() ERROR !!! ---');
      console.log(err);
    }
  }

  const fetchMap = async () => {
    if (key === '') {
      try {
        let response = await fetch(`/admin/mapsAPI`, {
          method: "GET",
          credentials: "include",
        });
        const parsedResponse = await response.json();

        if (response.status === 200){
          key = parsedResponse.apikey;
        } else {
          console.log("Failed to fetch API Key for map");
        }

      } catch(err) {
        console.log('--- !!! APIKey Fetch ERROR !!! ---');
        console.log(err);
      }
    }
  };

  const loadMap = async (APIKey: string) => {
    const loader = new Loader({
      apiKey: APIKey,
      version: "weekly"
    });
  
    await loader.load()
    .then((google) => {
      map = new google.maps.Map(document.getElementById("Map") as HTMLElement, {
        center: { lat: 45.9795412, lng: -51.6052898 },
        zoom: 2,
        fullscreenControl: false,
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: false,
        disableDoubleClickZoom: true,
      });

      notelist.forEach((note: any) => {
        const img = {
          url: 'http://maps.google.com/mapfiles/kml/pushpin/red-pushpin.png',
          scaledSize: new google.maps.Size(25, 25),
        }
  
        const latlng = note.latlong.split(',')
        const marker = new google.maps.Marker({
          position: {lat: parseFloat(latlng[0]), lng: parseFloat(latlng[1])},
          map: map,
          title: note.title,
          icon: img,
          animation: google.maps.Animation.DROP,
        });

        marker.addListener('click', () => {
          setUpdateNote(note);
          setNoteActive(true);
          map?.setCenter({lat: parseFloat(latlng[0]), lng: parseFloat(latlng[1])});
          map?.setZoom(8);
          if (activeMarker) activeMarker.setMap(null);
        });

        markers.push(marker);
      });
    });
  }

  const attachMapListeners = () => {
    if (map) {
      // console.log('--- Map listeners attached ---')
      map.addListener('dblclick', (mouseEvent: google.maps.MapMouseEvent) => {
        if (mouseEvent.latLng) {
          setUpdateNote(null);
          // Setting states for other UI components
          let latlng = mouseEvent.latLng?.toString().replace(/([()])+/g, '').split(',');
          setLatlng(latlng);
          setNoteActive(true);
          setSeriesActive(false);

          // Active Marker Properties
          if (activeMarker) activeMarker.setMap(null); // Reset so that theres only 1 at all times
          const googleLatLng = {lat: parseFloat(latlng[0]), lng: parseFloat(latlng[1])};
          const img = {
            url: 'http://maps.google.com/mapfiles/kml/pushpin/grn-pushpin.png',
            scaledSize: new google.maps.Size(25, 25),
          }
          activeMarker = new google.maps.Marker({
            position: googleLatLng,
            map,
            title: "New Note Location",
            icon: img,
          });

          // Changing Map Properties
          map?.setCenter(googleLatLng);
          map?.setZoom(8);
        }
      });
    } else {
      console.log('--- !!! Failed to attach map listeners !!! ---')
    }
  }
  
  // Lifecycles ---------------------------------------------------------------

  useEffect(() => {
    async function loadMapAsync(){
      await fetchNotes();
      await fetchMap();
      await loadMap(key);
      attachMapListeners();
    }
    loadMapAsync();
  });

  return (
    <div className="Map w-screen h-screen z-0" id='Map'>
    </div>
  );
})

export default Map;
