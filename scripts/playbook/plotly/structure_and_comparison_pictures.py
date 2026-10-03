"""Pictures for section 6 of the catalogue: parts, relationships, comparison, 3D and single-number candidates.

A chord diagram, flowchart and sequence diagram have no picture: Plotly
cannot draw them, and faking one would misrepresent what the form looks like.
"""

from collections.abc import Callable

import numpy
import plotly.graph_objects as go

from picture_theme import CATEGORICAL, GRID_LINE, SEQUENTIAL_SCALE, TEXT_SECONDARY

RANDOM_SEED = 7
BUDGET = {"Housing": {"Rent": 24, "Utilities": 6, "Insurance": 5}, "Transport": {"Transit": 6, "Car": 10},
          "Food": {"Groceries": 11, "Restaurants": 4}, "Other": {"Savings": 20, "Fun": 14}}


def draw_treemap() -> go.Figure:
    """Draw a household budget as nested rectangles.

    Returns:
        The figure.
    """
    labels, parents, values = [], [], []
    for group, items in BUDGET.items():
        labels += [group, *items]
        parents += ["", *[group] * len(items)]
        values += [0, *items.values()]
    figure = go.Figure(go.Treemap(labels=labels, parents=parents, values=values, marker={"colors": [CATEGORICAL[list(BUDGET).index(parent or label)] for label, parent in zip(labels, parents)]}))
    figure.update_layout(margin={"l": 8, "r": 8, "b": 8})
    return figure


def draw_sunburst() -> go.Figure:
    """Draw the same budget as rings.

    Returns:
        The figure.
    """
    figure = draw_treemap()
    trace = figure.data[0]
    return go.Figure(go.Sunburst(labels=trace.labels, parents=trace.parents, values=trace.values, marker={"colors": trace.marker.colors}))


def draw_waterfall() -> go.Figure:
    """Draw a month's money from income to what is left.

    Returns:
        The figure.
    """
    figure = go.Figure(go.Waterfall(
        x=["Income", "Rent", "Food", "Transport", "Other", "Left"], y=[6200, -2400, -900, -500, -1300, 0],
        measure=["absolute", "relative", "relative", "relative", "relative", "total"],
        increasing={"marker": {"color": CATEGORICAL[2]}}, decreasing={"marker": {"color": CATEGORICAL[7]}}, totals={"marker": {"color": CATEGORICAL[0]}},
        connector={"line": {"color": GRID_LINE}},
    ))
    return figure


def draw_funnel() -> go.Figure:
    """Draw a sign-up funnel.

    Returns:
        The figure.
    """
    return go.Figure(go.Funnel(y=["Visited", "Signed up", "Connected an agent", "Showed a plot", "Came back"], x=[5000, 1400, 900, 620, 410],
                               marker={"color": CATEGORICAL[0]}))


def draw_full_stacked_bar() -> go.Figure:
    """Draw how people commute, each city to 100%.

    Returns:
        The figure.
    """
    modes = {"Car": [52, 45, 50], "Transit": [33, 38, 30], "Walk": [9, 10, 11], "Bike": [6, 7, 9]}
    figure = go.Figure([go.Bar(y=["Toronto", "Montréal", "Vancouver"], x=values, name=name, orientation="h") for name, values in modes.items()])
    figure.update_layout(barmode="stack", barnorm="percent")
    figure.update_xaxes(title="%")
    return figure


def draw_sankey() -> go.Figure:
    """Draw income flowing into spending.

    Returns:
        The figure.
    """
    labels = ["Salary", "Freelance", "Budget", "Housing", "Food", "Savings", "Other"]
    figure = go.Figure(go.Sankey(
        node={"label": labels, "color": [CATEGORICAL[0], CATEGORICAL[0], TEXT_SECONDARY, *CATEGORICAL[1:5]], "pad": 14},
        link={"source": [0, 1, 2, 2, 2, 2], "target": [2, 2, 3, 4, 5, 6], "value": [5000, 1200, 2400, 900, 1500, 1400], "color": "rgba(42,120,214,0.2)"},
    ))
    return figure


def draw_network() -> go.Figure:
    """Draw a small friendship network in a circle.

    Returns:
        The figure.
    """
    names = ["Ana", "Ben", "Chen", "Dev", "Eli", "Fay", "Gus", "Hana"]
    edges = [(0, 1), (0, 2), (1, 2), (2, 3), (3, 4), (4, 5), (5, 3), (6, 7), (6, 0), (7, 5)]
    angles = numpy.linspace(0, 2 * numpy.pi, len(names), endpoint=False)
    x, y = numpy.cos(angles), numpy.sin(angles)
    edge_x = [value for a, b in edges for value in (x[a], x[b], None)]
    edge_y = [value for a, b in edges for value in (y[a], y[b], None)]
    figure = go.Figure([go.Scatter(x=edge_x, y=edge_y, mode="lines", line={"color": TEXT_SECONDARY, "width": 1}),
                        go.Scatter(x=x, y=y, text=names, mode="markers+text", textposition="top center", marker={"size": 18, "color": CATEGORICAL[0]})])
    figure.update_layout(showlegend=False)
    figure.update_xaxes(visible=False)
    figure.update_yaxes(visible=False, scaleanchor="x")
    return figure


