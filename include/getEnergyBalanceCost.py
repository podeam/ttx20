import pandas as pd
from shapely.geometry import Point
import numpy as np 
from matplotlib.colors import Normalize, LinearSegmentedColormap
from matplotlib.cm import ScalarMappable
import pypsa
from pypsa.descriptors import get_switchable_as_dense as as_dense
import matplotlib.pyplot as plt
from shapely.geometry import Point
from shapely.geometry import box
from mpl_toolkits.axes_grid1 import make_axes_locatable
from mpl_toolkits.axes_grid1.inset_locator import inset_axes
import matplotlib.colors as mcolors
import matplotlib.lines as mlines
from matplotlib.patches import Patch
plt.style.use("bmh")
from matplotlib.lines import Line2D
import math
import geopandas as gpd

#n=pypsa.Network("../networks/cut_LVnode_256_ts_solved.nc")
#n= pypsa.Network("../import/base_network_256_solved.nc")

carrier_pypsa_dsr_cap =['oil','coal', 'lignite','CCGT', 'OCGT', 'nuclear', 'biomass','offwind-ac','offwind-dc',  'onwind', 'solar', 'ror', 'hydro','Total','____','dsr','phs']
#for energy mix
carrier_pypsa_dsr_gen =['oil','coal', 'lignite','CCGT', 'OCGT', 'nuclear', 'biomass','offwind-ac','offwind-dc',  'onwind', 'solar', 'hydro_total', 'dsr','Total']
#for plotting the energy service

#country_links= n.links.bus1.map(n.buses.country)

#countries=n.buses.country.unique()
countries=['AL', 'AT', 'BA', 'BE', 'BG', 'CH', 'CZ', 'DE', 'DK', 'EE', 'ES',
       'FI', 'FR', 'GB', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV',
       'ME', 'MK', 'NL', 'NO', 'PL', 'PT', 'RO', 'RS', 'SE', 'SI', 'SK',
       'XK']
countries_DE=['NO','SE','FI', 'EE', 'LV', 'LT','PL','DK']

start="2016-01-01"
end="2016-01-07"

def capacities(n):
    country_links= n.links.bus1.map(n.buses.country)
    hydro_cap=n.links.query("carrier=='hydro'").p_nom.filter(like="to AC").groupby(country_links).sum()
    hydro_cap=hydro_cap.reindex(countries).fillna(0)
    dischargers=n.links.filter(like='AC to',axis=0)
    dischargers.p_nom.groupby(dischargers.bus0.map(n.buses.country)).sum().reindex(index=countries).round().fillna(0)

    cap2=n.generators.p_nom.groupby([n.generators.bus.map(n.buses.country), n.generators.carrier],axis=0).sum().unstack().fillna(0).loc[countries,:].round()
    cap=cap2.copy()
    cap= cap2.drop(['','dsr'],axis=1) #'dsr'
    cap.loc[countries,"hydro"]=hydro_cap.loc[countries].round()
       #cap.loc[countries,"phs"]=phs_cap.loc[countries].round()
    cap.loc[countries,"Total"]=cap.sum(axis=1)
    cap.loc[countries, 'dsr']=cap2.loc[countries,'dsr']
    cap.loc[countries, "phs"]=dischargers.p_nom.groupby(dischargers.bus0.map(n.buses.country)).sum().reindex(index=countries).round().fillna(0)
    for i in cap.columns:
        if cap.loc[:,i].sum()<10:
            cap=cap.drop(i, axis=1)
    cap=cap.reindex(columns=carrier_pypsa_dsr_cap)
    return cap

# ENERGY BALANCE
#first, calculation of generation and losses from hydro
def hydro_fromlinks(n):
    country_links= n.links.bus1.map(n.buses.country)
    phs=pd.DataFrame(index=countries)
    AC_to_PHS=n.links_t.p0.filter(like="AC to PHS")
    PHS_to_AC=n.links_t.p1.filter(like="PHS to AC")
    hydro_to_AC=n.links_t.p1.filter(like="hydro to AC")
    AC_to_PHS=curve_year(AC_to_PHS,start, end)
    PHS_to_AC=curve_year(PHS_to_AC,start, end)
    hydro_to_AC=curve_year(hydro_to_AC,start, end)
    for country in countries:
        phs.loc[country, 'phs_in']=AC_to_PHS.sum().filter(like=country).sum()/1000
        phs.loc[country,'phs_out']=PHS_to_AC.sum().filter(like=country).sum()/1000
        phs.loc[country,'losses_phs']=phs.loc[country, 'phs_in']+phs.loc[country,'phs_out']

    phs= phs.fillna(0).round()

    hydro_pypsa=hydro_to_AC.sum().groupby(country_links).sum().div(1000)
    hydro_pypsa=hydro_pypsa.reindex(countries).fillna(0) #'2016-01-14':'2016-01-27'
    phs_pypsa_in= phs.loc[countries, 'phs_in']
    phs_pypsa_out= phs.loc[countries, 'phs_out']
    return phs, hydro_pypsa, phs_pypsa_in, phs_pypsa_out

