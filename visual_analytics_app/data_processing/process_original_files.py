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
# Filtering only matches starting from 2010
tourney_filter = complete_dataset['tourney_level'].isin(['G', 'M', 'A'])
initial_date_filter = complete_dataset['tourney_year'] >= '2010'
final_date_filter = complete_dataset['tourney_year'] <= '2019'
filtered_tournaments = complete_dataset[tourney_filter & initial_date_filter & final_date_filter].copy()

# %% Filtering only interesting columns, separating winners and losers
basic_columns = [
    'tourney_name',
    'tourney_year',
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
# Adding boolean indicator for result of the match
winners_data['win'] = 1
losers_data['win'] = 0

# %%
# Joining winners and losers data
players_data = pd.concat(
    [
        winners_data,
        losers_data
    ],
    axis=0
)

# %%
# Which 20 players have the most matches over the years?
matches_per_year = players_data.groupby(
    by=[
        'name',
        # 'tourney_year'
    ]
).agg(
    {
        'win': 'sum',
        'tourney_name': 'count'
    }
).reset_index()

# %%
matches_per_year.rename(
    columns={
        'tourney_name': 'total_matches',
        'win': 'match_wins'
    },
    inplace=True
)

# %%
matches_per_year['win_rate'] = matches_per_year['match_wins'] / matches_per_year['total_matches']
# %%
selected_players = matches_per_year.sort_values(by=['match_wins', 'win_rate'], ascending=False)[:20]['name'].to_list()

# %%
# %%
