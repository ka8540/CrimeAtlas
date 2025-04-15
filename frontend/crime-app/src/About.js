

import React from 'react';
import './About.css';

function AboutCrimeAtlas() {
  return (
    <div className="about-page">
      <div className="about-toggle-container">
      </div>

      <h1 className="about-title">CrimeAtlas</h1>
      <p className="about-intro">
        <strong>CrimeAtlas</strong> is an interactive dashboard built using crime data provided by the Los Angeles Police Department (LAPD), covering incidents from 2020 to the present. The platform is designed to help citizens, researchers, and policymakers explore and understand public safety trends across the city of Los Angeles.
      </p>

      <section>
        <h2 className="about-subtitle">📊 Data Source & Accuracy</h2>
        <p>
          The data is transcribed from original crime reports submitted by LAPD officers. Due to manual transcription, some inaccuracies may exist. Locations are rounded to the nearest hundred block to preserve privacy. Records with incomplete location info are marked as (0°, 0°).
        </p>
        <p>
          This dataset includes over <strong>1 million records</strong> and contains detailed attributes like date and time, area and division, type of crime, suspect information, weapons used, and more.
        </p>
      </section>

      <section>
        <h2 className="about-subtitle">🔎 Search Feature Overview</h2>
        <p>CrimeAtlas provides three core search tools for data exploration:</p>

        <h3>🧭 Basic Search</h3>
        <ul>
          <li>Search crimes by <strong>date of occurrence</strong> and <strong>type of crime</strong>.</li>
          <li>Results are visualized using interactive map markers.</li>
          <li>Click on a marker to view popup information about the incident.</li>
        </ul>

        <h3>🌐 Advanced Search</h3>
        <ul>
          <li>Input a <strong>location</strong> (e.g., "Hollywood") and set a <strong>search radius</strong>.</li>
          <li>Returns all crimes within the specified area using geospatial queries.</li>
          <li>Each result includes Google Street View images and a community comment section.</li>
        </ul>

        <h3>🔤 Keyword Search</h3>
        <ul>
          <li>Search for crimes by entering a specific <strong>keyword</strong> like "robbery" or "burglary".</li>
          <li>All incidents matching the description are plotted on a map.</li>
          <li>Markers display the frequency and description of each matching crime.</li>
          <li>Images from the scene are shown using Google Street View.</li>
        </ul>
      </section>

      <section>
        <h2 className="about-subtitle">🗃️ What's in the Data?</h2>
        <p>This dataset includes detailed fields that describe each crime incident:</p>
        <div className="data-glossary">
          <table>
            <thead>
              <tr>
                <th>Column Name</th>
                <th>Description</th>
                <th>API Field</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>DR_NO</td><td>Official file number combining year, area ID, and sequence</td><td>dr_no</td><td>Text</td></tr>
              <tr><td>Date Rptd</td><td>Date the report was filed</td><td>date_rptd</td><td>Timestamp</td></tr>
              <tr><td>DATE OCC</td><td>Date the crime occurred</td><td>date_occ</td><td>Timestamp</td></tr>
              <tr><td>TIME OCC</td><td>Time of occurrence (24-hour)</td><td>time_occ</td><td>Text</td></tr>
              <tr><td>AREA NAME</td><td>LAPD patrol division where the crime occurred</td><td>area_name</td><td>Text</td></tr>
              <tr><td>Crm Cd</td><td>Primary crime code</td><td>crm_cd</td><td>Text</td></tr>
              <tr><td>Crm Cd Desc</td><td>Description of the crime code</td><td>crm_cd_desc</td><td>Text</td></tr>
              <tr><td>Vict Age</td><td>Age of the victim</td><td>vict_age</td><td>Text</td></tr>
              <tr><td>Vict Sex</td><td>Gender of the victim</td><td>vict_sex</td><td>Text</td></tr>
              <tr><td>Vict Descent</td><td>Ethnicity of the victim</td><td>vict_descent</td><td>Text</td></tr>
              <tr><td>Premis Cd</td><td>Code of the premise where crime occurred</td><td>premis_cd</td><td>Number</td></tr>
              <tr><td>Premis Desc</td><td>Description of the premise</td><td>premis_desc</td><td>Text</td></tr>
              <tr><td>Weapon Used Cd</td><td>Weapon code used in the crime</td><td>weapon_used_cd</td><td>Text</td></tr>
              <tr><td>Weapon Desc</td><td>Description of the weapon</td><td>weapon_desc</td><td>Text</td></tr>
              <tr><td>Status Desc</td><td>Status of the case</td><td>status_desc</td><td>Text</td></tr>
              <tr><td>Crm Cd 2</td><td>Secondary crime code</td><td>crm_cd_2</td><td>Text</td></tr>
              <tr><td>LOCATION</td><td>Street-level address (anonymized)</td><td>location</td><td>Text</td></tr>
              <tr><td>Cross Street</td><td>Nearest cross street</td><td>cross_street</td><td>Text</td></tr>
              <tr><td>LAT</td><td>Latitude coordinate</td><td>lat</td><td>Number</td></tr>
              <tr><td>LON</td><td>Longitude coordinate</td><td>lon</td><td>Number</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="about-subtitle">🙌 Credits</h2>
        <ul className="credits-list">
          <li>Kush Ahir</li>
          <li>Ayush Setpal</li>
          <li>Sameeksha Rao</li>
          <li>Aarushi Sharma</li>
          <li>Aditya Joshi</li>
          <li>Prasad Adahu</li>
        </ul>
      </section>
    </div>
  );
}

export default AboutCrimeAtlas;
