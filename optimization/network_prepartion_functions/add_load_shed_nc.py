def run(o): #generator at very high costs
    #se ha creado una nueva matriz de buses, solo nombrando nc_buses (q esta vacio), y adjudicandoles los indices de HP y EV (index.to_list())
    nc_buses = o.buses.filter(like="HP",axis=0).index.to_list() + o.buses.filter(like="EV",axis=0).index.to_list()
    #luego les anhade otros parametros en Generator, de manera que"o" tiene ya buses+lost-load, con una potencia, un bus asociado, y un coste marginal
    o.madd("Generator", [i + " lost-load" for i in nc_buses], bus = nc_buses, p_nom = 1e5, marginal_cost= 10e3)
    o.madd("Generator", [i + " lost-gen" for i in nc_buses], bus = nc_buses, p_nom = 1e5, marginal_cost= -10e3, 
        p_min_pu = -1, p_max_pu = 0)
    
    return o

