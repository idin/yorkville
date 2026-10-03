"""Pictures for section 6 of the catalogue: distribution and change-over-time candidates."""

from collections.abc import Callable

import numpy
import plotly.graph_objects as go

from picture_theme import CATEGORICAL, SEQUENTIAL_SCALE

RANDOM_SEED = 7
CITIES = ["Toronto", "Montréal", "Vancouver"]


def make_commutes() -> dict[str, numpy.ndarray]:
    """Make commute times per city, shared by the distribution pictures.

    Returns:
        City name → minutes.
    """
    random = numpy.random.default_rng(RANDOM_SEED)
    return {city: random.gamma(6, mean / 6, 150) for city, mean in zip(CITIES, [34, 29, 31])}


def draw_violin() -> go.Figure:
    """Draw commute times as violins.

    Returns:
        The figure.
    """
    figure = go.Figure([go.Violin(y=values, name=city, box_visible=True, meanline_visible=True) for city, values in make_commutes().items()])
    figure.update_layout(showlegend=False)
    figure.update_yaxes(title="Minutes")
    return figure


def draw_ridgeline() -> go.Figure:
    """Draw commute times as stacked half-violins.

    Returns:
        The figure.
    """
    figure = go.Figure([go.Violin(x=values, name=city, side="positive", orientation="h", width=2.5, points=False) for city, values in make_commutes().items()])
    figure.update_layout(showlegend=False)
    figure.update_xaxes(title="Minutes")
    return figure


def draw_strip() -> go.Figure:
    """Draw every commute as a jittered point.

    Returns:
        The figure.
    """
    figure = go.Figure([go.Box(y=values, name=city, boxpoints="all", jitter=0.8, pointpos=0, fillcolor="rgba(0,0,0,0)", line={"width": 0}, marker={"size": 4})
                        for city, values in make_commutes().items()])
    figure.update_layout(showlegend=False)
    figure.update_yaxes(title="Minutes")
    return figure


def draw_cumulative_distribution() -> go.Figure:
    """Draw the cumulative share of commutes under each time.

    Returns:
        The figure.
    """
    figure = go.Figure()
    for city, values in make_commutes().items():
        ordered = numpy.sort(values)
        figure.add_scatter(x=ordered, y=numpy.arange(1, len(ordered) + 1) / len(ordered), name=city, mode="lines", line={"shape": "hv", "width": 2})
    figure.update_xaxes(title="Minutes")
    figure.update_yaxes(title="Share at or under", tickformat=".0%")
    return figure


def draw_two_dimensional_histogram() -> go.Figure:
    """Draw a 2D histogram of house size against price.

    Returns:
        The figure.
    """
    random = numpy.random.default_rng(RANDOM_SEED)
    size = random.uniform(900, 3200, 2000)
    figure = go.Figure(go.Histogram2d(x=size, y=420 * size + random.normal(0, 180_000, 2000), colorscale=SEQUENTIAL_SCALE, nbinsx=25, nbinsy=25))
    figure.update_xaxes(title="Size (sq ft)")
    figure.update_yaxes(title="Price ($)")
    return figure


def draw_contour() -> go.Figure:
    """Draw a contour of the same 2D density.

    Returns:
        The figure.
    """
    random = numpy.random.default_rng(RANDOM_SEED)
    size = random.uniform(900, 3200, 2000)
    figure = go.Figure(go.Histogram2dContour(x=size, y=420 * size + random.normal(0, 180_000, 2000), colorscale=SEQUENTIAL_SCALE, ncontours=10))
    figure.update_xaxes(title="Size (sq ft)")
    figure.update_yaxes(title="Price ($)")
    return figure


def make_months() -> numpy.ndarray:
    """Make the month axis shared by the change-over-time pictures.

    Returns:
        Two years of month starts.
    """
    return numpy.arange("2024-01", "2026-01", dtype="datetime64[M]")


def draw_stacked_area() -> go.Figure:
    """Draw energy use by source as stacked areas.

    Returns:
        The figure.
    """
    months = make_months()
    season = numpy.cos(numpy.arange(len(months)) / 12 * 2 * numpy.pi)
    figure = go.Figure()
    for name, base, swing in [("Gas", 60, 35), ("Electric", 40, 8), ("Solar", 12, -8)]:
        figure.add_scatter(x=months, y=base + swing * season, name=name, stackgroup="energy", mode="lines", line={"width": 1})
    figure.update_yaxes(title="kWh / day")
    return figure


def draw_step() -> go.Figure:
    """Draw the Bank of Canada policy rate as a step line.

    Returns:
        The figure.
    """
    dates = ["2024-01-01", "2024-06-05", "2024-07-24", "2024-09-04", "2024-10-23", "2024-12-11", "2025-01-29", "2025-03-12", "2025-12-31"]
    rates = [5.0, 4.75, 4.5, 4.25, 3.75, 3.25, 3.0, 2.75, 2.75]
    figure = go.Figure(go.Scatter(x=dates, y=rates, mode="lines", line={"shape": "hv", "width": 2}))
    figure.update_yaxes(title="Rate (%)")
    return figure


