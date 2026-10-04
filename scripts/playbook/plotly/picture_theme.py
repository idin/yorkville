"""The one look every catalogue picture shares, so they read as one set.

Colours are scribble.tube's light theme (its `src/items/plot/palette.ts`),
which comes from the dataviz skill's validated palette: plot-twist's pictures
should look like what plot-twist will draw for scribble.tube.
"""

from pathlib import Path

import plotly.graph_objects as go

SURFACE = "#fcfcfb"
TEXT_PRIMARY = "#0b0b0b"
TEXT_SECONDARY = "#52514e"
GRID_LINE = "#e4e3df"
LAND = "#f1f0ec"
WATER = "#e9edf1"
BORDER = "#c9c8c2"

# Categorical slots in their validated order: never cycled, never reordered.
CATEGORICAL = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#4a3aa7", "#e34948"]

# One hue, light to dark, for continuous colour.
SEQUENTIAL = ["#cde2fb", "#9ec5f4", "#6da7ec", "#3987e5", "#256abf", "#184f95", "#0d366b"]
SEQUENTIAL_SCALE = [[index / (len(SEQUENTIAL) - 1), colour] for index, colour in enumerate(SEQUENTIAL)]

FONT_FAMILY = "Helvetica, Arial, sans-serif"
FONT_SIZE = 13
TITLE_SIZE = 15

# Pictures are thumbnails in a Markdown table, drawn at twice the size for sharp screens.
PICTURE_WIDTH = 560
PICTURE_HEIGHT = 340
PICTURE_SCALE = 2
MARGIN = {"l": 56, "r": 24, "t": 48, "b": 48}


def style_figure(*, figure: go.Figure, title: str) -> go.Figure:
    """Apply the shared surface, fonts, grid and colours to a figure.

    Args:
        figure: The figure to style; changed in place.
        title: The title shown above the chart.

    Returns:
        The same figure.
    """
    figure.update_layout(
        title={"text": title, "x": 0.02, "font": {"size": TITLE_SIZE, "color": TEXT_PRIMARY}},
        font={"family": FONT_FAMILY, "size": FONT_SIZE, "color": TEXT_SECONDARY},
        paper_bgcolor=SURFACE,
        plot_bgcolor=SURFACE,
        colorway=CATEGORICAL,
        margin=MARGIN,
        width=PICTURE_WIDTH,
        height=PICTURE_HEIGHT,
        legend={"bgcolor": "rgba(0,0,0,0)", "font": {"color": TEXT_SECONDARY}},
        coloraxis={"colorscale": SEQUENTIAL_SCALE},
    )
    figure.update_xaxes(gridcolor=GRID_LINE, zerolinecolor=GRID_LINE, linecolor=GRID_LINE)
    figure.update_yaxes(gridcolor=GRID_LINE, zerolinecolor=GRID_LINE, linecolor=GRID_LINE)
    figure.update_geos(
        bgcolor=SURFACE, landcolor=LAND, oceancolor=WATER, showocean=True,
        countrycolor=BORDER, coastlinecolor=BORDER, showcountries=True, showframe=False,
    )
    return figure


def save_picture(*, figure: go.Figure, title: str, path: Path) -> None:
    """Style a figure and write it as a PNG, refusing to overwrite.

    Args:
        figure: The figure to save.
        title: The title shown above the chart.
        path: Where the PNG goes.

    Returns:
        None.
    """
    if path.exists():
        raise FileExistsError(f"{path} exists; move it to the trash first to redraw it.")
    path.parent.mkdir(parents=True, exist_ok=True)
    style_figure(figure=figure, title=title).write_image(path, scale=PICTURE_SCALE)
