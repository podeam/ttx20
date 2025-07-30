import pypsa
import pandas as pd
import json

def price_trend(n, country_code=''):
    country_code = 'EE'
    # Get the electricity prices
    prices = n.buses_t.marginal_price
    # Filter buses belonging to the given country
    country_buses = n.buses[n.buses.index.str.startswith(country_code)]
    if country_buses.empty:
        raise ValueError(f"No buses found for country code: {country_code}")
    # Extract prices for the country's buses
    country_prices = prices[country_buses.index]
    # Compute the average price over time
    price_trend_df = country_prices.mean(axis=1)
    price_trend_df_ee = price_trend_df.to_frame(name="price") #Average Price (EUR/MWh)

    country_code = 'LT'
    prices = n.buses_t.marginal_price
    # Filter buses belonging to the given country
    country_buses = n.buses[n.buses.index.str.startswith(country_code)]
    if country_buses.empty:
        raise ValueError(f"No buses found for country code: {country_code}")
    # Extract prices for the country's buses
    country_prices = prices[country_buses.index]
    # Compute the average price over time
    price_trend_df = country_prices.mean(axis=1)
    price_trend_df_lt = price_trend_df.to_frame(name="price") #Average Price (EUR/MWh)

    country_code = 'LV'
    prices = n.buses_t.marginal_price
    # Filter buses belonging to the given country
    country_buses = n.buses[n.buses.index.str.startswith(country_code)]
    if country_buses.empty:
        raise ValueError(f"No buses found for country code: {country_code}")
    # Extract prices for the country's buses
    country_prices = prices[country_buses.index]
    # Compute the average price over time
    price_trend_df = country_prices.mean(axis=1)
    price_trend_df_lv = price_trend_df.to_frame(name="price") #Average Price (EUR/MWh)

    json_data1 = price_trend_df_ee.to_json(orient="records")
    json_data2 = price_trend_df_lt.to_json(orient="records")
    json_data3 = price_trend_df_lv.to_json(orient="records")
    json_data = [json_data1, json_data2, json_data3]
    json_output = json.dumps({"data": json_data})

    return json_output

# network = pypsa.Network()
# network.import_from_netcdf("/app/import/cut_LTpp_256_solved.nc")

# country = "DE" 
# trend_table = price_trend(network, country)
# print(trend_table)