def draw_candlestick() -> go.Figure:
    """Draw a made-up daily share price as candles.

    Returns:
        The figure.
    """
    random = numpy.random.default_rng(RANDOM_SEED)
    days = numpy.arange("2025-03-01", "2025-04-15", dtype="datetime64[D]")
    close = 100 * numpy.cumprod(1 + random.normal(0.002, 0.015, len(days)))
    opening = numpy.concatenate([[100], close[:-1]])
    figure = go.Figure(go.Candlestick(
        x=days, open=opening, close=close,
        high=numpy.maximum(opening, close) * (1 + random.uniform(0, 0.01, len(days))),
        low=numpy.minimum(opening, close) * (1 - random.uniform(0, 0.01, len(days))),
        increasing={"line": {"color": CATEGORICAL[2]}}, decreasing={"line": {"color": CATEGORICAL[7]}},
    ))
    figure.update_layout(xaxis_rangeslider_visible=False)
    return figure


def draw_error_bands() -> go.Figure:
    """Draw a forecast with a confidence band and measured points with error bars.

    Returns:
        The figure.
    """
    random = numpy.random.default_rng(RANDOM_SEED)
    months = make_months()
    trend = 20 + 0.6 * numpy.arange(len(months))
    spread = 1 + 0.2 * numpy.arange(len(months))
    figure = go.Figure([
        go.Scatter(x=numpy.concatenate([months, months[::-1]]), y=numpy.concatenate([trend + spread, (trend - spread)[::-1]]),
                   fill="toself", fillcolor="rgba(42,120,214,0.18)", line={"width": 0}, name="95% band"),
        go.Scatter(x=months, y=trend, mode="lines", name="Forecast", line={"color": CATEGORICAL[0], "width": 2}),
        go.Scatter(x=months[::3], y=trend[::3] + random.normal(0, 1.5, len(months[::3])), mode="markers", name="Measured",
                   error_y={"array": [2] * len(months[::3])}, marker={"color": CATEGORICAL[1], "size": 8}),
    ])
    return figure


def draw_timeline() -> go.Figure:
    """Draw a renovation plan as a Gantt chart.

    Returns:
        The figure.
    """
    tasks = [("Permits", "2026-01-05", "2026-02-15"), ("Demolition", "2026-02-16", "2026-03-01"), ("Framing", "2026-03-02", "2026-04-10"),
             ("Electrical", "2026-03-20", "2026-04-30"), ("Drywall", "2026-05-01", "2026-05-25"), ("Painting", "2026-05-26", "2026-06-10")]
    figure = go.Figure()
    for index, (task, start, end) in enumerate(tasks):
        duration = (numpy.datetime64(end) - numpy.datetime64(start)).astype("timedelta64[ms]").astype(int)
        figure.add_bar(y=[task], x=[duration], base=[start], orientation="h", marker={"color": CATEGORICAL[index % 3]}, showlegend=False)
    figure.update_xaxes(type="date")
    figure.update_yaxes(autorange="reversed")
    return figure


def draw_calendar_heatmap() -> go.Figure:
    """Draw a year of daily runs, one cell per day, weeks across.

    Returns:
        The figure.
    """
    random = numpy.random.default_rng(RANDOM_SEED)
    kilometres = numpy.where(random.random(364) < 0.45, random.uniform(3, 15, 364), 0).reshape(52, 7).T
    figure = go.Figure(go.Heatmap(z=kilometres, y=["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], colorscale=[[0, "#f1f0ec"]] + SEQUENTIAL_SCALE[1:],
                                  xgap=2, ygap=2, showscale=False))
    figure.update_xaxes(title="Week", showgrid=False)
    figure.update_yaxes(autorange="reversed", showgrid=False, scaleanchor="x")
    return figure


def draw_sparklines() -> go.Figure:
    """Draw three small axis-free trend lines, one per city.

    Returns:
        The figure.
    """
    random = numpy.random.default_rng(RANDOM_SEED)
    figure = go.Figure()
    for index, city in enumerate(CITIES):
        series = numpy.cumsum(random.normal(0, 1, 40))
        offset = index * 12
        figure.add_scatter(y=8 * (series - series.min()) / (series.max() - series.min()) + offset, mode="lines", line={"width": 2, "color": CATEGORICAL[0]}, showlegend=False)
        figure.add_annotation(x=-1, y=offset + 4, text=city, showarrow=False, xanchor="right")
    figure.update_xaxes(visible=False)
    figure.update_yaxes(visible=False)
    figure.update_layout(margin={"l": 100})
    return figure


PICTURES: dict[str, tuple[str, Callable[[], go.Figure]]] = {
    "candidates/distribution/violin.png": ("Violin", draw_violin),
    "candidates/distribution/ridgeline.png": ("Ridgeline", draw_ridgeline),
    "candidates/distribution/strip.png": ("Strip", draw_strip),
    "candidates/distribution/cumulative_distribution.png": ("Cumulative distribution", draw_cumulative_distribution),
    "candidates/distribution/two_dimensional_histogram.png": ("2D histogram", draw_two_dimensional_histogram),
    "candidates/distribution/contour.png": ("Density contour", draw_contour),
    "candidates/time/stacked_area.png": ("Stacked area", draw_stacked_area),
    "candidates/time/step.png": ("Step line", draw_step),
    "candidates/time/candlestick.png": ("Candlestick", draw_candlestick),
    "candidates/time/error_bands.png": ("Error bars and band", draw_error_bands),
    "candidates/time/timeline.png": ("Timeline", draw_timeline),
    "candidates/time/calendar_heatmap.png": ("Calendar heatmap", draw_calendar_heatmap),
    "candidates/time/sparklines.png": ("Sparklines", draw_sparklines),
}
