import pandas as pd
import json
 
def calculate_price(n):
    # Get the electricity prices
    baltic_states = ["EE", "LV", "LT"]
    load_bus=n.loads_t.p_set.groupby(n.loads.bus,axis=1).sum()
    load_country=load_bus.groupby(n.loads.bus.map(n.buses.country),axis=1).sum()
    marginalprice_bus= n.buses_t.marginal_price.reindex(n.loads.bus, axis=1)
    price_bus=marginalprice_bus*load_bus
    prices=price_bus.groupby(n.buses.country,axis=1).sum()
    hourly_price_country_perhour=prices/load_country
    hourly_price_country= prices.sum()/load_country.sum()
 
        # Convert results to a DataFrame
    avg_prices_df = pd.DataFrame(hourly_price_country.items(), columns=["Country", "Average Price (EUR/MWh)"])
    avg_prices_df=avg_prices_df[avg_prices_df["Country"].isin(baltic_states)]
   
    price_hourly=pd.DataFrame(hourly_price_country_perhour.items(), columns=["Country", "Price (EUR/MWh)"])
    price_hourly=price_hourly[price_hourly["Country"].isin(baltic_states)]
 
    avg_prices_json = avg_prices_df.set_index("Country")["Average Price (EUR/MWh)"].to_json()
 
    # Convert hourly prices to JSON (structured time series format)
    hourly_prices_json = (
        price_hourly.set_index("Country")["Price (EUR/MWh)"]
        .apply(pd.Series)  # Expand the dictionary of timestamps into columns
        .T  # Transpose to have timestamps as keys
        .to_json(date_format="iso")  # Convert to JSON with ISO timestamps
    )
    json_data = [avg_prices_json, hourly_prices_json]
    json_output = json.dumps({"data": json_data})
    return json_output
 