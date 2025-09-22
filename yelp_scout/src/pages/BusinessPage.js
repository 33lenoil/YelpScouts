import './BusinessPage.css';

import { useEffect, useId, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Link, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { NavLink, useNavigate } from 'react-router-dom';

import NavBar from '../components/NavBar';
import getBusinessPage from "../api/getBusinessPage";

import Chart from 'chart.js/auto';

const config = require('../config.json');

export default function BusinessPage() {
  const navigate = useNavigate();
  const { businessId } = useParams();
  const [highlightedKeyword, setHighlightedKeyword] = useState('');
  const [businessData, setBusinessData] = useState([]);
  const [userId, setUserId] = useState("");

  // Check userId from sessionStorage
  useEffect(() => {
    const storedUserId = sessionStorage.getItem("userId");
    if (storedUserId === null) {
      console.log("Unauthorized!");
      navigate("/");
    }
    else {
      setUserId(storedUserId);
    }
  }, []);

  // Get business data
  useEffect(() => {
    if (userId && businessId) {
      const getData = async () => {
        try {
          const response = await getBusinessPage(userId, businessId, highlightedKeyword);
          console.log(response);
          if (response.status === 200) {
            setBusinessData(response.data);
          } else if (response.status === 404) {
            throw new Error('Failed to fetch data');
          } else {
            console.log("You should not see this.");
          }
        } catch (error) {
          console.error('Failed to fetch data:', error);
        }
      };
      getData();
    }
  }, [userId, businessId, highlightedKeyword]);

  const handleClickKeyword = (keyword) => {
    console.log("clicked keyword");
    if (businessData[keyword]) {
      setHighlightedKeyword(businessData[keyword]);
      console.log("reset highlighted keyword");
    }
  };

  useEffect(() => {
    const ctx = document.getElementById('checkinChart').getContext('2d');
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        datasets: [{
          label: 'Daily Check-ins',
          data: [
            businessData.total_checkin_0,
            businessData.total_checkin_1,
            businessData.total_checkin_2,
            businessData.total_checkin_3,
            businessData.total_checkin_4,
            businessData.total_checkin_5,
            businessData.total_checkin_6
          ],
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            suggestedMin: 0,
            suggestedMax: Math.ceil(Math.max(...Object.values(businessData)))
          }
        },
        plugins: {
          legend: {
            labels: {
              font: {
                size: 16 // Adjust the font size here
              }
            }
          }
        }
      }
    });

    return () => {
      chart.destroy();
    };
  }, [businessData]);

  const formatDate = (dateString) => {
    if (typeof dateString !== 'string') return ''; // Check if dateString is not a string
    if (dateString.length !== 24) return dateString; // Check if dateString length is less than 5
    
    // Return the substring of dateString excluding the last 5 characters
    return dateString.substring(0, 10) + ' ' + dateString.substring(11, dateString.length - 5);
  };
  
  return (
    <div class="container">
      <NavBar />
      <h1 style={{ textAlign: 'center' }}>{businessData.name}</h1>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div class="upper-left">
          <p>Location: {businessData.address}, {businessData.city}, {businessData.state} {businessData.postal_code}</p>
          <p>Stars: {businessData.stars}</p>
          <p>{businessData.reservation_availability}</p>
          <p>Business Review Rating {businessData.num_visitor_offset}% {businessData.num_visitor_offset_more_less} than average</p>
          <p>Business Review Count {businessData.review_star_offset}% {businessData.review_star_offset_more_less} than average</p>
          <p>Number of visitors {businessData.total_reviews_offset}% {businessData.total_reviews_offset_more_less} than Average</p>
        </div>
        <div class="upper-right">
          <canvas id="checkinChart" width="200" height="100" style={{ marginLeft: '10px' }}></canvas>
        </div>
        <div class="bottom">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
            {businessData.keyword1 && <div style={{ padding: '5px', margin: '5px', backgroundColor: 'lightblue', borderRadius: '5px' }} onClick={() => handleClickKeyword('keyword1')}>{businessData.keyword1}</div>}
            {businessData.keyword2 && <div style={{ padding: '5px', margin: '5px', backgroundColor: 'lightblue', borderRadius: '5px' }} onClick={() => handleClickKeyword('keyword2')}>{businessData.keyword2}</div>}
            {businessData.keyword3 && <div style={{ padding: '5px', margin: '5px', backgroundColor: 'lightblue', borderRadius: '5px' }} onClick={() => handleClickKeyword('keyword3')}>{businessData.keyword3}</div>}
            {businessData.keyword4 && <div style={{ padding: '5px', margin: '5px', backgroundColor: 'lightblue', borderRadius: '5px' }} onClick={() => handleClickKeyword('keyword4')}>{businessData.keyword4}</div>}
          </div>
          <p>{businessData.text1}</p>
          <p>{formatDate(businessData.date1)}</p>
          <p>{businessData.text2}</p>
          <p>{formatDate(businessData.date2)}</p>
        </div>
      </div>
    </div>
  );
}