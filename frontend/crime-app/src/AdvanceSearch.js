import React, { useState, useContext } from 'react';
import { UserContext } from './App';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './AdvanceSearch.css';

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
    return crimeType.split(' ').slice(0, 3).join(' ');
}

function AdvanceSearch() {
    const [location, setLocation] = useState('');
    const [maxDistance, setMaxDistance] = useState(5000);
    const [crimeLocations, setCrimeLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [crimeData, setCrimeData] = useState(null);
    const [imageData, setImageData] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const { user } = useContext(UserContext);

    console.log('AdvancedSearch object:', user);

    const fetchLocations = async (location, maxDistance) => {
        try {
            const response = await axios.get(`http://127.0.0.1:5001/get_crime_data_by_location?location=${location}&maxDistance=${maxDistance}`);
            setCrimeLocations(response.data);
        } catch (error) {
            console.error('Error fetching locations:', error);
        }
    };

    const fetchCrimeData = async (longitude, latitude) => {
        try {
            const response = await axios.get(`http://127.0.0.1:5001/get_crime_data_at_coordinates?longitude=${longitude}&latitude=${latitude}`);
            setCrimeData(response.data.crimeData);
            setImageData(response.data.imageData);
            setComments(response.data.comments || []);
            setSelectedLocation({ longitude, latitude });
        } catch (error) {
            console.error('Error fetching crime data:', error);
        }
    };

    const handleSearch = () => {
        fetchLocations(location, maxDistance);
    };

    const handleAddComment = async (longitude, latitude) => {
        if (!newComment.trim()) return;
        console.log('User object:', user);

        try {
            const response = await axios.post('http://127.0.0.1:5001/add_comment', {
                longitude,
                latitude,
                text: newComment,
                user: user ? user.email : 'Anonymous' // Use logged-in user's email
            });
            setComments([...comments, response.data.comment]);
            setNewComment('');
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };


    return (
        <div style={{ width: '85%', margin: '20px auto', padding: '20px', maxWidth: '1500px' }}>
            <h2 style={{ textAlign: 'center', margin: '0px 0px 30px 0px', padding: '0' }}>Advanced Search</h2>
            <div className="search-controls">
                <input type="text" placeholder="Enter location (e.g., Los Angeles)" value={location} onChange={(e) => setLocation(e.target.value)} />
                <input type="number" placeholder="Max distance (meters)" value={maxDistance} onChange={(e) => setMaxDistance(e.target.value)} />
                <button onClick={handleSearch}>Search</button>
            </div>
            <MapContainer center={[34.0522, -118.2437]} zoom={10} className="map-container" style={{ height: '400px', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {crimeLocations.map((loc, index) => (
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
                                <div className='scrollable-popup'>
                                    <h2>Crime Data</h2>
                                    {crimeData && crimeData.map((data, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                background: getCrimeIntensityColor(data.occurrences),
                                                padding: '5px',
                                                margin: '2px',
                                                borderRadius: '5px',
                                                fontSize: '12px'
                                            }}
                                        >
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
                                    <h3>Comments</h3>
                                    {comments.length > 0 ? (
                                        <ul style={{ listStyleType: 'none', padding: 0 }}>
                                            {comments.map((comment, idx) => (
                                                <li key={idx} style={{ margin: '5px 0', fontSize: '12px' }}>
                                                    <strong>{comment.user}:</strong> {comment.text} <br />
                                                    <small>{new Date(comment.createdAt).toLocaleString()}</small>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>No comments yet.</p>
                                    )}
                                    <div>
                                        <input
                                            type="text"
                                            className='comment-input'
                                            placeholder="Add a comment"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                        />
                                        <button className='submit-comment'
                                            onClick={() => handleAddComment(loc.longitude, loc.latitude)}
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </div>
                            ) : "Loading..."}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}

export default AdvanceSearch;
