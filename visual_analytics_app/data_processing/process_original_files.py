# %% Importing packages
import pandas as pd
import numpy as np
import os

pd.options.display.max_columns = None

# %%
# Method to read original files
def read_all_files(directory):

    # List of all files in the directory
    csv_files = [file for file in os.listdir(directory)]

    dataframes = []

    for file in csv_files:

        # Full file path for each file
        complete_path = os.path.join(directory, file)
        dataframes.append(pd.read_csv(complete_path, encoding='ISO-8859-1'))

    # Joins separate files in single dataframe
    complete_dataset = pd.concat(dataframes)

    return complete_dataset


# Obtain the year of the tournament
def extract_year(date_value):
    return str(int(date_value))[:4]

# Removing the prefix of the columns
def remove_prefix(data, prefix):
    size = len(prefix)
    data.columns = [col[size:] if col.startswith(prefix) else col for col in data.columns]

# %%
complete_dataset = read_all_files('../data')
complete_dataset['tourney_year'] = complete_dataset['tourney_date'].apply(extract_year)

# Filtering only Grand-Slams, Masters 1000, ATP 500 and 250
filtered_tournaments = complete_dataset[complete_dataset['tourney_level'].isin(['G', 'M', 'A'])].copy()

# %% Filtering only interesting columns, separating winners and losers
basic_columns = [
    'tourney_name',
    'surface',
    'tourney_level',
    'tourney_date',
    'score',
    'round',
    'minutes'
]
player_column_suffixes = [
    'id',
    'name',
    'hand',
    'ht',
    'ioc',
    'rank',
    'rank_points'
]
serve_column_suffixes = [
    'ace',
    'df',
    'svpt',
    '1stIn',
    '1stWon',
    '2ndWon',
    'SvGms',
    'bpSaved',
    'bpFaced'
]

winners_profile_columns = ['winner_' + suffix for suffix in player_column_suffixes]
winners_serve_columns = ['w_' + suffix for suffix in serve_column_suffixes]
losers_profile_columns = ['loser_' + suffix for suffix in player_column_suffixes]
losers_serve_columns = ['l_' + suffix for suffix in serve_column_suffixes]

winners_data = filtered_tournaments[basic_columns + winners_profile_columns + winners_serve_columns].copy()
losers_data = filtered_tournaments[basic_columns + losers_profile_columns + losers_serve_columns].copy()

# %%
# Removing the prefix of the columns
remove_prefix(winners_data, 'winner_')
remove_prefix(winners_data, 'w_')
remove_prefix(losers_data, 'loser_')
remove_prefix(losers_data, 'l_')

# %%
losers_data