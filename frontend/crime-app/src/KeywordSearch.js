import React, { useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './KeywordSearch.css';

const customIcon = new L.Icon({
    iconUrl: 'https://profile-picture-docs.s3.us-east-1.amazonaws.com/placeholder.png',
    iconSize: [15, 20],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

function getCrimeIntensityColor(occurrences) {
    if (occurrences >= 4) return '#ff6347';
    if (occurrences >= 3) return '#ff8c00';
    if (occurrences >= 2) return '#ffd700';
    return '#90ee90';
}

function simplifyCrimeType(crimeType) {
    return crimeType.split(' ').slice(0, 6).join(' ');
}

function KeywordSearch() {
    const [keyword, setKeyword] = useState('');
    const [crimeLocations, setCrimeLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [crimeData, setCrimeData] = useState([]);
    const [imageData, setImageData] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(1000);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = crimeLocations.slice(indexOfFirstItem, indexOfLastItem);

    const fetchCrimeLocations = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:5001/search_crime_by_keyword?keyword=${keyword}`);
            setCrimeLocations(response.data);
        } catch (error) {
            console.error('Error fetching locations by keyword:', error);
        }
    };

    const fetchCrimeData = async (longitude, latitude) => {
        try {
            const response = await axios.get(`http://127.0.0.1:5001/get_crime_data_at_coordinates_with_keyword?longitude=${longitude}&latitude=${latitude}&keyword=${keyword}`);
            setCrimeData(response.data.crimeData);
            setImageData(response.data.imageData);
            setSelectedLocation({ longitude, latitude });
        } catch (error) {
            console.error('Error fetching crime data:', error);
        }
    };

    const handleSearch = () => {
        fetchCrimeLocations();
        setCurrentPage(1); 
    };

    return (
        <div style={{ width: '100%', margin: '20px auto', padding: '20px', maxWidth: '1500px' }}>
            <h2 style={{ textAlign: 'center', margin: '0px 0px 20px 0px', padding: '0' }}>Keyword Search</h2>
            <div className="search-controls">
                <input type="text" placeholder="Enter keyword (e.g., theft)" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
                <button onClick={handleSearch}>Search by Keyword</button>
            </div>
            
            <MapContainer center={[34.0522, -118.2437]} zoom={10} className='map-container' style={{ width: '90%', height: '380px', margin: '0 auto' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {currentItems.map((loc, index) => (
                    <Marker
                        key={index}
                        position={[loc.latitude, loc.longitude]}
                        icon={customIcon}
                        eventHandlers={{
                            click: () => fetchCrimeData(loc.longitude, loc.latitude)
                        }}
                    >
                        <Popup>
                            {selectedLocation && selectedLocation.longitude === loc.longitude && selectedLocation.latitude === loc.latitude ? (
                                <div>
                                    <h2>Crime Data</h2>
                                    {crimeData.map((data, idx) => (
                                        <div key={idx} style={{ background: getCrimeIntensityColor(data.occurrences), padding: '5px', margin: '2px', borderRadius: '5px', fontSize: '12px' }}>
                                            {simplifyCrimeType(data.crimeType)}: <strong>{data.occurrences}</strong>
                                        </div>
                                    ))}
                                    {imageData && (
                                        <div>
                                            <a href={`http://127.0.0.1:5001/images/${imageData.filename}`} target="_blank" rel="noopener noreferrer">
                                                <img src={`http://127.0.0.1:5001/images/${imageData.filename}`} alt="Street View" style={{ width: '300px' }} />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ) : "Loading..."}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
            <div className="search-controls">
                <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
                <span> Page {currentPage} </span>
                <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage * itemsPerPage >= crimeLocations.length}>Next</button>
            </div>
        </div>
    );
}

export default KeywordSearch;
