# Visualisation catalogue

Every kind of visualisation yorkville is meant to draw, as a checklist. Tick
an item when yorkville can draw it, with a test, end to end, in both
renderers.

**yorkville renders with both Plotly and ECharts**, as scribble.tube does: one
spec, either renderer, the same picture. An item is not done until both
draw it, or the catalogue says why one cannot.

yorkville will serve every MCP server that plots or visualises, scribble.tube
first. Sections 1–4 are what scribble.tube already does, so yorkville must
cover them before scribble.tube can move onto it. Surveyed from scribble-tube
at `23f6c54` (2026-09-30), mainly `src/items/plot/` and
`.documents/concepts/plot_spec.md` and `map.md`.

Each picture is drawn twice, by `scripts/playbook/plotly/` (Python) and
`scripts/playbook/echarts/` (TypeScript), in scribble.tube's light palette,
from made-up data. They show what each renderer can do, not yorkville's
output: once yorkville can draw, it should redraw them.

Sections 5–7 are not built anywhere yet: scribble.tube's own plans, transit
maps, then a wider list of candidates to keep or strike.

## 1. Chart types (scribble.tube today)

Each chart is one entry in a figure, naming columns of one shared table.

### Line

| Plotly | ECharts |
| --- | --- |
| <img src="pictures/plotly/charts/line.png" alt="Line, Plotly" width="360"> | <img src="pictures/echarts/charts/line.png" alt="Line, ECharts" width="360"> |

- [ ] Line from `x` and `y`
- [ ] One line per category (`colour`)
- [ ] Dash style per category (`line_type`: solid, dashed, dotted, dash-dot)
- [ ] A marker at each point (`show_markers`)
- [ ] Coloured by a number along its length (a gradient)
- Example: monthly rent in Toronto and Montréal, 2015–2025, one line each

### Scatter

| Plotly | ECharts |
| --- | --- |
| <img src="pictures/plotly/charts/scatter.png" alt="Scatter, Plotly" width="360"> | <img src="pictures/echarts/charts/scatter.png" alt="Scatter, ECharts" width="360"> |

- [ ] Points from `x` and `y`
- [ ] Colour by category
- [ ] Colour by a number
- [ ] Marker shape per category (`marker_shape`: circle, square, triangle, diamond, cross, star)
- [ ] Shape added automatically past 3 colour categories (colours alone stop being distinguishable)
- [ ] Bubble size from a column (`size`)
- [ ] Least-squares trend line (`show_trend_line`)
- Example: house size against price, coloured by neighbourhood, sized by lot

### Bar

| Plotly | ECharts |
| --- | --- |
| <img src="pictures/plotly/charts/bar.png" alt="Bar, Plotly" width="360"> | <img src="pictures/echarts/charts/bar.png" alt="Bar, ECharts" width="360"> |

- [ ] Vertical bars
- [ ] Horizontal bars (`orientation`)
- [ ] Grouped by category (`mode: grouped`)
- [ ] Stacked by category (`mode: stacked`), axis reaching each stack's total
- [ ] Colour by a number
- Example: population by province, stacked by age group

### Box

| Plotly | ECharts |
| --- | --- |
| <img src="pictures/plotly/charts/box.png" alt="Box, Plotly" width="360"> | <img src="pictures/echarts/charts/box.png" alt="Box, ECharts" width="360"> |

- [ ] One box from `y`
- [ ] A box per `x` category
- [ ] A box per colour category
- [ ] Tukey whiskers (1.5 IQR) and outliers, computed by the library
- [ ] A marker for every value beside the box (`show_markers`)
- Example: commute times by city

### Histogram

| Plotly | ECharts |
| --- | --- |
| <img src="pictures/plotly/charts/histogram.png" alt="Histogram, Plotly" width="360"> | <img src="pictures/echarts/charts/histogram.png" alt="Histogram, ECharts" width="360"> |

- [ ] Bins by Sturges' rule when `bins` is not given
- [ ] Set bin count (1–200)
- [ ] Normalised to a density (`is_normalised`)
- [ ] Several groups (`colour`) sharing one bin range
- Example: distribution of daily step counts, weekday against weekend

### Density

| Plotly | ECharts |
| --- | --- |
| <img src="pictures/plotly/charts/density.png" alt="Density, Plotly" width="360"> | <img src="pictures/echarts/charts/density.png" alt="Density, ECharts" width="360"> |

