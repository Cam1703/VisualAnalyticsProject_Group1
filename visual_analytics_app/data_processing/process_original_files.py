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

# %%
complete_dataset = read_all_files('../data')

# %% Filtering only interesting columns, separating winners and losers
basic_columns = [
    'tourney_name',
    'surface',
    'tourney_level',
    'tourney_date',
    'score',
    'round'
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

winners_data = complete_dataset[basic_columns + winners_profile_columns + winners_serve_columns]
losers_data = complete_dataset[basic_columns + losers_profile_columns + losers_serve_columns]
