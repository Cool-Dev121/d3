// ranges (bad, satisfactory, good)
// measures (actual, forecast)
// markers (previous, goal)

/*
 * Chart design based on the recommendations of Stephen Few. Implementation
 * based on the work of Clint Ivy, Jamie Love, and Jason Davies.
 * http://projects.instantcognition.com/protovis/bulletchart/
 */

/**
 * Constructs a new, empty bullet chart.
 */
d3.chart.bullet = function() {
  var orient = 'left',
      ranges = function(d) { return d.ranges },
      markers = function(d) { return d.markers },
      measures = function(d) { return d.measures },
      horizontal,
      maximum = null,
      width = 500,
      height = 30,
      rangeColor = d3.scale.linear(),
      measureColor = d3.scale.linear(),
      scale = d3.scale.linear(),
      tickFormat = d3.format(',.0f');

  var reverse = function(l) {
    for (var i=0, ii=l.length; i<ii; i++) {
      l[i].sort(function(a, b) { return b - a });
    }
  };

  var bullet = function() {
    var data = [];
    for (var i=0, ii=this.length; i<ii; i++) {
      data.push(this[i][0].__data__);
    }
    // temporary hack for testing
    var cache = {
      ranges: data.map(ranges),
      measures: data.map(measures),
      markers: data.map(markers)
    };
    buildCache(cache);
    // sort to lay SVG in correct order
    reverse(cache.ranges);
    reverse(cache.measures);
    var chart = this.selectAll('g.bullet')
        .data(data)
      .enter().append('svg:g')
        .attr('class', 'bullet');
    chart.selectAll('rect.range')
      .data(function(d, i) { return cache.ranges[i] })
        .enter().append('svg:rect')
        .attr('class', 'range')
        .attr('width', scale)
        .attr('height', height)
        .attr('style', function(d, i) { return 'fill:' + rangeColor(i) });
    chart.selectAll('rect.measure')
      .data(function(d, i) { return cache.measures[i] })
        .enter().append('svg:rect')
        .attr('class', 'measure')
        .attr('width', scale)
        .attr('height', height / 3)
        .attr('y', height / 3)
        .attr('fill', function(d, i) { return measureColor(i) });
    chart.selectAll('line.marker')
      .data(function(d, i) { return cache.markers[i] })
        .enter().append('svg:line')
        .attr('class', 'marker')
        .attr('x1', scale)
        .attr('x2', scale)
        .attr('y1', height/6)
        .attr('y2', height * 5/6)
        .attr('stroke', '#000')
        .attr('stroke-width', '2px')
    var ticks = scale.ticks(10);
    this.selectAll('line.rule')
      .data(ticks)
        .enter().append('svg:line')
        .attr('class', 'rule')
        .attr('x1', scale)
        .attr('x2', scale)
        .attr('y1', height)
        .attr('y2', height * 7/6)
        .attr('stroke', '#666')
        .attr('stroke-width', '.5px')
    this.selectAll('text.tick')
      .data(ticks)
        .enter().append('svg:text')
        .attr('class', 'tick')
        .attr('x', scale)
        .attr('y', height * 7/6)
        .attr('text-anchor', 'middle')
        .attr('dy', '1em')
        .text(tickFormat)
  }

  var maxlength = function(l) {
    return d3.max(l, function(d) { return d.length });
  }

  /** Cache chart state to optimize properties. */
  var buildCache = function(cache) {
    horizontal = /^left|right$/.test(orient);
    rangeColor.domain([0, Math.max(1, maxlength(cache.ranges) - 1)])
        .range(["#eee", "#bbb"]);
    measureColor.domain([0, Math.max(1, maxlength(cache.measures) - 1)])
        .range(["lightsteelblue", "steelblue"]);
    maximum = d3.max([].concat(cache.ranges, cache.markers, cache.measures), function(d) { return d3.max(d) });
    scale.domain([0, maximum]).range([0, width]);
  };

  // left, right, top, bottom
  bullet.orient = function(x) {
    if (!arguments.length) return orient;
    orient = x;
    return bullet;
  };

  bullet.ranges = function(x) {
    if (!arguments.length) return ranges;
    ranges = x;
    return bullet;
  };

  bullet.markers = function(x) {
    if (!arguments.length) return markers;
    markers = x;
    return bullet;
  };

  bullet.measures = function(x) {
    if (!arguments.length) return measures;
    measures = x;
    return bullet;
  };

  bullet.maximum = function(x) {
    if (!arguments.length) return maximum;
    maximum = x;
    return bullet;
  };

  bullet.width = function(x) {
    if (!arguments.length) return width;
    width = x;
    return bullet;
  };

  bullet.height = function(x) {
    if (!arguments.length) return height;
    height = x;
    return bullet;
  };

  bullet.tickFormat = function(x) {
    if (!arguments.length) return tickFormat;
    tickFormat = x;
    return bullet;
  };

  return bullet;
};
