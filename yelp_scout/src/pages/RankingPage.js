import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import LazyTable from "../components/LazyTable";
import NavBar from "../components/NavBar";
import topBusinesses from "../api/getTops";

export default function RankingPage() {
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
        { field: "first_category", headerName: "Category" },
        { field: "stars", headerName: "Stars" },
        { field: "ind", headerName: "Popularity Index" },
        { field: "quality_rank", headerName: "Quality Rank" },
        { field: "ambiance_rank", headerName: "Ambiance Rank" },
    ];

    return (
        <div>
            <NavBar />
            <div style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                fontFamily: "monospace"
            }}>
                <h1>Top Businesses</h1>
                <LazyTable
                    route={topBusinesses}
                    args={[]}
                    columns={businessColumns}
                    defaultPageSize={10}
                    rowsPerPageOptions={[5, 10]}
                />
            </div>
        </div>
    );
}