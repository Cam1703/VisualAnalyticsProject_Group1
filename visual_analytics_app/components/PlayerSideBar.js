"use client";

import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { useEffect, useState } from 'react';
import {InputAdornment, TextField } from '@mui/material';
import ChoosePlayerButton from './ChoosePlayerButton';
import SearchIcon from '@mui/icons-material/Search';



export default function PlayerSideBar({
    player, 
    playerList, 
    onPlayerSelect,
    selectedYear,
    rankingsData
}) {
    const [open, setOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState({});
    const [players, setPlayers] = useState([]);

    // Vamos escrever uma função de util pra pegar o rank no array "rankingsData"
    function getRank(rankings, playerName, year) {
        if (!rankings || !playerName || !year) return null;

        // Filtra no array rankingsData o objeto com player=playerName e year=ano
        const found = rankings.find((r) => {
            return r.name === playerName && r.tourney_year === year
        });

        return found ? Number(found.ranking).toFixed(0) : null;
    }

    const rankThisYear = getRank(rankingsData, player?.name, selectedYear);
    console.log(rankThisYear);

    useEffect(() => {
        setSelectedPlayer(player || {});
        setPlayers(playerList || []);
    }, [player, playerList]);

    const toggleDrawer = (newOpen) => () => {
        setOpen(newOpen);
    };

    const changeSelection = (player) => {
        setSelectedPlayer(player);
        setOpen(false);

        if (onPlayerSelect) {
            onPlayerSelect(player);
        }
    }

    const filterPlayers = (searchText) => {
        const filteredPlayers = playerList.filter(player => player.name.toLowerCase().includes(searchText.toLowerCase()));
        setPlayers(filteredPlayers);
    }

    const DrawerList = (
        <Box sx={{ width: 250 }} role="presentation"> 
            {/* Search bar */}
            <TextField
                id="search-bar"
                label="Search"
                variant="standard"
                className='m-2'
                sx={{ width: '90%' }}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                                <SearchIcon />
                        </InputAdornment>
                    )
                }}
                onChange={(e) => filterPlayers(e.target.value)}
            />

            {/* List of players */}
            <List>
                {players.map((playerItem, index) => (
                    <ListItem key={index} disablePadding>
                        <ListItemButton onClick={() => changeSelection(playerItem)}>
                            <ListItemText primary={playerItem.name} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <div >
            {/* Button to open drawer */}
            <ChoosePlayerButton
                player={selectedPlayer} 
                onClick={toggleDrawer(true)}
                rank={rankThisYear} 
            />

            {/* Drawer */}
            <Drawer
                anchor="left"
                open={open}
                onClose={toggleDrawer(false)}
            >
                {DrawerList}
            </Drawer>
        </div>
    );
}