- [ ] Kernel density curve, computed by the library (Gaussian, Silverman bandwidth)
- [ ] Set bandwidth
- [ ] Filled area (`show_area`)
- [ ] Several groups on one shared range
- Example: age at first home purchase, by decade

### Heatmap

| Plotly | ECharts |
| --- | --- |
| <img src="pictures/plotly/charts/heatmap.png" alt="Heatmap, Plotly" width="360"> | <img src="pictures/echarts/charts/heatmap.png" alt="Heatmap, ECharts" width="360"> |

- [ ] Grid from `x`, `y` and `value`
- [ ] Linear, log and quantile colour (`colour_scale`, as on maps)
- Example: hour of day against weekday, coloured by café visits

### Pie and donut

| Plotly | ECharts |
| --- | --- |
| <img src="pictures/plotly/charts/pie_and_donut.png" alt="Pie and donut, Plotly" width="360"> | <img src="pictures/echarts/charts/pie_and_donut.png" alt="Pie and donut, ECharts" width="360"> |

- [ ] Pie from `label` and `value`
- [ ] Donut (`hole` between 0 and 1)
- Example: household spending by category

## 2. Maps (scribble.tube today)

A map is a chart type too, made of layers drawn regions → density → lines → points.

### Views

| Plotly | ECharts |
| --- | --- |
| <img src="pictures/plotly/maps/globe.png" alt="Views, Plotly" width="360"> | <img src="pictures/echarts/maps/globe.png" alt="Views, ECharts" width="360"> |

- [ ] Flat map on street tiles (OpenFreeMap, no key; dark and light styles)
- [ ] Globe you can spin (Plotly only; ECharts draws it flat with a notice)
- [ ] Fitted to everything shown, allowing for the 180° line
- [ ] Set `centre` and `zoom` (0 world to 20 street)

### Points layer

| Plotly | ECharts |
| --- | --- |
| <img src="pictures/plotly/maps/points.png" alt="Points layer, Plotly" width="360"> | <img src="pictures/echarts/maps/points.png" alt="Points layer, ECharts" width="360"> |

- [ ] Pins with labels
- [ ] Bubbles sized by a number
- [ ] Coloured by category or by a number
- Example: Toronto libraries, sized by yearly visits

### Density layer

| Plotly | ECharts |
| --- | --- |
| <img src="pictures/plotly/maps/density.png" alt="Density layer, Plotly" width="360"> | <img src="pictures/echarts/maps/density.png" alt="Density layer, ECharts" width="360"> |

- [ ] Heat map of points (flat maps only)
- [ ] Weighted by a column
- Example: where cycling collisions cluster

### Regions layer (choropleth)

| Plotly | ECharts |
| --- | --- |
| <img src="pictures/plotly/maps/regions.png" alt="Regions layer (choropleth), Plotly" width="360"> | <img src="pictures/echarts/maps/regions.png" alt="Regions layer (choropleth), ECharts" width="360"> |

- [ ] Inline GeoJSON
- [ ] GeoJSON from a URL, fetched once and stored
- [ ] Built-in outlines: world countries, US states, Canadian provinces, EU countries
- [ ] Names matched loosely: case, accents, codes ("Québec", "quebec", "QC", "CA-QC")
- [ ] Unmatched rows and regions reported back
- [ ] Coloured by a number or by category
- Example: median income by province

### Lines layer

| Plotly | ECharts |
| --- | --- |
| <img src="pictures/plotly/maps/lines.png" alt="Lines layer, Plotly" width="360"> | <img src="pictures/echarts/maps/lines.png" alt="Lines layer, ECharts" width="360"> |

- [ ] Routes between two places as great-circle arcs
- [ ] Coloured and sized (`width`) by value
- Example: flights out of Pearson, width by passengers

### Map colour
- [ ] Linear, log and quantile scales (`colour_scale`)
- [ ] Legend in real values, whatever the scale
- [ ] Log scale reports zero and negative values

## 3. Figure layout and encoding (scribble.tube today)

