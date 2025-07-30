import json
import geopandas as gpd
import shapely.geometry as sg
from scipy.spatial import Voronoi
from shapely.geometry import mapping

def get_voronoi_polygons(network):
    world = gpd.read_file("import/ne_10m_admin_0_countries.shp")
    selected_countries = world[world["SOV_A3"].isin(["EST", "LVA", "LTU"])]
    #combined_countries = selected_countries.geometry.union_all()
    combined_countries = selected_countries.geometry.unary_union
    bus_gdf = gpd.GeoDataFrame(
        network.buses, geometry=gpd.points_from_xy(network.buses['x'], network.buses['y']),
        crs="EPSG:4326"
    )
    bus_gdf = bus_gdf[bus_gdf.geometry.within(combined_countries)]
    valid_bus_locs = bus_gdf[['x', 'y']].to_numpy()
    valid_bus_names = bus_gdf.index.tolist()

    vor = Voronoi(valid_bus_locs)
    voronoi_cells = voronoi_polygons(vor, combined_countries)
    json_data = json.dumps([
        {"bus": valid_bus_names[i], "geometry": mapping(voronoi_cells[i])}
        for i in range(len(voronoi_cells))
    ])

    return json_data


def voronoi_polygons(vor, boundary):
    """Convert Voronoi regions to Shapely polygons and clip to boundary."""
    polygons = []
    for region in vor.point_region:
        if not -1 in vor.regions[region] and len(vor.regions[region]) > 0:
            poly = sg.Polygon([vor.vertices[i] for i in vor.regions[region]])
            if poly.is_valid:
                poly = poly.intersection(boundary)  # Clip to country boundary
                polygons.append(poly)
    return polygons
