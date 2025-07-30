import json
import geopandas as gpd
import shapely.geometry as sg
from shapely.geometry import mapping
from scipy.spatial import Voronoi

def get_voronoi_polygons(network):
    world = gpd.read_file("import/ne_10m_admin_0_countries.shp")
    selected_countries = world[world["SOV_A3"].isin(["EST", "LVA", "LTU"])]
    combined_countries = selected_countries.geometry.union_all()
    bus_locs = network.buses[['x', 'y']].to_numpy()
    bus_names = network.buses.index.tolist()  # Extract bus names
    vor = Voronoi(bus_locs)

    voronoi_cells = voronoi_polygons(vor, combined_countries)

    json_data = json.dumps([mapping(p) for p in voronoi_cells])

    json_data = json.dumps([
        {"x": bus_names[i], "geometry": mapping(voronoi_cells[i])}
        for i in range(len(voronoi_cells))
    ])

    return json_data

def voronoi_polygons(vor, boundary):
    """Convert Voronoi regions to Shapely polygons and clip to boundary."""
    polygons = []
    for region in vor.regions:
        if not -1 in region and len(region) > 0:  # Valid region check
            poly = sg.Polygon([vor.vertices[i] for i in region])
            if poly.is_valid:
                poly = poly.intersection(boundary)  # Clip to country boundary
                #polygons.append(poly)
                if not poly.is_empty:
                    polygons.append(poly)
    return polygons