- [ ] Several plots in a rows × columns grid (up to 12)
- [ ] Shared x and shared y axes across the grid
- [ ] Figure title and caption; per-plot title and axis labels
- [ ] A plot may bring its own table instead of the figure's
- [ ] Linear and log axes (`x_scale`, `y_scale`)
- [ ] Bars, histograms and densities always show zero
- [ ] Whole numbers that read as years printed without separators (2005, not 2,005)
- [ ] Axis titles placed clear of the widest tick label
- [ ] Legend shown from two series up
- [ ] Colour bar for continuous colour
- [ ] Categorical palette: 8 fixed hues in a fixed order, refusing a 9th
- [ ] Sequential palette: one hue, light to dark
- [ ] Dark and light themes
- [ ] Every error names the field at fault, before anything is drawn
- [ ] Limits: 100,000 rows, 12 plots, 200 bins

## 4. Renderers and interaction (scribble.tube today)

- [ ] ECharts renderer (the default)
- [ ] Plotly renderer
- [ ] Same spec, same picture in both: statistics and colours decided before the renderer
- [ ] Switching renderer on a shown chart
- [ ] Click on a chart returns series, x and y
- [ ] Click on a map returns the place and the region
- [ ] Export the shown chart as an image

## 5. Planned in scribble.tube, not built

From scribble-tube's `.documents/todo.md`.

- [ ] Annotations: event markers and footnotes
- [ ] A `sources` field on every figure
- [ ] Table: sortable, with CSV download
- [ ] "Show data" switch on every plot
- [ ] Feedback from a brushed range on a chart, and from table rows
- [ ] Update a shown figure in place (new data, a series, a title, a scale)
- [ ] Map time slider: values per year to scrub through
- [ ] More built-in outlines: Canadian census geographies, Toronto's 158 neighbourhoods and wards
- [ ] Files uploaded as data instead of inline tables

## 6. Transit maps (decided, not built)

Two kinds, both needed. Neither renderer has a transit map
built in; both draw one from station positions, as these pictures do. The
pictures are a simplified Toronto subway (`scripts/playbook/toronto_subway.json`).

### True to geography

| Plotly | ECharts |
| --- | --- |
| <img src="pictures/plotly/transit/geographic.png" alt="Geographic transit map, Plotly" width="360"> | <img src="pictures/echarts/transit/geographic.png" alt="Geographic transit map, ECharts" width="360"> |

- [ ] Lines as paths through every stop, at real positions
- [ ] Drawn on a map (street tiles or outlines), with water and land for reference
- [ ] Line colour per route, in the line's own colour
- [ ] Stations, with interchanges marked apart
- [ ] Labels that do not collide
- Example: the TTC subway over Toronto

### Schematic

| Plotly | ECharts |
| --- | --- |
| <img src="pictures/plotly/transit/schematic.png" alt="Schematic transit map, Plotly" width="360"> | <img src="pictures/echarts/transit/schematic.png" alt="Schematic transit map, ECharts" width="360"> |

- [ ] Lines that run only horizontal, vertical or at 45°
- [ ] Even spacing between stations, whatever the real distance
- [ ] Interchanges marked apart; lines sharing track drawn side by side
- [ ] Labels that do not collide
- [ ] Positions from the caller
- [ ] Positions computed from geography (an octilinear layout algorithm: the hard part)
- Example: the TTC's own subway map

## 7. Candidates, not yet decided

Common forms neither project has. Strike what is not wanted; move what is
into a numbered section once decided.

### Distribution

| | Plotly | ECharts |
| --- | --- | --- |
| Violin | <img src="pictures/plotly/candidates/distribution/violin.png" alt="violin, Plotly" width="260"> | <img src="pictures/echarts/candidates/distribution/violin.png" alt="violin, ECharts" width="260"> |
| Ridgeline | <img src="pictures/plotly/candidates/distribution/ridgeline.png" alt="ridgeline, Plotly" width="260"> | <img src="pictures/echarts/candidates/distribution/ridgeline.png" alt="ridgeline, ECharts" width="260"> |
| Strip | <img src="pictures/plotly/candidates/distribution/strip.png" alt="strip, Plotly" width="260"> | <img src="pictures/echarts/candidates/distribution/strip.png" alt="strip, ECharts" width="260"> |
| Cumulative distribution | <img src="pictures/plotly/candidates/distribution/cumulative_distribution.png" alt="cumulative distribution, Plotly" width="260"> | <img src="pictures/echarts/candidates/distribution/cumulative_distribution.png" alt="cumulative distribution, ECharts" width="260"> |
| Two dimensional histogram | <img src="pictures/plotly/candidates/distribution/two_dimensional_histogram.png" alt="two dimensional histogram, Plotly" width="260"> | <img src="pictures/echarts/candidates/distribution/two_dimensional_histogram.png" alt="two dimensional histogram, ECharts" width="260"> |
| Contour | <img src="pictures/plotly/candidates/distribution/contour.png" alt="contour, Plotly" width="260"> | <img src="pictures/echarts/candidates/distribution/contour.png" alt="contour, ECharts" width="260"> |

