import pypsa
import pandas as pd
 
def calculate_average_price(n):
    # Get the electricity prices
   
    load_bus=n.loads_t.p_set.groupby(n.loads.bus,axis=1).sum()
    load_country=load_bus.groupby(n.loads.bus.map(n.buses.country),axis=1).sum()
    marginalprice_bus= n.buses_t.marginal_price.reindex(n.loads.bus, axis=1)
    price_bus=marginalprice_bus*load_bus
    prices=price_bus.groupby(n.buses.country,axis=1).sum()
    #hourly_price_country_perhour=prices/load_country
    hourly_price_country= prices.sum()/load_country.sum()
 
    # Convert results to a DataFrame
    avg_prices_df = pd.DataFrame(hourly_price_country.items(), columns=["Country", "AveragePrice"])
    #avg_hourly_prices_df = pd.DataFrame(hourly_price_country.items(), columns=["Country", "Average Price (EUR/MWh)"])
    # return avg_prices_df.to_json(orient="records")
    return avg_prices_df.to_json(orient="records")






#avg_prices_df = pd.DataFrame(avg_prices.items(), columns=["Country", "AveragePrice"]) #Average Price (EUR/MWh)