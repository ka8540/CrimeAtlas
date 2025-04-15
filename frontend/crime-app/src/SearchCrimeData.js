import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './SearchCrimeData.css';

const customIcon = new L.Icon({
  iconUrl: 'https://profile-picture-docs.s3.us-east-1.amazonaws.com/placeholder.png',
  iconSize: [15, 20],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function SearchCrimeData() {
  const [inputs, setInputs] = useState({ date_occ: '', crm_cd_desc: '' });
  const [crimeDescriptions, setCrimeDescriptions] = useState([]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://127.0.0.1:5001/get_details')
      .then(res => setCrimeDescriptions(res.data.values))
      .catch(err => console.error('Error fetching crime descriptions:', err));
  }, []);

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const formattedInputs = {
        ...inputs,
        date_occ: inputs.date_occ ? formatDate(inputs.date_occ) : ''
      };
      if (!formattedInputs.date_occ) delete formattedInputs.date_occ;

      const res = await axios.get('http://localhost:5001/get_crime_data', { params: formattedInputs });
      if (res.status === 404 || res.data.length === 0) {
        setError('No documents found with the specified criteria.');
        setResults([]);
      } else {
        setResults(res.data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.status === 404 ? 'No documents found.' : 'Failed to fetch data.');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = `0${date.getDate()}`.slice(-2);
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const mapCenter = [34.0522, -118.2437];
  const zoomLevel = 10;

  return (
    <div className="search-crime-data">
      <h1 className="header-title">Basic Search</h1>
      <p className="instructions">Enter the search criteria:</p>

      <form onSubmit={handleSubmit} className="search-form horizontal-form">
        <div className="form-group">
          <input
            type="date"
            name="date_occ"
            value={inputs.date_occ}
            onChange={handleChange}
            className="input-field"
            placeholder="Date"
          />
        </div>

        <div className="form-group">
          <select
            name="crm_cd_desc"
            value={inputs.crm_cd_desc}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">Select a crime description</option>
            {crimeDescriptions.map((desc, i) => (
              <option key={i} value={desc}>{desc}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="submit-button">Search</button>
      </form>

      {error && <p className="error-message">{error}</p>}

      <div className="map-container" style={{ width: '93%', marginLeft: 'auto', marginRight: '0'}}>
        {results.length > 0 && (
          <MapContainer center={mapCenter} zoom={zoomLevel} className="leaflet-map">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {results.map((r, i) => (
              <Marker key={i} position={[r.latitude, r.longitude]} icon={customIcon}>
                <Popup>
                  Date: {r.date_occ}<br />
                  Description: {r.crm_cd_desc}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
}

export default SearchCrimeData;