def make_measurements() -> dict[str, numpy.ndarray]:
    """Make correlated measurements for the relationship pictures.

    Returns:
        Measure name → values.
    """
    random = numpy.random.default_rng(RANDOM_SEED)
    size = random.normal(0, 1, 120)
    return {"Size": size, "Price": 0.8 * size + random.normal(0, 0.5, 120), "Age": random.normal(0, 1, 120), "Commute": -0.4 * size + random.normal(0, 0.9, 120)}


def draw_correlation_matrix() -> go.Figure:
    """Draw how strongly each pair of measures moves together.

    Returns:
        The figure.
    """
    measures = make_measurements()
    matrix = numpy.corrcoef(list(measures.values()))
    diverging = [[0, CATEGORICAL[1]], [0.5, "#fcfcfb"], [1, CATEGORICAL[0]]]
    figure = go.Figure(go.Heatmap(z=matrix, x=list(measures), y=list(measures), zmin=-1, zmax=1, colorscale=diverging, text=numpy.round(matrix, 2), texttemplate="%{text}"))
    figure.update_yaxes(autorange="reversed")
    return figure


def draw_scatter_matrix() -> go.Figure:
    """Draw every pair of measures as a small scatter.

    Returns:
        The figure.
    """
    measures = make_measurements()
    figure = go.Figure(go.Splom(dimensions=[{"label": name, "values": values} for name, values in measures.items()], diagonal_visible=False,
                                marker={"size": 4, "color": CATEGORICAL[0], "opacity": 0.6}))
    return figure


def draw_parallel_coordinates() -> go.Figure:
    """Draw each house as a line across its measures.

    Returns:
        The figure.
    """
    measures = make_measurements()
    figure = go.Figure(go.Parcoords(line={"color": measures["Price"], "colorscale": SEQUENTIAL_SCALE}, dimensions=[{"label": name, "values": values} for name, values in measures.items()]))
    figure.update_layout(margin={"t": 90})
    return figure


def draw_radar() -> go.Figure:
    """Draw two neighbourhoods scored on five things.

    Returns:
        The figure.
    """
    axes = ["Transit", "Parks", "Schools", "Shops", "Quiet"]
    figure = go.Figure([go.Scatterpolar(r=scores + scores[:1], theta=axes + axes[:1], name=name, fill="toself", opacity=0.6)
                        for name, scores in [("Annex", [9, 6, 8, 9, 4]), ("Junction", [6, 8, 7, 7, 7])]])
    figure.update_polars(bgcolor="#fcfcfb", radialaxis={"gridcolor": GRID_LINE, "range": [0, 10]}, angularaxis={"gridcolor": GRID_LINE})
    return figure


def draw_dumbbell() -> go.Figure:
    """Draw rent in 2015 against 2025 per city.

    Returns:
        The figure.
    """
    cities = ["Toronto", "Montréal", "Vancouver", "Calgary", "Halifax"]
    before, after = [1500, 1000, 1700, 1200, 1050], [2600, 1700, 2900, 1800, 1900]
    figure = go.Figure()
    for city, start, end in zip(cities, before, after):
        figure.add_scatter(x=[start, end], y=[city, city], mode="lines", line={"color": GRID_LINE, "width": 4}, showlegend=False)
    figure.add_scatter(x=before, y=cities, mode="markers", name="2015", marker={"size": 12, "color": CATEGORICAL[0]})
    figure.add_scatter(x=after, y=cities, mode="markers", name="2025", marker={"size": 12, "color": CATEGORICAL[1]})
    figure.update_xaxes(title="Rent ($)")
    return figure


def draw_lollipop() -> go.Figure:
    """Draw library visits per branch as stems with dots.

    Returns:
        The figure.
    """
    branches = ["Central", "North York", "Scarborough", "Parkdale", "Lillian H. Smith"]
    visits = [980, 720, 540, 410, 380]
    figure = go.Figure(go.Bar(x=visits, y=branches, orientation="h", width=0.06, marker={"color": CATEGORICAL[0]}, showlegend=False))
    figure.add_scatter(x=visits, y=branches, mode="markers", marker={"size": 14, "color": CATEGORICAL[0]}, showlegend=False)
    figure.update_yaxes(autorange="reversed")
    figure.update_xaxes(title="Visits (thousands)")
    return figure


def draw_bullet() -> go.Figure:
    """Draw progress to a savings goal against bands of poor, fair and good.

    Returns:
        The figure.
    """
    return go.Figure(go.Indicator(mode="number+gauge", value=13_400, number={"prefix": "$"}, domain={"x": [0.2, 1], "y": [0.3, 0.7]}, title={"text": "Savings"},
                                  gauge={"shape": "bullet", "axis": {"range": [0, 20_000]}, "threshold": {"line": {"color": TEXT_SECONDARY, "width": 3}, "value": 15_000},
                                         "bar": {"color": CATEGORICAL[0]}, "steps": [{"range": [0, 8000], "color": "#e4e3df"}, {"range": [8000, 14000], "color": "#eeedea"}]}))


