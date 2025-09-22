import { useEffect, useState } from "react";
import { Container, Button, Slider, Divider } from "@mui/material";
import { NavLink, useNavigate } from "react-router-dom";

import LazyTable from "../components/LazyTable";
import NavBar from "../components/NavBar";
import businessRec from "../api/getRecs";
import businessSearch from "../api/businessSearch";

const config = require("../config.json");

export default function HomePage() {
  const navigate = useNavigate();
  const [stars, setStars] = useState([0, 5]);
  const [tableName, setTableName] = useState("Recommendations");
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState(0);
  const [category, setCategory] = useState("");
  const [searchClicked, setSearchClicked] = useState(0);

  useEffect(() => {
    console.log('rerender');
    const storedUserId = sessionStorage.getItem("userId");
    if (storedUserId === null) {
      console.log("Unauthorized!");
      navigate("/");
    }
    else {
      setUserId(storedUserId);
    }
  }, []);

  console.log(userId);
  const marks = [
    {
      value: 0,
      label: "0",
    },
    {
      value: 1,
      label: "1",
    },
    {
      value: 2,
      label: "2",
    },
    {
      value: 3,
      label: "3",
    },
    {
      value: 4,
      label: "4",
    },
    {
      value: 5,
      label: "5",
    },
  ];

  let handleSearch = () => {
    setTableName("Results");
    setSearchClicked(searchClicked + 1)
  };

  let handleShowRecommendations = () => {
    setTableName("Recommendations");
  };

  const businessColumns = [
    {
      field: "name",
      headerName: "Business Name",
      renderCell: (row) => (
        <NavLink to={`/business/${row.business_id}`}>{row.name}</NavLink>
      ),
    },
    { field: "address", headerName: "Address" },
    { field: "city", headerName: "City" },
    { field: "avg_stars_rating", headerName: "Stars" },
    { field: "category", headerName: "Category" }
  ];

  const recColumns = [
    {
      field: "name",
      headerName: "Business Name",
      renderCell: (row) => (
        <NavLink to={`/business/${row.business_id}`}>{row.name}</NavLink>
      ),
    },
    { field: "address", headerName: "Address" },
    { field: "city", headerName: "City" },
    { field: "avg_review_star", headerName: "Stars" },
  ];

  console.log(stars);

  /// DELETE THE BUTTON ON THE TOP OF PAGE!!!
  return (
    <div>
      <NavBar />
      <Container
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "monospace",
        }}
      >
        <h1 style={{ textAlign: "center", fontSize: "40px" }}>
          Search businesses
        </h1>
        <form
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            fontSize: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <label for="nameInput">Business Name:&nbsp;</label>
            <input type="text" id="nameInput" onChange={(e) => setName(e.target.value)}></input>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <label for="categoryInput">Category:&nbsp;</label>
            <input type="text" id="categoryInput" onChange={(e) => setCategory(e.target.value)}></input>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <label for="cityInput">City:&nbsp;</label>
            <input type="text" id="cityInput" onChange={(e) => setCity(e.target.value)}></input>
            <label for="stateSelect">&nbsp;State:&nbsp;</label>
            <select id="stateSelect" onChange={(e) => setState(e.target.value)}>
              <option value="ALL">Select</option>
              <option value="AL">AL</option>
              <option value="AK">AK</option>
              <option value="AZ">AZ</option>
              <option value="AR">AR</option>
              <option value="AS">AS</option>
              <option value="CA">CA</option>
              <option value="CO">CO</option>
              <option value="CT">CT</option>
              <option value="DE">DE</option>
              <option value="DC">DC</option>
              <option value="FL">FL</option>
              <option value="GA">GA</option>
              <option value="GU">GU</option>
              <option value="HI">HI</option>
              <option value="ID">ID</option>
              <option value="MN">MN</option>
              <option value="MS">MS</option>
              <option value="MO">MO</option>
              <option value="MT">MT</option>
              <option value="NE">NE</option>
              <option value="NV">NV</option>
              <option value="NH">NH</option>
              <option value="NJ">NJ</option>
              <option value="NM">NM</option>
              <option value="NY">NY</option>
              <option value="NC">NC</option>
              <option value="ND">ND</option>
              <option value="MP">MP</option>
              <option value="OH">OH</option>
              <option value="OK">OK</option>
              <option value="OR">OR</option>
              <option value="PA">PA</option>
              <option value="PR">PR</option>
              <option value="RI">RI</option>
              <option value="SC">SC</option>
              <option value="SD">SD</option>
              <option value="TN">TN</option>
              <option value="TX">TX</option>
              <option value="TT">TT</option>
              <option value="UT">UT</option>
              <option value="VT">VT</option>
              <option value="VA">VA</option>
              <option value="VI">VI</option>
              <option value="WA">WA</option>
              <option value="WV">WV</option>
              <option value="WI">WI</option>
              <option value="WY">WY</option>
            </select>
            <label for="zipInput">&nbsp;Zip Code:&nbsp;</label>
            <input type="number" id="zipInput" onChange={(e) => setPostalCode(e.target.value)}></input>
          </div>
          <label for="starSlider">Stars:&nbsp;</label>
          <Slider
            id="starSlider"
            value={stars}
            min={0}
            max={5}
            step={0.5}
            onChange={(event, newValue) => setStars(newValue)}
            marks={marks}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div style={{ marginRight: "80px" }} onClick={handleSearch}>
              <Button style={{ fontFamily: "monospace" }}>Search</Button>
            </div>
            <div onClick={handleShowRecommendations}>
              <Button style={{ fontFamily: "monospace" }}>Show Recommendations</Button>
            </div>
          </div>
        </form>
        <Divider />
        <h2>{tableName}</h2>
        {tableName === "Recommendations" && <LazyTable
          route={businessRec}
          args={
            [
              sessionStorage.getItem("userId"),
            ]
          }
          columns={recColumns}
          defaultPageSize={5}
          rowsPerPageOptions={[5, 10]}
        />}
        {tableName === "Results" && <LazyTable
          route={businessSearch}
          args={
            [
              sessionStorage.getItem("userId"),
              name,
              city,
              state,
              postalCode,
              stars[0],
              stars[1],
              category
            ]
          }
          columns={businessColumns}
          defaultPageSize={5}
          rowsPerPageOptions={[5, 10]}
          search={searchClicked}
        />}
      </Container>
    </div>
  );
}
