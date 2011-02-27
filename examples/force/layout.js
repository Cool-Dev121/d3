// A rudimentary force layout using Gauss-Seidel.
function layout_force() {
  var force = {},
      event = d3.dispatch("tick"),
      size = {x: 1, y: 1},
      alpha = .1,
      nodeDistance = 60,
      linkDistance = 30,
      interval,
      nodes,
      links;

  // TODO
  // slow the interval as the graph stabilizes
  // allow the nodes to be dragged interactively

  function tick() {
    var n = nodes.length,
        m = links.length,
        i, // current index
        j, // current index
        o, // current link
        s, // current source
        t, // current target
        l, // current distance
        x,
        y;

    // repel nodes
    for (i = 0; i < n; ++i) {
      s = nodes[i];
      for (j = i + 1; j < n; ++j) {
        t = nodes[j];
        x = t.x - s.x;
        y = t.y - s.y;
        l = Math.sqrt(x * x + y * y);
        if (l < nodeDistance) {
          l = alpha * (l - nodeDistance) / l;
          x *= l;
          y *= l;
          if (s.fixed) {
            if (t.fixed) continue;
            t.x -= x;
            t.y -= y;
          } else if (t.fixed) {
            s.x += x;
            s.y += y;
          } else {
            s.x += x;
            s.y += y;
            t.x -= x;
            t.y -= y;
          }
        }
      }
    }

    // position constraint for links
    for (i = 0; i < m; ++i) {
      o = links[i];
      s = o.source;
      t = o.target;
      x = t.x - s.x;
      y = t.y - s.y;
      l = Math.sqrt(x * x + y * y);
      if (l <= 0) l = 0.01;
      l = alpha * (l - linkDistance) / l;
      x *= l;
      y *= l;
      if (s.fixed) {
        if (t.fixed) continue;
        t.x -= x;
        t.y -= y;
      } else if (t.fixed) {
        s.x += x;
        s.y += y;
      } else {
        s.x += x;
        s.y += y;
        t.x -= x;
        t.y -= y;
      }
    }

    event.tick.dispatch({type: "tick"});
  }

  force.on = function(type, listener) {
    event[type].add(listener);
    return force;
  };

  force.nodes = function(x) {
    if (!arguments.length) return nodes;
    nodes = x;
    return force;
  };

  force.links = function(x) {
    if (!arguments.length) return links;
    links = x;
    return force;
  };

  force.size = function(x) {
    if (!arguments.length) return size;
    size = x;
    return force;
  };

  force.nodeDistance = function(d) {
    if (!arguments.length) return nodeDistance;
    nodeDistance = d;
    return force;
  };

  force.linkDistance = function(d) {
    if (!arguments.length) return linkDistance;
    linkDistance = d;
    return force;
  };

  force.start = function() {
    var i,
        n = nodes.length,
        m = links.length,
        w = size.x,
        h = size.y,
        o;
    for (i = 0; i < n; ++i) {
      o = nodes[i];
      o.x = o.x || Math.random() * w;
      o.y = o.y || Math.random() * h;
      o.fixed = 0;
    }
    for (i = 0; i < m; ++i) {
      o = links[i];
      o.source = nodes[o.source];
      o.target = nodes[o.target];
    }
    if (interval) clearInterval(interval);
    interval = setInterval(tick, 24);
    return force;
  };

  force.resume = function() {
    if (interval) clearInterval(interval);
    interval = setInterval(tick, 24);
    return force;
  };

  force.stop = function() {
    interval = clearInterval(interval);
    return force;
  };

  return force;
}
