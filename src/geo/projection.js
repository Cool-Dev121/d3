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
    var location = rotateLocation(coordinates[0]),
        λ0 = location[0],
        φ0 = location[1],
        point = transformPoint(λ0, φ0),
        λ1,
        φ1,
        δλ,
        sλ0,
        n;
    context.moveTo(point[0], point[1]);
    for (var i = 0; i < n; i++) {
      location = rotateLocation(coordinates[i]);
      λ1 = location[0];
      φ1 = location[1];
      δλ = (Math.abs(λ1 - λ0) + 2 * π) % (2 * π);
      sλ0 = λ0 > 0;
      if (i && sλ0 ^ (λ1 > 0) && (δλ >= π || δλ < ε && Math.abs(Math.abs(λ0) - π) < ε)) {
        φ0 = intersect(λ0, φ0, λ1, φ1);
        context.lineTo((point = transformPoint(sλ0 ? π : -π, φ0))[0], point[1]);
        context.moveTo((point = transformPoint(sλ0 ? -π : π, φ0))[0], point[1]);
      }
      context.lineTo((point = transformPoint(λ0 = λ1, φ0 = φ1))[0], point[1]);
    }
  };

  p.ring = function(coordinates, context) {
    p.line(coordinates, context);
    context.closePath();
  };

  function intersect(λ0, φ0, λ1, φ1) {
    var cosφ0,
        cosφ1,
        sinλ0_λ1 = Math.sin(λ0 - λ1);
    return Math.abs(sinλ0_λ1) > ε
        ? Math.atan((Math.sin(φ0) * (cosφ1 = Math.cos(φ1)) * Math.sin(λ1)
                   - Math.sin(φ1) * (cosφ0 = Math.cos(φ0)) * Math.sin(λ0))
                   / (cosφ0 * cosφ1 * sinλ0_λ1))
        : (φ0 + φ1) / 2;
  }

  function rotateLocation(coordinates) {
    return rotate(coordinates[0] * d3_radians, coordinates[1] * d3_radians);
  }

  function transformPoint(λ, φ) {
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
