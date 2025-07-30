import pandas as pd

def get_links(network):
    line_data = []

    selected_links = network.links[
        (network.links["bus0"].str.contains("EE")) | 
        (network.links["bus0"].str.contains("LV")) | 
        (network.links["bus0"].str.contains("LT")) | 
        (network.links["bus0"].str.contains("PL")) | 
        (network.links["bus0"].str.contains("NO")) | 
        (network.links["bus0"].str.contains("SE")) | 
        (network.links["bus0"].str.contains("FI"))
        ]

    selected_link_ids = selected_links.index
    #print(selected_link_ids)
    
    for link_id in selected_link_ids:
        link = network.links.loc[link_id]
        #print(link)
        linkst = network.links_t["p0"]
        if linkst.empty:
            timeseries_data = 0
        else:
            td = linkst[link_id]
            if td.empty:
                timeseries_data = 0
            else:
                timeseries_data = td.sum()
        #print(timeseries_data)
        if link_id.find("TYNDP2020_33") != -1 :
            line_data.append({
                "line_name": link_id,
                "line_flows": timeseries_data,
                "link": link
            })
        if link_id.find("TYNDP2018_190") != -1 :
            line_data.append({
                "line_name": link_id,
                "line_flows": timeseries_data,
                "link": link
            })
        if link_id.find("relation") != -1 :
            line_data.append({
                "line_name": link_id,
                "line_flows": timeseries_data,
                "link": link
            })
    #print(line_data)
    #target_countries = ["EE", "LV", "LT", "PL", "DK", "DE", "NO", "SE", "FI"]
    target_countries = ["EE", "LV", "LT", "PL", "NO", "SE", "FI"]
    #prendo tutti i buses nella lista dei paesi
    buses_in_countries = network.buses[ network.buses["country"].isin(target_countries) ]
    filtered_links = network.links
    #print(filtered_links)
    filtered_links = filtered_links[network.links["bus0"].isin(buses_in_countries.index) & network.links["bus1"].isin(buses_in_countries.index)]
    bus_coords = buses_in_countries[["x", "y"]]
    # Merge links with coordinates for bus0 and bus1
    
    filtered_links = (network.links
        .reset_index()  # Ensure link names are accessible
        .merge(bus_coords, left_on="bus0", right_index=True, suffixes=("", "_bus0"))
        .merge(bus_coords, left_on="bus1", right_index=True, suffixes=("", "_bus1"))
    )
    
    #print(filtered_links)
    #converto in pandas dataframe
    df1 = pd.DataFrame(filtered_links)
    df2 = pd.DataFrame(line_data)
    #converto in json
    json_data1 = df1.to_json(orient="records")
    json_data2 = df2.to_json(orient="records")
    #converto in json
    json_data = [json_data1, json_data2]
    return(json_data)