def total_energy_mix(n):
    phs, hydro_pypsa, phs_pypsa_in, phs_pypsa_out= hydro_fromlinks(n)
    energy_mix_all= n.generators_t.p.loc[:,~n.generators_t.p.columns.str.contains('lost-load')].groupby([n.generators.bus.map(n.buses.country), n.generators.carrier], axis=1).sum()
    energy_mix_all=curve_year(energy_mix_all,start, end)
    
    energy_mix2=energy_mix_all.sum(axis=0).unstack().loc[countries,:].fillna(0).div(1000)
    energy_mixe=energy_mix2.copy()
    energy_mix= energy_mix2.drop(['ror'],axis=1) #'dsr'
    energy_mix.loc[:,'hydro_total']=energy_mix2.loc[:,'ror']-phs_pypsa_in.loc[countries].round()-phs_pypsa_out.loc[countries].round()-hydro_pypsa.loc[countries].round()
    energy_mixe=energy_mix.round()
    energy_mix.loc[countries,"Total"]=energy_mix.sum(axis=1)
    
    for i in energy_mix.columns:
        if abs(energy_mix.loc[:,i].sum())<0:
            energy_mix=energy_mix.drop(i, axis=1)
    energy_mix=energy_mix.round()
    
    # Apply highlighting function
    column_to_compare='Total'
    energy_mix= energy_mix.round(0).astype(int)
    energy_mix=energy_mix.loc[countries,carrier_pypsa_dsr_gen]
    energy_mix_yellow = energy_mix.style.apply(lambda x: ['background-color: lightyellow' if val > 0.3*x[column_to_compare] else '' for val in x], axis=1)
    
    return energy_mix_yellow, energy_mix

def total_energy_balance(n): 
    phs, hydro_pypsa, phs_pypsa_in, phs_pypsa_out= hydro_fromlinks(n)
    hydro_pypsa=hydro_pypsa.reindex(countries).fillna(0)
    
    loads=n.loads_t.p.loc[:,:].groupby(n.loads.bus.map(n.buses.country),axis=1).sum()
    loads=curve_year(loads,start, end)
    loads= loads.sum().div(1000)
    
    lost_load=n.generators_t.p.loc[:,:].filter(like='lost-load',axis=1).groupby(n.generators.bus.map(n.buses.country), axis=1).sum()
    lost_load=curve_year(lost_load,start, end)
    
    gen_country= n.generators_t.p.loc[:,~n.generators_t.p.columns.str.contains('lost-load')].groupby(n.generators.bus.map(n.buses.country),axis=1).sum()
    gen_country= curve_year(gen_country,start, end)
    gen_country=gen_country.sum()

    energy_balance=pd.DataFrame(index=countries)
    energy_balance["demand"]=-loads.loc[countries].round()
    energy_balance["gen"]=gen_country[countries].div(1000).round()
    energy_balance["gen_hydro"]=-hydro_pypsa[countries].round()
    energy_balance["phs_in"]=phs.loc[countries,'phs_in']
    energy_balance["phs_out"]=phs.loc[countries,'phs_out']
    energy_balance["int_gen"]=(-hydro_pypsa[countries].round()+gen_country[countries].div(1000).round()).round()-phs.loc[countries,'losses_phs']
    energy_balance["intercon"]=total_ACDC(n).sum(axis=1)-total_ACDC(n).T.sum(axis=1)
    energy_balance["lost-load"]=lost_load[countries].sum().div(1000).round(0)
    energy_balance["lost_load_check"]=energy_balance["intercon"]+energy_balance["int_gen"]+energy_balance["demand"]
    energy_balance= energy_balance.loc[countries,:].round().fillna(0).astype(int)
    #styled_energy_balance=energy_balance.style.apply(smaller_text, axis=1).apply(highlight_grey, axis=1)
    
    #return (styled_energy_balance, energy_balance)
    df = pd.DataFrame(energy_balance)
    #convert to json
    json_data = df.to_json(orient="columns")
    return(json_data)

def gen_DC(n):
    index_DC= n.links.query("carrier=='DC'").index
    countries_DC_bus1= n.links.query("carrier=='DC'").bus1.map(n.buses.country)
    countries_DC_bus0= n.links.query("carrier=='DC'").bus0.map(n.buses.country)

    gen_DC_10= n.links_t.p0.loc[:,index_DC].groupby([countries_DC_bus1, countries_DC_bus0], axis=1).sum().sort_index(axis=1).div(1000)
    gen_DC_10=curve_year(gen_DC_10,start, end)
    gen_DC=pd.DataFrame
    gen_DC=gen_DC_10.sum(axis=0).unstack()

    gen_DC=gen_DC.groupby(gen_DC.columns,axis=1).sum()
    gen_DC=gen_DC.groupby(gen_DC.index,axis=0).sum()

    gen_DC=gen_DC.reindex(countries)
    gen_DC=gen_DC.T.reindex(countries).T
    gen_DC=gen_DC.fillna(0).round(0)
    return gen_DC