def draw_three_dimensional_scatter() -> go.Figure:
    """Draw three measures as points in 3D.

    Returns:
        The figure.
    """
    measures = make_measurements()
    return go.Figure(go.Scatter3d(x=measures["Size"], y=measures["Price"], z=measures["Commute"], mode="markers",
                                  marker={"size": 4, "color": measures["Price"], "colorscale": SEQUENTIAL_SCALE}))


def draw_surface() -> go.Figure:
    """Draw a smooth hill as a surface.

    Returns:
        The figure.
    """
    grid = numpy.linspace(-3, 3, 50)
    x, y = numpy.meshgrid(grid, grid)
    return go.Figure(go.Surface(z=numpy.exp(-(x**2 + y**2) / 3) + 0.5 * numpy.exp(-((x - 1.5) ** 2 + (y + 1) ** 2)), colorscale=SEQUENTIAL_SCALE, showscale=False))


def draw_stat_tiles() -> go.Figure:
    """Draw three single numbers with their change.

    Returns:
        The figure.
    """
    figure = go.Figure()
    for index, (label, value, before) in enumerate([("Viewers", 1240, 1100), ("Plots shown", 8630, 9010), ("Channels", 312, 280)]):
        figure.add_indicator(mode="number+delta", value=value, title={"text": label}, delta={"reference": before, "relative": True, "valueformat": ".1%"},
                             domain={"x": [index / 3, (index + 1) / 3 - 0.02], "y": [0, 1]})
    return figure


def draw_gauge() -> go.Figure:
    """Draw how much of a monthly allowance is used.

    Returns:
        The figure.
    """
    return go.Figure(go.Indicator(mode="gauge+number", value=68, number={"suffix": "%"}, title={"text": "Allowance used"},
                                  gauge={"axis": {"range": [0, 100]}, "bar": {"color": CATEGORICAL[0]}, "bgcolor": "#eeedea", "borderwidth": 0}))


def draw_tree() -> go.Figure:
    """Draw a small folder hierarchy as a top-down tree.

    Returns:
        The figure.
    """
    nodes = {"yorkville": (0, 2), "src": (-1.5, 1), "tests": (0, 1), "playbook": (1.5, 1), "charts": (-2.2, 0), "maps": (-0.8, 0), "pictures": (1.5, 0)}
    links = [("yorkville", "src"), ("yorkville", "tests"), ("yorkville", "playbook"), ("src", "charts"), ("src", "maps"), ("playbook", "pictures")]
    edge_x = [value for a, b in links for value in (nodes[a][0], nodes[b][0], None)]
    edge_y = [value for a, b in links for value in (nodes[a][1], nodes[b][1], None)]
    x, y = zip(*nodes.values())
    figure = go.Figure([go.Scatter(x=edge_x, y=edge_y, mode="lines", line={"color": TEXT_SECONDARY, "width": 1}),
                        go.Scatter(x=x, y=y, text=list(nodes), mode="markers+text", textposition="bottom center", marker={"size": 16, "color": CATEGORICAL[0]})])
    figure.update_layout(showlegend=False)
    figure.update_xaxes(visible=False, range=[-3, 2.5])
    figure.update_yaxes(visible=False, range=[-0.5, 2.4])
    return figure


PICTURES: dict[str, tuple[str, Callable[[], go.Figure]]] = {
    "candidates/parts/treemap.png": ("Treemap", draw_treemap),
    "candidates/parts/sunburst.png": ("Sunburst", draw_sunburst),
    "candidates/parts/waterfall.png": ("Waterfall", draw_waterfall),
    "candidates/parts/funnel.png": ("Funnel", draw_funnel),
    "candidates/parts/full_stacked_bar.png": ("Stacked to 100%", draw_full_stacked_bar),
    "candidates/relationships/sankey.png": ("Sankey", draw_sankey),
    "candidates/relationships/network.png": ("Network", draw_network),
    "candidates/relationships/correlation_matrix.png": ("Correlation matrix", draw_correlation_matrix),
    "candidates/relationships/scatter_matrix.png": ("Scatter-plot matrix", draw_scatter_matrix),
    "candidates/relationships/parallel_coordinates.png": ("Parallel coordinates", draw_parallel_coordinates),
    "candidates/comparison/radar.png": ("Radar", draw_radar),
    "candidates/comparison/dumbbell.png": ("Dumbbell", draw_dumbbell),
    "candidates/comparison/lollipop.png": ("Lollipop", draw_lollipop),
    "candidates/comparison/bullet.png": ("Bullet", draw_bullet),
    "candidates/three_dimensions/scatter.png": ("3D scatter", draw_three_dimensional_scatter),
    "candidates/three_dimensions/surface.png": ("Surface", draw_surface),
    "candidates/glance/stat_tiles.png": ("Stat tiles", draw_stat_tiles),
    "candidates/glance/gauge.png": ("Gauge", draw_gauge),
    "candidates/relationships/tree.png": ("Tree", draw_tree),
}
