"""Pictures for section 2 of the catalogue: map layers and views.

Drawn on Plotly's built-in geo outlines rather than street tiles, so the
pictures need no network and stay in the shared light theme.
"""

from collections.abc import Callable

import numpy
import plotly.graph_objects as go

from picture_theme import CATEGORICAL, SEQUENTIAL_SCALE

RANDOM_SEED = 7
CANADA_VIEW = {"scope": "north america", "center": {"lon": -96, "lat": 55}, "projection_scale": 2.2}


def draw_points() -> go.Figure:
    """Draw city bubbles across Canada, sized and coloured by population.

    Returns:
        The figure.
    """
    cities = {"Toronto": (-79.4, 43.7, 6.2), "Montréal": (-73.6, 45.5, 4.3), "Vancouver": (-123.1, 49.3, 2.6), "Calgary": (-114.1, 51.0, 1.5),
              "Edmonton": (-113.5, 53.5, 1.4), "Ottawa": (-75.7, 45.4, 1.5), "Winnipeg": (-97.1, 49.9, 0.8), "Halifax": (-63.6, 44.6, 0.5)}
    longitudes, latitudes, people = zip(*cities.values())
    figure = go.Figure(go.Scattergeo(
        lon=longitudes, lat=latitudes, text=list(cities), mode="markers",
        marker={"size": [8 + 4 * value for value in people], "color": people, "colorscale": SEQUENTIAL_SCALE, "line": {"width": 0}},
    ))
    figure.update_geos(**CANADA_VIEW)
    return figure


def draw_density() -> go.Figure:
    """Draw where made-up collisions cluster in Toronto, as a heat of many faint points.

    Returns:
        The figure.
    """
    random = numpy.random.default_rng(RANDOM_SEED)
    longitudes = numpy.concatenate([random.normal(-79.39, 0.03, 600), random.normal(-79.30, 0.05, 300)])
    latitudes = numpy.concatenate([random.normal(43.66, 0.02, 600), random.normal(43.72, 0.04, 300)])
    figure = go.Figure(go.Histogram2dContour(x=longitudes, y=latitudes, colorscale=SEQUENTIAL_SCALE, ncontours=12, showscale=False, contours={"coloring": "heatmap"}))
    figure.update_xaxes(title="Longitude")
    figure.update_yaxes(title="Latitude", scaleanchor="x")
    return figure


def draw_regions() -> go.Figure:
    """Draw a made-up value per country across the Americas as a choropleth.

    Returns:
        The figure.
    """
    countries = ["CAN", "USA", "MEX", "BRA", "ARG", "COL", "PER", "CHL", "VEN", "BOL", "ECU", "PRY", "URY", "GTM", "CUB"]
    values = numpy.random.default_rng(RANDOM_SEED).uniform(20, 90, len(countries))
    figure = go.Figure(go.Choropleth(locations=countries, z=values, colorscale=SEQUENTIAL_SCALE, marker={"line": {"color": "#c9c8c2", "width": 0.5}}))
    figure.update_geos(scope="world", lonaxis={"range": [-170, -30]}, lataxis={"range": [-58, 75]})
    return figure


def draw_lines() -> go.Figure:
    """Draw flights out of Toronto as great-circle arcs, width by passengers.

    Returns:
        The figure.
    """
    toronto = (-79.6, 43.7)
    places = {"Vancouver": (-123.2, 49.2, 3), "London": (-0.5, 51.5, 4), "Paris": (2.5, 49.0, 3), "Mexico City": (-99.1, 19.4, 2),
              "São Paulo": (-46.5, -23.4, 1.5), "Reykjavík": (-22.6, 64.0, 1)}
    figure = go.Figure()
    for index, (name, (longitude, latitude, passengers)) in enumerate(places.items()):
        figure.add_scattergeo(lon=[toronto[0], longitude], lat=[toronto[1], latitude], mode="lines", name=name,
                              line={"width": 1.5 * passengers, "color": CATEGORICAL[index]})
    figure.update_geos(projection_type="natural earth", lonaxis={"range": [-135, 20]}, lataxis={"range": [-35, 70]})
    figure.update_layout(showlegend=False)
    return figure


def draw_globe() -> go.Figure:
    """Draw the globe view with a few points on it.

    Returns:
        The figure.
    """
    figure = go.Figure(go.Scattergeo(lon=[-79.4, -0.1, 139.7, 151.2, -46.6], lat=[43.7, 51.5, 35.7, -33.9, -23.5], mode="markers",
                                     marker={"size": 10, "color": CATEGORICAL[0]}))
    figure.update_geos(projection_type="orthographic", projection_rotation={"lon": -40, "lat": 25}, showlakes=False)
    return figure


PICTURES: dict[str, tuple[str, Callable[[], go.Figure]]] = {
    "maps/points.png": ("City populations", draw_points),
    "maps/density.png": ("Collision density", draw_density),
    "maps/regions.png": ("Value by country", draw_regions),
    "maps/lines.png": ("Flights from Toronto", draw_lines),
    "maps/globe.png": ("Globe view", draw_globe),
}