def gen_AC(n):
    gen_AC_10=n.lines_t.p0.loc[:,:].groupby([n.lines.bus1.map(n.buses.country),n.lines.bus0.map(n.buses.country)],axis=1).sum().sort_index(axis=1).div(1000)
    gen_AC_10=curve_year(gen_AC_10,start, end)
    
    gen_AC=pd.DataFrame
    gen_AC=gen_AC_10.sum(axis=0).unstack()
    gen_AC=gen_AC.groupby(gen_AC.columns,axis=1).sum()
    gen_AC=gen_AC.groupby(gen_AC.index,axis=0).sum()
    gen_AC = gen_AC.reindex(countries, axis=0, fill_value=0).reindex(countries, axis=1, fill_value=0)
    gen_AC=gen_AC.loc[countries, countries].round()
    return gen_AC

def total_ACDC(n): 
    total_ACDC = gen_DC(n)+gen_AC(n)
    for i in countries:
        total_ACDC.loc[i,i]=0
    return total_ACDC

def highlight_grey(s):
    return ['background-color: lightyellow' if col in ['demand', 'int_gen', 'intercon'] else 'background-color: lightcoral' if col in ['lost-load'] else '' for col in remove_decimals(s.index)]

def smaller_text(s):
    return ['font-size: 8pt' if col in ['-->SE', '-->FI','-->EE', '-->LV','-->LT', '-->PL','-->NO', '-->DK','-->others' ] else 'font-size: 10pt' for col in remove_decimals(s.index)]

def remove_decimals(s):
    return [str(round(float(col), 0)) if isinstance(col, float) else col for col in s.values]

def curve_year(dist, start, end):
    dist=dist.set_index(pd.date_range(start='2016-01-01 00:00:00', end='2016-01-07 23:00:00', freq='1h'))
    dist=dist.loc[start:end]
    return (dist)

def replace_country_codes_columns(function):
    function.columns = [country_match.get(col, col) for col in function.columns]
    return function

def replace_country_codes_index(function):
    function.index = [country_match.get(col, col) for col in function.index]
    return function

def get_network_by_name(n):
    return globals()[n]

def unit_cost_month(start, end): 
    unit_cost_month=pd.DataFrame(columns=n_all.values, index=countries)
    for n in n_all.index:
        connexion=n_all[n]
        n= get_network_by_name(n)
        total_cost_gen, hourly_price_country, hourly_price_country_perhour, marginalprice_bus= cost_country(n, start, end)
        unit_cost_month.loc[countries, connexion]= total_cost_gen.loc[countries,'cost_unit(€/MWh)']
        unit_cost_month.loc['Baltics', connexion]=round(total_cost_gen.loc[['EE','LV','LT'],'cost(M€)'].sum()/(total_cost_gen.loc[['EE','LV','LT'],'load(GWh)'].sum())*1000,2)
    return unit_cost_month

def cost_country(n, start, end):
    styled_energy_balance, energy_balance=total_energy_balance(n)
    #load per country
    load_bus=n.loads_t.p_set.groupby(n.loads.bus,axis=1).sum()
    load_bus=curve_year(load_bus,start, end)
    load_bus=load_bus.loc[start:end,:] #'2016-01-14':'2016-01-27'
    load_country=load_bus.groupby(n.loads.bus.map(n.buses.country),axis=1).sum()

    #marginal price per bus
    marginalprice_bus= n.buses_t.marginal_price.reindex(n.loads.bus, axis=1)
    marginalprice_bus=curve_year(marginalprice_bus,start, end)
    marginalprice_bus=marginalprice_bus.loc[start:end,:] #'2016-01-14':'2016-01-27'
    price_bus=marginalprice_bus*load_bus

    #price_per_country()
    price_country=price_bus.groupby(n.buses.country,axis=1).sum()
    hourly_price_country_perhour=price_country/load_country
    hourly_price_country= price_country.sum()/load_country.sum()
    hourly_price_country.loc[countries]

    total_cost_gen=pd.DataFrame(index=countries)
    total_cost_gen.loc[countries,'cost(M€)']=price_country.sum().loc[countries].div(1000000).round()
    total_cost_gen.loc[countries, 'load(GWh)']=load_country.sum().loc[countries].div(1000).round()
    total_cost_gen.loc[countries,'gen_country(GWh)']=energy_balance.loc[countries, "int_gen"]
    #total_cost_gen.loc[countries,'lost_load(GWh)']=lost_load.sum().loc[countries].div(1000).round()
    total_cost_gen.loc[countries,'cost_unit(€/MWh)']=hourly_price_country.loc[countries].round(2)
    total_cost_gen.loc[countries,'max_cost(€/MWh)']=hourly_price_country_perhour.max().loc[countries].round(2)
    
    return total_cost_gen, hourly_price_country, hourly_price_country_perhour, marginalprice_bus

#energy_balance=total_energy_balance(n)
#print(energy_balance)

#h = hydro_fromlinks(n)
#print(h)
