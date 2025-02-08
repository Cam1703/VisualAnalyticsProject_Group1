# %% Importing packages
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import os
import re

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

# Selecting top 20 players
def select_top_20_players(players_data):
    # Which 20 players have the most matches over the decade?
    matches_per_year = players_data.groupby(
        by=[
            'name'
        ]
    ).agg(
        {
            'win': 'sum',
            'tourney_name': 'count'
        }
    ).reset_index()

    matches_per_year.rename(
        columns={
            'tourney_name': 'total_matches',
            'win': 'match_wins'
        },
        inplace=True
    )

    matches_per_year['win_rate'] = matches_per_year['match_wins'] / matches_per_year['total_matches']
    selected_players = matches_per_year.sort_values(by=['match_wins', 'win_rate'], ascending=False)[:20]['name'].to_list()

    return selected_players

# Processing the score column into won and loss games
def parse_score(score, win):

    # No games scored in case of W/O
    if 'W/O' in score:
        return 0,0
    
    set_scores = score.split(' ')

    # Removing instances where player retired mid-match
    valid_set_scores = [set_score for set_score in set_scores if set_score not in ['RET', 'DEF', '']]

    # Calculating total games won and total games lost (by the winner)
    won_games = 0
    lost_games = 0
    for valid_set_score in valid_set_scores:
        games = valid_set_score.split('-')

        # Select only the initial numeric part (ex.: '10(8)' -> 10)
        left_side = int(re.match(r'\d+', games[0]).group())
        right_side = int(re.match(r'\d+', games[1]).group())
        
        won_games += left_side
        lost_games += right_side

    if win == 1:
        return won_games, lost_games
    return lost_games, won_games


# %%
def end_of_season_ranking(players_data):

    # Obtaining the date of the last played match of each season
    last_played_matches = players_data.groupby(
        by=[
            'name',
            'tourney_year'
        ]
    ).agg(
        {
            'tourney_date': 'max'
        }
    ).reset_index()

    # Obtaining the rank on final match of each season
    final_rankings = pd.merge(
        players_data[['name', 'tourney_year', 'tourney_date', 'rank']],
        last_played_matches,
        how='inner',
        on=[
            'name',
            'tourney_year',
            'tourney_date'
        ]
    ).drop_duplicates()

    final_rankings.rename(columns={'rank': 'end_of_season_rank'}, inplace=True)

    # Formatting output
    formatted_output = pd.merge(
        players_data,
        final_rankings[['name', 'tourney_year', 'end_of_season_rank']],
        how='left',
        on=[
            'name',
            'tourney_year'
        ]
    )

    return formatted_output


# %%
def process_serve_features(data):

    # Creating a copy of the original dataframe, removing NaN values for serve attributes
    processed_data = data[~data['ace'].isna()].copy()

    # Calculating amount of points played with 2nd serve
    processed_data['2ndIn'] = processed_data['svpt'] - (processed_data['df']  + processed_data['1stIn'])

    # Calculating percentages from absolute values
    processed_data['1st_in_percentage'] = processed_data['1stIn'] / processed_data['svpt']
    processed_data['1st_win_percentage'] = processed_data['1stWon'] / processed_data['1stIn']
    processed_data['2nd_win_percentage'] = processed_data['2ndWon'] / processed_data['2ndIn']
    processed_data['avg_pts_per_sv_game'] = processed_data['svpt'] / processed_data['SvGms']
    processed_data['saved_breaks_percentage'] = np.where(
        processed_data['bpFaced'] == 0,
        1,
        processed_data['bpSaved'] / processed_data['bpFaced']
    )

    return processed_data.reset_index(drop=True)
    

# %%
def dimensionality_reduction(data):
    
    # List of serve features
    serve_features = [
        'ace',
        'df',
        '1st_in_percentage',
        '1st_win_percentage',
        '2nd_win_percentage',
        'avg_pts_per_sv_game',
        'bpFaced'
        # 'saved_breaks_percentage'
    ]

    # Selecting only serve features
    X = data[serve_features]

    # Filling NaN values
    # X_filled = X.apply(lambda col: col.fillna(col.mean()), axis=0)

    # Normalizing the data
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Applying PCA
    pca = PCA(n_components=2)
    principal_components = pca.fit_transform(X_scaled)

    # Printing PCA information
    print('Loadings of 1st component:\n')
    print(pca.components_[0])
    print('Loadings of 2nd component:\n')
    print(pca.components_[1])
    # Variância explicada por cada componente
    print("Explained variance:\n", pca.explained_variance_)
    # Porcentagem de variância explicada
    print("Explained variance ratio:\n", pca.explained_variance_ratio_)

    # Formatting output
    df_pca = pd.DataFrame(
        data=principal_components, 
        columns=['serve_first_component', 'serve_second_component']
    )

    output_data = pd.concat([data, df_pca], axis=1)

    return output_data

# %%
# Reading files, extracting match year and creating match id
data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../data')
complete_dataset = read_all_files(data_dir)
complete_dataset['tourney_year'] = complete_dataset['tourney_date'].apply(extract_year)
complete_dataset['match_id'] = complete_dataset['tourney_year'] + '_' + complete_dataset['tourney_name'] + '_' + complete_dataset['winner_name'] + '_' + complete_dataset['loser_name']

# Filtering only Grand-Slams, Masters 1000, ATP 500 and 250
# Filtering only matches starting from 2010
tourney_level_filter = complete_dataset['tourney_level'].isin(['G', 'M', 'A'])
tourney_filter = ~complete_dataset['tourney_name'].isin(['Laver Cup'])
initial_date_filter = complete_dataset['tourney_year'] >= '2010'
final_date_filter = complete_dataset['tourney_year'] <= '2019'
filtered_tournaments = complete_dataset[tourney_filter & tourney_level_filter & initial_date_filter & final_date_filter].copy()

# %% Filtering only interesting columns, separating winners and losers
basic_columns = [
    'match_id',
    'tourney_name',
    'tourney_year',
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
# Selecting only matches played by the selected players
top_20_players = select_top_20_players(players_data)
top_players_matches = players_data[players_data['name'].isin(top_20_players)].copy()

# %% 
# Calculating the ranking of the player in the end of each season
matches_with_final_ranking = end_of_season_ranking(top_players_matches)

# %%
# Apply the parse_score function to each row
matches_with_final_ranking.loc[:, 'total_games_won'], matches_with_final_ranking.loc[:,'total_games_lost'] = zip(
    *matches_with_final_ranking.apply(
        lambda row: parse_score(row['score'], row['win']),
        axis=1
    )
)

# %%
# Processing serve attributes and applying PCA (dimensionality reduction)
processed_serve_attributes = process_serve_features(matches_with_final_ranking)
serve_principal_components = dimensionality_reduction(processed_serve_attributes)

# %%
# Saving each player's data in a csv file
players_data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..\\visual_analytics_app\\public\\players_data\\')

for player in top_20_players:
    player_matches = serve_principal_components[serve_principal_components['name'] == player].copy()
    player_matches.to_csv(players_data_dir + player + '.csv', index=False)
# %%
