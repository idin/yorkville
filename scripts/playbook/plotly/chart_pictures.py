"""Pictures for section 1 of the catalogue: the chart types scribble.tube draws today.

The data is made up but shaped like the catalogue's examples, from a fixed
seed so every redraw gives the same picture.
"""

from collections.abc import Callable

import numpy
import plotly.graph_objects as go
from plotly.subplots import make_subplots

from picture_theme import CATEGORICAL, SEQUENTIAL_SCALE

RANDOM_SEED = 7
CITIES = ["Toronto", "Montréal", "Vancouver"]


def draw_line() -> go.Figure:
    """Draw monthly rent in three cities, one line and one dash each.

    Returns:
        The figure.
    """
    random = numpy.random.default_rng(RANDOM_SEED)
    years = numpy.arange(2015, 2026)
    figure = go.Figure()
    for index, (city, start) in enumerate(zip(CITIES, [1500, 1000, 1700])):
        rent = start * numpy.cumprod(1 + random.normal(0.05, 0.02, len(years)))
        figure.add_scatter(x=years, y=rent, name=city, mode="lines+markers", line={"width": 2, "dash": ["solid", "dash", "dot"][index]})
    figure.update_yaxes(title="Rent ($)")
    return figure


def draw_scatter() -> go.Figure:
    """Draw house size against price, coloured by area, sized by lot, with a trend line.

    Returns:
        The figure.
    """
    random = numpy.random.default_rng(RANDOM_SEED)
    figure = go.Figure()
    all_size, all_price = [], []
    for index, area in enumerate(["Annex", "Leslieville", "Junction"]):
        size = random.uniform(900, 3200, 25)
        price = 400 * size * (1 + 0.15 * index) + random.normal(0, 150_000, 25)
        all_size.extend(size)
        all_price.extend(price)
        figure.add_scatter(
            x=size, y=price, name=area, mode="markers",
            marker={"size": random.uniform(8, 22, 25), "symbol": ["circle", "square", "triangle-up"][index], "opacity": 0.8},
        )
    slope, intercept = numpy.polyfit(all_size, all_price, 1)
    figure.add_scatter(x=[900, 3200], y=[slope * 900 + intercept, slope * 3200 + intercept], name="Trend", mode="lines", line={"color": "#52514e", "width": 2})
    figure.update_xaxes(title="Size (sq ft)")
    figure.update_yaxes(title="Price ($)")
    return figure


def draw_bar() -> go.Figure:
    """Draw population by province, stacked by age group.

    Returns:
        The figure.
    """
    provinces = ["ON", "QC", "BC", "AB", "MB"]
    groups = {"0–19": [3.2, 1.8, 1.1, 1.0, 0.3], "20–64": [9.4, 5.1, 3.2, 2.8, 0.8], "65+": [2.9, 1.9, 1.1, 0.7, 0.2]}
    figure = go.Figure([go.Bar(x=provinces, y=values, name=name) for name, values in groups.items()])
    figure.update_layout(barmode="stack")
    figure.update_yaxes(title="People (millions)")
    return figure


def draw_box() -> go.Figure:
    """Draw commute times by city, with every point beside its box.

    Returns:
        The figure.
    """
    random = numpy.random.default_rng(RANDOM_SEED)
    figure = go.Figure()
    for city, mean in zip(CITIES, [34, 29, 31]):
        figure.add_box(y=random.gamma(6, mean / 6, 80), name=city, boxpoints="all", jitter=0.4, pointpos=-1.6, marker={"size": 4})
    figure.update_layout(showlegend=False)
    figure.update_yaxes(title="Minutes")
    return figure


def draw_histogram() -> go.Figure:
    """Draw daily step counts, weekday against weekend, on one bin range.

    Returns:
        The figure.
    """
    random = numpy.random.default_rng(RANDOM_SEED)
    figure = go.Figure()
    for name, mean in [("Weekday", 7500), ("Weekend", 10500)]:
        figure.add_histogram(x=random.normal(mean, 2200, 400), name=name, opacity=0.7, xbins={"start": 0, "end": 18000, "size": 1000})
    figure.update_layout(barmode="overlay")
    figure.update_xaxes(title="Steps")
    figure.update_yaxes(title="Days")
    return figure


def draw_density() -> go.Figure:
    """Draw kernel density curves of age at first home purchase, by decade.

    Returns:
        The figure.
    """
    random = numpy.random.default_rng(RANDOM_SEED)
    grid = numpy.linspace(18, 60, 200)
    figure = go.Figure()
    for decade, mean in [("1990s", 28), ("2000s", 31), ("2010s", 34)]:
        values = random.normal(mean, 5, 300)
        bandwidth = 1.06 * values.std() * len(values) ** -0.2
        curve = numpy.exp(-0.5 * ((grid[:, None] - values) / bandwidth) ** 2).sum(axis=1) / (len(values) * bandwidth * numpy.sqrt(2 * numpy.pi))
        figure.add_scatter(x=grid, y=curve, name=decade, mode="lines", fill="tozeroy", line={"width": 2})
    figure.update_xaxes(title="Age")
    figure.update_yaxes(title="Density")
    return figure


def draw_heatmap() -> go.Figure:
    """Draw café visits by hour and weekday.

    Returns:
        The figure.
    """
    hours = numpy.arange(7, 22)
    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    morning = numpy.exp(-0.5 * ((hours - 9) / 1.5) ** 2)
    afternoon = numpy.exp(-0.5 * ((hours - 15) / 2.5) ** 2)
    visits = [80 * morning * (0.6 if day in ("Sat", "Sun") else 1) + 50 * afternoon * (1.5 if day in ("Sat", "Sun") else 1) for day in days]
    figure = go.Figure(go.Heatmap(x=hours, y=days, z=visits, colorscale=SEQUENTIAL_SCALE))
    figure.update_xaxes(title="Hour")
    return figure


def draw_pie_and_donut() -> go.Figure:
    """Draw household spending as a pie and as a donut, side by side.

    Returns:
        The figure.
    """
    labels = ["Housing", "Transport", "Food", "Health", "Other"]
    values = [35, 16, 15, 7, 27]
    figure = make_subplots(rows=1, cols=2, specs=[[{"type": "domain"}, {"type": "domain"}]])
    figure.add_pie(labels=labels, values=values, marker={"colors": CATEGORICAL}, sort=False, row=1, col=1)
    figure.add_pie(labels=labels, values=values, marker={"colors": CATEGORICAL}, sort=False, hole=0.5, row=1, col=2)
    return figure


PICTURES: dict[str, tuple[str, Callable[[], go.Figure]]] = {
    "charts/line.png": ("Monthly rent", draw_line),
    "charts/scatter.png": ("Size against price", draw_scatter),
    "charts/bar.png": ("Population by province", draw_bar),
    "charts/box.png": ("Commute times", draw_box),
    "charts/histogram.png": ("Daily steps", draw_histogram),
    "charts/density.png": ("Age at first home purchase", draw_density),
    "charts/heatmap.png": ("Café visits", draw_heatmap),
    "charts/pie_and_donut.png": ("Household spending", draw_pie_and_donut),
}
