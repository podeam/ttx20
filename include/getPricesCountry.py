import pandas as pd

def prices_in_country(network):
    #target_countries = ["EE", "LV", "LT", "PL", "DK", "DE", "NO", "SE", "FI"]
    target_countries = ["EE", "LV", "LT"]

    # Initialize a dictionary to store prices
    prices_per_country = {}

    for country in target_countries:
        # Get the buses for this country
        country_buses_p = network.buses[network.buses["country"] == country].index

        # Retrieve marginal prices for the buses in this country
        country_prices = network.buses_t.marginal_price[country_buses_p]

        # Compute average price per snapshot for the country
        avg_price = country_prices.mean(axis=1)
        prices_per_country[country] = avg_price

    #converto in pandas dataframe
    df1 = pd.DataFrame(prices_per_country)
    #converto in json
    json_data1 = df1.to_json()

    json_data = [json_data1]
    return(json_data)

