import pandas as pd

def lines_in_country(network):
    target_countries = ["EE", "LV", "LT", "PL", "DK", "DE", "NO", "SE", "FI"]
    #prendo tutti i buses nella lista dei paesi
    buses_in_countries = network.buses[
        network.buses["country"].isin(target_countries)
    ]
    #filtro nel dataframe le colonne che mi interessano
    #filtered_lines = network.lines[['type', 'bus0', 'bus1']]
    filtered_lines = network.lines
    filtered_lines = filtered_lines[
        network.lines["bus0"].isin(buses_in_countries.index) &
        network.lines["bus1"].isin(buses_in_countries.index)
    ]


    #converto in pandas dataframe
    df1 = pd.DataFrame(buses_in_countries)
    df2 = pd.DataFrame(filtered_lines)
    #converto in json
    json_data1 = df1.to_json()
    json_data2 = df2.to_json()

    json_data = [json_data1, json_data2]
    return(json_data)