- [ ] Violin
- [ ] Ridgeline (stacked densities)
- [ ] Strip and swarm plots
- [ ] Empirical cumulative distribution
- [ ] 2D histogram and hexbin
- [ ] Contour of 2D density

### Change over time

| | Plotly | ECharts |
| --- | --- | --- |
| Stacked area | <img src="pictures/plotly/candidates/time/stacked_area.png" alt="stacked area, Plotly" width="260"> | <img src="pictures/echarts/candidates/time/stacked_area.png" alt="stacked area, ECharts" width="260"> |
| Step | <img src="pictures/plotly/candidates/time/step.png" alt="step, Plotly" width="260"> | <img src="pictures/echarts/candidates/time/step.png" alt="step, ECharts" width="260"> |
| Candlestick | <img src="pictures/plotly/candidates/time/candlestick.png" alt="candlestick, Plotly" width="260"> | <img src="pictures/echarts/candidates/time/candlestick.png" alt="candlestick, ECharts" width="260"> |
| Error bands | <img src="pictures/plotly/candidates/time/error_bands.png" alt="error bands, Plotly" width="260"> | <img src="pictures/echarts/candidates/time/error_bands.png" alt="error bands, ECharts" width="260"> |
| Timeline | <img src="pictures/plotly/candidates/time/timeline.png" alt="timeline, Plotly" width="260"> | <img src="pictures/echarts/candidates/time/timeline.png" alt="timeline, ECharts" width="260"> |
| Calendar heatmap | <img src="pictures/plotly/candidates/time/calendar_heatmap.png" alt="calendar heatmap, Plotly" width="260"> | <img src="pictures/echarts/candidates/time/calendar_heatmap.png" alt="calendar heatmap, ECharts" width="260"> |
| Sparklines | <img src="pictures/plotly/candidates/time/sparklines.png" alt="sparklines, Plotly" width="260"> | <img src="pictures/echarts/candidates/time/sparklines.png" alt="sparklines, ECharts" width="260"> |

- [ ] Area and stacked area
- [ ] Step line
- [ ] Candlestick (open, high, low, close)
- [ ] Error bars and confidence bands
- [ ] Timeline and Gantt
- [ ] Calendar heatmap
- [ ] Sparkline

### Parts of a whole

| | Plotly | ECharts |
| --- | --- | --- |
| Treemap | <img src="pictures/plotly/candidates/parts/treemap.png" alt="treemap, Plotly" width="260"> | <img src="pictures/echarts/candidates/parts/treemap.png" alt="treemap, ECharts" width="260"> |
| Sunburst | <img src="pictures/plotly/candidates/parts/sunburst.png" alt="sunburst, Plotly" width="260"> | <img src="pictures/echarts/candidates/parts/sunburst.png" alt="sunburst, ECharts" width="260"> |
| Waterfall | <img src="pictures/plotly/candidates/parts/waterfall.png" alt="waterfall, Plotly" width="260"> | <img src="pictures/echarts/candidates/parts/waterfall.png" alt="waterfall, ECharts" width="260"> |
| Funnel | <img src="pictures/plotly/candidates/parts/funnel.png" alt="funnel, Plotly" width="260"> | <img src="pictures/echarts/candidates/parts/funnel.png" alt="funnel, ECharts" width="260"> |
| Full stacked bar | <img src="pictures/plotly/candidates/parts/full_stacked_bar.png" alt="full stacked bar, Plotly" width="260"> | <img src="pictures/echarts/candidates/parts/full_stacked_bar.png" alt="full stacked bar, ECharts" width="260"> |

- [ ] Treemap
- [ ] Sunburst
- [ ] Waterfall
- [ ] Funnel
- [ ] Stacked bar to 100%

### Relationships and flow

