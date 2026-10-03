"""Pictures for the catalogue's transit maps: geographic and schematic.

Both draw the same simplified Toronto subway from ../toronto_subway.json,
which the ECharts script reads too, so the two renderers show the same network.
"""

import json
from collections.abc import Callable
from pathlib import Path

import plotly.graph_objects as go

from picture_theme import CATEGORICAL, SURFACE, TEXT_PRIMARY, WATER

SUBWAY = json.loads((Path(__file__).resolve().parent.parent / "toronto_subway.json").read_text())
LINE_WIDTH = 5
STATION_SIZE = 7
INTERCHANGE_SIZE = 12


def find_labelled_stations() -> set[str]:
    """Find the stations worth a label: interchanges and the ends of each line.

    Returns:
        Their names.
    """
    counts: dict[str, int] = {}
    for line in SUBWAY["lines"]:
        for station in line["stations"]:
            counts[station] = counts.get(station, 0) + 1
    ends = {name for line in SUBWAY["lines"] for name in (line["stations"][0], line["stations"][-1])}
    return {name for name, count in counts.items() if count > 1} | ends


def draw_network(*, position: str) -> go.Figure:
    """Draw every line, its stations, and labels for interchanges and termini.

    Args:
        position: Which position to draw stations at: "geographic" or "schematic".

    Returns:
        The figure.
    """
    stations = SUBWAY["stations"]
    labelled = find_labelled_stations()
    figure = go.Figure()
    for line in SUBWAY["lines"]:
        x, y = zip(*(stations[name][position] for name in line["stations"]))
        colour = CATEGORICAL[line["colour_slot"]]
        figure.add_scatter(x=x, y=y, mode="lines+markers", name=line["name"], line={"color": colour, "width": LINE_WIDTH},
                           marker={"size": STATION_SIZE, "color": SURFACE, "line": {"color": colour, "width": 2}})
    interchanges = [name for name in labelled if sum(name in line["stations"] for line in SUBWAY["lines"]) > 1]
    x, y = zip(*(stations[name][position] for name in interchanges))
    figure.add_scatter(x=x, y=y, mode="markers", showlegend=False, marker={"size": INTERCHANGE_SIZE, "color": SURFACE, "line": {"color": TEXT_PRIMARY, "width": 2}})
    for name in sorted(labelled):
        x_value, y_value = stations[name][position]
        # "label_side" is optional in the data: only stations whose default label would collide have one.
        is_left = stations[name].get("label_side") == "left"
        figure.add_annotation(x=x_value, y=y_value, text=name, showarrow=False, xshift=-8 if is_left else 8, yshift=8,
                              xanchor="right" if is_left else "left", font={"size": 10, "color": TEXT_PRIMARY})
    figure.update_xaxes(visible=False)
    figure.update_yaxes(visible=False)
    figure.update_layout(legend={"x": 0.01, "y": 0.98, "xanchor": "left", "yanchor": "top"})
    return figure


def draw_geographic() -> go.Figure:
    """Draw the subway at true positions, with the lake for reference.

    Returns:
        The figure.
    """
    figure = draw_network(position="geographic")
    view = SUBWAY["geographic_view"]
    shore_x, shore_y = zip(*SUBWAY["shoreline"])
    # The lake: the shoreline closed along the bottom of the view.
    figure.add_scatter(x=[*shore_x, shore_x[-1], shore_x[0]], y=[*shore_y, view["latitude"][0], view["latitude"][0]], fill="toself",
                       fillcolor=WATER, mode="lines", line={"width": 0}, showlegend=False, hoverinfo="skip")
    # The lake goes underneath the lines.
    figure.data = (figure.data[-1], *figure.data[:-1])
    figure.update_xaxes(range=view["longitude"])
    figure.update_yaxes(range=view["latitude"], scaleanchor="x", scaleratio=1 / 0.723)
    return figure


def draw_schematic() -> go.Figure:
    """Draw the subway at schematic positions: straight runs, 45-degree turns, even spacing.

    Returns:
        The figure.
    """
    figure = draw_network(position="schematic")
    figure.update_xaxes(range=[-4, 13.5])
    figure.update_yaxes(range=[0, 11], scaleanchor="x")
    return figure


PICTURES: dict[str, tuple[str, Callable[[], go.Figure]]] = {
    "transit/geographic.png": ("Transit map, true to geography", draw_geographic),
    "transit/schematic.png": ("Transit map, schematic", draw_schematic),
}
