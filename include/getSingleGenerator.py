import pandas as pd

def single_generator(generator_name,network):
    #prendo il generator che mi serve usando come filtro il nome passato come argomento alla funzione
    single_generator_p = network.generators_t.p.loc[:,generator_name]
    #converto in pandas dataframe
    df = pd.DataFrame(single_generator_p)
    #converto in json
    json_data = df.to_json()
    return json_data