| | Plotly | ECharts |
| --- | --- | --- |
| Sankey | <img src="pictures/plotly/candidates/relationships/sankey.png" alt="sankey, Plotly" width="260"> | <img src="pictures/echarts/candidates/relationships/sankey.png" alt="sankey, ECharts" width="260"> |
| Network | <img src="pictures/plotly/candidates/relationships/network.png" alt="network, Plotly" width="260"> | <img src="pictures/echarts/candidates/relationships/network.png" alt="network, ECharts" width="260"> |
| Correlation matrix | <img src="pictures/plotly/candidates/relationships/correlation_matrix.png" alt="correlation matrix, Plotly" width="260"> | <img src="pictures/echarts/candidates/relationships/correlation_matrix.png" alt="correlation matrix, ECharts" width="260"> |
| Chord | _Plotly has no chord diagram_ | <img src="pictures/echarts/candidates/relationships/chord.png" alt="chord, ECharts" width="260"> |
| Scatter matrix | <img src="pictures/plotly/candidates/relationships/scatter_matrix.png" alt="scatter matrix, Plotly" width="260"> | <img src="pictures/echarts/candidates/relationships/scatter_matrix.png" alt="scatter matrix, ECharts" width="260"> |
| Parallel coordinates | <img src="pictures/plotly/candidates/relationships/parallel_coordinates.png" alt="parallel coordinates, Plotly" width="260"> | <img src="pictures/echarts/candidates/relationships/parallel_coordinates.png" alt="parallel coordinates, ECharts" width="260"> |

- [ ] Sankey
- [ ] Network graph (nodes and edges)
- [ ] Chord diagram (ECharts only)
- [ ] Correlation matrix
- [ ] Scatter-plot matrix
- [ ] Parallel coordinates

### Comparison

| | Plotly | ECharts |
| --- | --- | --- |
| Radar | <img src="pictures/plotly/candidates/comparison/radar.png" alt="radar, Plotly" width="260"> | <img src="pictures/echarts/candidates/comparison/radar.png" alt="radar, ECharts" width="260"> |
| Dumbbell | <img src="pictures/plotly/candidates/comparison/dumbbell.png" alt="dumbbell, Plotly" width="260"> | <img src="pictures/echarts/candidates/comparison/dumbbell.png" alt="dumbbell, ECharts" width="260"> |
| Lollipop | <img src="pictures/plotly/candidates/comparison/lollipop.png" alt="lollipop, Plotly" width="260"> | <img src="pictures/echarts/candidates/comparison/lollipop.png" alt="lollipop, ECharts" width="260"> |
| Bullet | <img src="pictures/plotly/candidates/comparison/bullet.png" alt="bullet, Plotly" width="260"> | <img src="pictures/echarts/candidates/comparison/bullet.png" alt="bullet, ECharts" width="260"> |

- [ ] Radar
- [ ] Dumbbell (before and after)
- [ ] Lollipop
- [ ] Bullet chart

### Three dimensions

| | Plotly | ECharts |
| --- | --- | --- |
| Scatter | <img src="pictures/plotly/candidates/three_dimensions/scatter.png" alt="scatter, Plotly" width="260"> | _3D needs echarts-gl (WebGL), which cannot draw server-side_ |
| Surface | <img src="pictures/plotly/candidates/three_dimensions/surface.png" alt="surface, Plotly" width="260"> | _3D needs echarts-gl (WebGL), which cannot draw server-side_ |

- [ ] 3D scatter
- [ ] Surface

### Numbers at a glance

| | Plotly | ECharts |
| --- | --- | --- |
| Stat tiles | <img src="pictures/plotly/candidates/glance/stat_tiles.png" alt="stat tiles, Plotly" width="260"> | <img src="pictures/echarts/candidates/glance/stat_tiles.png" alt="stat tiles, ECharts" width="260"> |
| Gauge | <img src="pictures/plotly/candidates/glance/gauge.png" alt="gauge, Plotly" width="260"> | <img src="pictures/echarts/candidates/glance/gauge.png" alt="gauge, ECharts" width="260"> |

- [ ] Stat tile (one number, its change)
- [ ] Gauge or meter

### Diagrams

| | Plotly | ECharts |
| --- | --- | --- |
| Tree | <img src="pictures/plotly/candidates/relationships/tree.png" alt="tree, Plotly" width="260"> | <img src="pictures/echarts/candidates/relationships/tree.png" alt="tree, ECharts" width="260"> |

- [ ] Flowchart (no picture: not a chart)
- [ ] Sequence diagram (no picture: not a chart)
- [ ] Tree and hierarchy
