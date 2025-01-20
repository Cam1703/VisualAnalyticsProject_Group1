import { Box, Paper } from "@mui/material";

export default function PlotChart() {
    return (
        <Box component={Paper} elevation={3} sx={{ display: 'flex', textAlign: "center", width: '100%', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <h1>Top left //TODO: implement dimensionality reduction</h1>
        </Box>
    );
}