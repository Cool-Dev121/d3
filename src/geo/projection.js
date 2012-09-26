d3.geo.projection = d3_geo_projection;

function d3_geo_projection(project) {
  return d3_geo_projectionMutator(function() { return project; })();
}

// TODO Expose this API? Not that happy with it.
function d3_geo_projectionMutator(projectAt) {
  var project,
      rotate,
      projectRotate,
      k = 150,
      x = 480,
      y = 250,
      λ = 0,
      φ = 0,
      δλ = 0,
      δφ = 0,
      δγ = 0,
      δx = x,
      δy = y;

  function p(coordinates) {
    coordinates = projectRotate(coordinates[0] * d3_radians, coordinates[1] * d3_radians);
    return [coordinates[0] * k + δx, δy - coordinates[1] * k];
  }

  function i(coordinates) {
    coordinates = projectRotate.invert((coordinates[0] - δx) / k, (δy - coordinates[1]) / k);
    return [coordinates[0] * d3_degrees, coordinates[1] * d3_degrees];
  }

  p.point = function(coordinates, context) {
    var point = p(coordinates);
    context.point(point[0], point[1]);
  };

  p.line = function(coordinates, context) {
    if (!(n = coordinates.length)) return;
    context = resample(context);
    var point = rotatePoint(coordinates[0]),
        λ0 = point[0],
        φ0 = point[1],
        λ1,
        φ1,
        sλ0 = λ0 > 0 ? π : -π,
        sλ1,
        δλ,
        i = 0,
        n;
    context.moveTo(λ0, φ0);
    while (++i < n) {
      point = rotatePoint(coordinates[i]);
      λ1 = point[0];
      φ1 = point[1];
      sλ1 = λ1 > 0 ? π : -π;
      if (sλ0 !== sλ1 && (δλ = Math.abs(λ1 - λ0)) >= π) {
        φ0 = d3_geo_projectionIntersectAntemeridian(λ0, φ0, λ1, φ1);
        context.lineTo(sλ0, φ0);
        context.moveTo(sλ1, φ0);
      }
      context.lineTo(λ0 = λ1, φ0 = φ1);
      sλ0 = sλ1;
    }
  };

  p.ring = function(coordinates, context) {
    if (!(n = coordinates.length)) return;
    context = resample(context);
    var point = rotatePoint(coordinates[0]),
        λ0 = point[0],
        φ0 = point[1],
        segment = [point],
        λ1,
        φ1,
        sλ0 = λ0 > 0 ? π : -π,
        sλ1,
        segmentSide, // the side of the last point in the buffered segment.
        δλ,
        i = 0,
        first = true, // true when no intersections have been found yet.
        side, // the side of the last start point (moveTo call).
        n;
    while (++i < n) {
      point = rotatePoint(coordinates[i]);
      λ1 = point[0];
      φ1 = point[1];
      sλ1 = λ1 > 0 ? π : -π;
      if (sλ0 !== sλ1 && (δλ = Math.abs(λ1 - λ0)) >= π) {
        φ0 = d3_geo_projectionIntersectAntemeridian(λ0, φ0, λ1, φ1);
        if (first) segment.push([sλ0, φ0]), segmentSide = sλ0;
        else {
          context.lineTo(sλ0, φ0);
          if (sλ0 !== side) interpolateTo(side, context);
          context.closePath();
        }
        context.moveTo(sλ1, φ0);
        side = sλ1;
        first = false;
      }
      if (first) segment.push(point);
      else context.lineTo(λ1, φ1);
      λ0 = λ1;
      φ0 = φ1;
      sλ0 = sλ1;
    }
    if (first) context.moveTo((point = segment[0])[0], point[1]);
    for (i = 1, n = segment.length; i < n; i++) context.lineTo((point = segment[i])[0], point[1]);
    if (!first && side !== segmentSide) interpolateTo(side, context);
    context.closePath();
  };

  function resample(context) {
    var λ0,
        φ0,
        x0,
        y0,
        δ2 = 100; // (precision in px)².

    return {
      moveTo: function(λ, φ) {
        var point = projectPoint(λ0 = λ, φ0 = φ);
        context.moveTo(x0 = point[0], y0 = point[1]);
      },
      lineTo: function(λ, φ) {
        var point = projectPoint(λ, φ);
        lineTo(x0, y0, x0 = point[0], y0 = point[1], λ0, φ0, λ0 = λ, φ0 = φ, 10);
      },
      closePath: function() {
        context.closePath();
      }
    };

    function lineTo(x0, y0, x, y, λ0, φ0, λ, φ, depth) {
      var dx,
          dy,
          λ1,
          φ1;
      if (depth && (dx = x - x0) * dx + (dy = y - y0) * dy > δ2) {
        if (Math.abs(φ0 - φ) < ε && Math.abs(Math.abs(φ) - π / 2) < ε) {
          λ1 = (λ0 + λ) / 2;
          φ1 = φ;
        } else {
          var sinφ0 = Math.sin(φ0),
              cosφ0 = Math.cos(φ0),
              sinφ = Math.sin(φ),
              cosφ = Math.cos(φ),
              cosΩ = sinφ0 * sinφ + cosφ0 * cosφ * Math.cos(λ - λ0),
              k = 1 / (Math.SQRT2 * Math.sqrt(1 + cosΩ)),
              x1 = k * cosφ0 * Math.cos(λ0) + k * cosφ * Math.cos(λ),
              y1 = k * cosφ0 * Math.sin(λ0) + k * cosφ * Math.sin(λ),
              z1 = k * sinφ0                + k * sinφ;
          λ1 = Math.atan2(y1, x1);
          φ1 = Math.asin(Math.max(-1, Math.min(1, z1)));
        }
        var point = projectPoint(λ1, φ1);
        lineTo(x0, y0, x0 = point[0], y0 = point[1], λ0, φ0, λ1, φ1, --depth);
        lineTo(x0, y0, x, y, λ1, φ1, λ, φ, depth);
      } else context.lineTo(x, y);
    }
  }

  function interpolateTo(s, context) {
    // TODO cache
    var point,
        φ = s / 2;
    context.lineTo(-s, φ);
    context.lineTo( 0, φ);
    context.lineTo( s, φ);
  }

  // TODO remove redundant code with p(coordinates)
  function rotatePoint(coordinates) {
    return rotate(coordinates[0] * d3_radians, coordinates[1] * d3_radians);
  }

  // TODO remove redundant code with p(coordinates)
  function projectPoint(λ, φ) {
    var point = project(λ, φ);
    return [point[0] * k + δx, δy - point[1] * k];
  }

  p.scale = function(_) {
    if (!arguments.length) return k;
    k = +_;
    return reset();
  };

  p.translate = function(_) {
    if (!arguments.length) return [x, y];
    x = +_[0];
    y = +_[1];
    return reset();
  };

  p.center = function(_) {
    if (!arguments.length) return [λ * d3_degrees, φ * d3_degrees];
    λ = _[0] % 360 * d3_radians;
    φ = _[1] % 360 * d3_radians;
    return reset();
  };

  p.rotate = function(_) {
    if (!arguments.length) return [δλ * d3_degrees, δφ * d3_degrees, δγ * d3_degrees];
    δλ = _[0] % 360 * d3_radians;
    δφ = _[1] % 360 * d3_radians;
    δγ = _.length > 2 ? _[2] % 360 * d3_radians : 0;
    return reset();
  };

  function reset() {
    projectRotate = d3_geo_compose(rotate = d3_geo_rotation(δλ, δφ, δγ), project);
    var center = project(λ, φ);
    δx = x - center[0] * k;
    δy = y + center[1] * k;
    return p;
  }

  return function() {
    project = projectAt.apply(this, arguments);
    p.invert = project.invert && i;
    return reset();
  };
}

function d3_geo_projectionIntersectAntemeridian(λ0, φ0, λ1, φ1) {
  var cosφ0,
      cosφ1,
      sinλ0_λ1 = Math.sin(λ0 - λ1);
  return Math.abs(sinλ0_λ1) > ε
      ? Math.atan((Math.sin(φ0) * (cosφ1 = Math.cos(φ1)) * Math.sin(λ1)
                 - Math.sin(φ1) * (cosφ0 = Math.cos(φ0)) * Math.sin(λ0))
                 / (cosφ0 * cosφ1 * sinλ0_λ1))
      : (φ0 + φ1) / 2;
}
