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



export default function PlayerSideBar({player, playerList, onPlayerSelect}) {
    const [open, setOpen] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState({});
    const [players, setPlayers] = useState([]);

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
            <ChoosePlayerButton player={selectedPlayer} onClick={toggleDrawer(true)} />

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