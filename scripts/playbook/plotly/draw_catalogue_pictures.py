# /// script
# requires-python = ">=3.12"
# dependencies = ["plotly>=6.0", "kaleido>=1.0", "numpy>=2.0"]
# ///
"""Draw every picture in playbook/visualisation_catalogue.md.

Run with `uv run scripts/playbook/plotly/draw_catalogue_pictures.py`. Existing
pictures are never overwritten: move one to the trash to redraw it.

Python and Plotly rather than plot-twist itself, because plot-twist cannot draw
yet; once it can, these pictures should be redrawn by plot-twist.
"""

import logging
from pathlib import Path

from chart_pictures import PICTURES as CHART_PICTURES
from distribution_and_time_pictures import PICTURES as DISTRIBUTION_AND_TIME_PICTURES
from map_pictures import PICTURES as MAP_PICTURES
from picture_theme import save_picture
from structure_and_comparison_pictures import PICTURES as STRUCTURE_AND_COMPARISON_PICTURES
from transit_pictures import PICTURES as TRANSIT_PICTURES

PICTURE_DIRECTORY = Path(__file__).resolve().parents[3] / "playbook" / "pictures" / "plotly"


def draw_all_pictures(*, directory: Path) -> None:
    """Draw every catalogue picture that does not exist yet.

    Args:
        directory: The folder the pictures go in.

    Returns:
        None.
    """
    pictures = {**CHART_PICTURES, **MAP_PICTURES, **DISTRIBUTION_AND_TIME_PICTURES, **STRUCTURE_AND_COMPARISON_PICTURES, **TRANSIT_PICTURES}
    for relative_path, (title, draw) in pictures.items():
        path = directory / relative_path
        if path.exists():
            logging.info("kept %s", relative_path)
            continue
        save_picture(figure=draw(), title=title, path=path)
        logging.info("drew %s", relative_path)


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(message)s")
    draw_all_pictures(directory=PICTURE_DIRECTORY)
