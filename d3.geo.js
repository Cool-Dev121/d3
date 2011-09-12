(function(){d3.geo = {};

var d3_radians = Math.PI / 180,
    d3_geo_earthRadius = 6371; // Mean radius of Earth, in km.
// TODO clip input coordinates on opposite hemisphere
d3.geo.azimuthal = function() {
  var mode = "orthographic", // or stereographic, gnomonic, equidistant or equalarea
      origin,
      scale = 200,
      translate = [480, 250],
      x0,
      y0,
      cy0,
      sy0;

  function azimuthal(coordinates) {
    var x1 = coordinates[0] * d3_radians - x0,
        y1 = coordinates[1] * d3_radians,
        cx1 = Math.cos(x1),
        sx1 = Math.sin(x1),
        cy1 = Math.cos(y1),
        sy1 = Math.sin(y1),
        cc = mode !== "orthographic" ? sy0 * sy1 + cy0 * cy1 * cx1 : null,
        c,
        k = mode === "stereographic" ? 1 / (1 + cc)
          : mode === "gnomonic" ? 1 / cc
          : mode === "equidistant" ? (c = Math.acos(cc), c / Math.sin(c))
          : mode === "equalarea" ? Math.sqrt(2 / (1 + cc))
          : 1,
        x = k * cy1 * sx1,
        y = k * (sy0 * cy1 * cx1 - cy0 * sy1);
    return [
      scale * x + translate[0],
      scale * y + translate[1]
    ];
  }

  azimuthal.invert = function(coordinates) {
    var x = (coordinates[0] - translate[0]) / scale,
        y = (coordinates[1] - translate[1]) / scale,
        p = Math.sqrt(x * x + y * y),
        c = mode === "stereographic" ? 2 * Math.atan(p)
          : mode === "gnomonic" ? Math.atan(p)
          : mode === "equidistant" ? p
          : mode === "equalarea" ? 2 * Math.asin(.5 * p)
          : Math.asin(p),
        sc = Math.sin(c),
        cc = Math.cos(c);
    return [
      (x0 + Math.atan2(x * sc, p * cy0 * cc + y * sy0 * sc)) / d3_radians,
      Math.asin(cc * sy0 - (y * sc * cy0) / p) / d3_radians
    ];
  };

  azimuthal.mode = function(x) {
    if (!arguments.length) return mode;
    mode = x + "";
    return azimuthal;
  };

  azimuthal.origin = function(x) {
    if (!arguments.length) return origin;
    origin = x;
    x0 = origin[0] * d3_radians;
    y0 = origin[1] * d3_radians;
    cy0 = Math.cos(y0);
    sy0 = Math.sin(y0);
    return azimuthal;
  };

  azimuthal.scale = function(x) {
    if (!arguments.length) return scale;
    scale = +x;
    return azimuthal;
  };

  azimuthal.translate = function(x) {
    if (!arguments.length) return translate;
    translate = [+x[0], +x[1]];
    return azimuthal;
  };

  return azimuthal.origin([0, 0]);
};
// Derived from Tom Carden's Albers implementation for Protovis.
// http://gist.github.com/476238
// http://mathworld.wolfram.com/AlbersEqual-AreaConicProjection.html

d3.geo.albers = function() {
  var origin = [-98, 38],
      parallels = [29.5, 45.5],
      scale = 1000,
      translate = [480, 250],
      lng0, // d3_radians * origin[0]
      n,
      C,
      p0;

  function albers(coordinates) {
    var t = n * (d3_radians * coordinates[0] - lng0),
        p = Math.sqrt(C - 2 * n * Math.sin(d3_radians * coordinates[1])) / n;
    return [
      scale * p * Math.sin(t) + translate[0],
      scale * (p * Math.cos(t) - p0) + translate[1]
    ];
  }

  albers.invert = function(coordinates) {
    var x = (coordinates[0] - translate[0]) / scale,
        y = (coordinates[1] - translate[1]) / scale,
        p0y = p0 + y,
        t = Math.atan2(x, p0y),
        p = Math.sqrt(x * x + p0y * p0y);
    return [
      (lng0 + t / n) / d3_radians,
      Math.asin((C - p * p * n * n) / (2 * n)) / d3_radians
    ];
  };

  function reload() {
    var phi1 = d3_radians * parallels[0],
        phi2 = d3_radians * parallels[1],
        lat0 = d3_radians * origin[1],
        s = Math.sin(phi1),
        c = Math.cos(phi1);
    lng0 = d3_radians * origin[0];
    n = .5 * (s + Math.sin(phi2));
    C = c * c + 2 * n * s;
    p0 = Math.sqrt(C - 2 * n * Math.sin(lat0)) / n;
    return albers;
  }

  albers.origin = function(x) {
    if (!arguments.length) return origin;
    origin = [+x[0], +x[1]];
    return reload();
  };

  albers.parallels = function(x) {
    if (!arguments.length) return parallels;
    parallels = [+x[0], +x[1]];
    return reload();
  };

  albers.scale = function(x) {
    if (!arguments.length) return scale;
    scale = +x;
    return albers;
  };

  albers.translate = function(x) {
    if (!arguments.length) return translate;
    translate = [+x[0], +x[1]];
    return albers;
  };

  return reload();
};

// A composite projection for the United States, 960x500. The set of standard
// parallels for each region comes from USGS, which is published here:
// http://egsc.usgs.gov/isb/pubs/MapProjections/projections.html#albers
// TODO allow the composite projection to be rescaled?
d3.geo.albersUsa = function() {
  var lower48 = d3.geo.albers();

  var alaska = d3.geo.albers()
      .origin([-160, 60])
      .parallels([55, 65]);

  var hawaii = d3.geo.albers()
      .origin([-160, 20])
      .parallels([8, 18]);

  var puertoRico = d3.geo.albers()
      .origin([-60, 10])
      .parallels([8, 18]);

  function albersUsa(coordinates) {
    var lon = coordinates[0],
        lat = coordinates[1];
    return (lat > 50 ? alaska
        : lon < -140 ? hawaii
        : lat < 21 ? puertoRico
        : lower48)(coordinates);
  }

  albersUsa.scale = function(x) {
    if (!arguments.length) return lower48.scale();
    lower48.scale(x);
    alaska.scale(x * .6);
    hawaii.scale(x);
    puertoRico.scale(x * 1.5);
    return albersUsa.translate(lower48.translate());
  };

  albersUsa.translate = function(x) {
    if (!arguments.length) return lower48.translate();
    var dz = lower48.scale() / 1000,
        dx = x[0],
        dy = x[1];
    lower48.translate(x);
    alaska.translate([dx - 400 * dz, dy + 170 * dz]);
    hawaii.translate([dx - 190 * dz, dy + 200 * dz]);
    puertoRico.translate([dx + 580 * dz, dy + 430 * dz]);
    return albersUsa;
  };

  return albersUsa.scale(lower48.scale());
};
d3.geo.mercator = function() {
  var scale = 500,
      translate = [480, 250];

  function mercator(coordinates) {
    var x = coordinates[0] / 360,
        y = -(Math.log(Math.tan(Math.PI / 4 + coordinates[1] * d3_radians / 2)) / d3_radians) / 360;
    return [
      scale * x + translate[0],
      scale * Math.max(-.5, Math.min(.5, y)) + translate[1]
    ];
  }

  mercator.invert = function(coordinates) {
    var x = (coordinates[0] - translate[0]) / scale,
        y = (coordinates[1] - translate[1]) / scale;
    return [
      360 * x,
      2 * Math.atan(Math.exp(-360 * y * d3_radians)) / d3_radians - 90
    ];
  };

  mercator.scale = function(x) {
    if (!arguments.length) return scale;
    scale = +x;
    return mercator;
  };

  mercator.translate = function(x) {
    if (!arguments.length) return translate;
    translate = [+x[0], +x[1]];
    return mercator;
  };

  return mercator;
};
/**
 * Returns a function that, given a GeoJSON object (e.g., a feature), returns
 * the corresponding SVG path. The function can be customized by overriding the
 * projection. Point features are mapped to circles with a default radius of
 * 4.5px; the radius can be specified either as a constant or a function that
 * is evaluated per object.
 */
d3.geo.path = function() {
  var pointRadius = 4.5,
      pointCircle = d3_path_circle(pointRadius),
      projection = d3.geo.albersUsa(),
      clip = Object;

  function path(d, i) {
    if (typeof pointRadius === "function") {
      pointCircle = d3_path_circle(pointRadius.apply(this, arguments));
    }
    return d3_geo_pathType(pathTypes, d);
  }

  function project(coordinates) {
    return projection(coordinates).join(",");
  }

  var pathTypes = {

    FeatureCollection: function(f) {
      var path = [],
          features = f.features,
          i = -1, // features.index
          n = features.length;
      while (++i < n) path.push(d3_geo_pathType(pathTypes, features[i].geometry));
      return path.join("");
    },

    Feature: function(f) {
      return d3_geo_pathType(pathTypes, f.geometry);
    },

    Point: function(o) {
      var coordinates = clip.call(this, [o.coordinates]);
      return coordinates.length
        ? "M" + project(coordinates[0]) + pointCircle : "";
    },

    MultiPoint: function(o) {
      var path = [],
          coordinates = clip.call(this, o.coordinates),
          i = -1, // coordinates.index
          n = coordinates.length;
      while (++i < n) path.push("M", project(coordinates[i]), pointCircle);
      return path.join("");
    },

    LineString: function(o) {
      var path = ["M"],
          coordinates = clip.call(this, o.coordinates),
          i = -1, // coordinates.index
          n = coordinates.length;
      while (++i < n) path.push(project(coordinates[i]), "L");
      path.pop();
      return path.join("");
    },

    MultiLineString: function(o) {
      var path = [],
          coordinates = o.coordinates,
          i = -1, // coordinates.index
          n = coordinates.length,
          subcoordinates, // coordinates[i]
          j, // subcoordinates.index
          m; // subcoordinates.length
      while (++i < n) {
        subcoordinates = clip.call(this, coordinates[i]);
        j = -1;
        m = subcoordinates.length;
        path.push("M");
        while (++j < m) path.push(project(subcoordinates[j]), "L");
        path.pop();
      }
      return path.join("");
    },

    Polygon: function(o) {
      var path = [],
          coordinates = o.coordinates,
          i = -1, // coordinates.index
          n = coordinates.length,
          subcoordinates, // coordinates[i]
          j, // subcoordinates.index
          m; // subcoordinates.length
      while (++i < n) {
        subcoordinates = clip.call(this, coordinates[i]);
        j = -1;
        m = subcoordinates.length - 1;
        if (m < 1) continue;
        path.push("M");
        while (++j < m) path.push(project(subcoordinates[j]), "L");
        path[path.length - 1] = "Z";
      }
      return path.join("");
    },

    MultiPolygon: function(o) {
      var path = [],
          coordinates = o.coordinates,
          i = -1, // coordinates index
          n = coordinates.length,
          subcoordinates, // coordinates[i]
          j, // subcoordinates index
          m, // subcoordinates.length
          subsubcoordinates, // subcoordinates[j]
          k, // subsubcoordinates index
          p; // subsubcoordinates.length
      while (++i < n) {
        subcoordinates = coordinates[i];
        j = -1;
        m = subcoordinates.length;
        while (++j < m) {
          subsubcoordinates = clip.call(this, subcoordinates[j]);
          k = -1;
          p = subsubcoordinates.length - 1;
          if (p < 1) continue;
          path.push("M");
          while (++k < p) path.push(project(subsubcoordinates[k]), "L");
          path[path.length - 1] = "Z";
        }
      }
      return path.join("");
    },

    GeometryCollection: function(o) {
      var path = [],
          geometries = o.geometries,
          i = -1, // geometries index
          n = geometries.length;
      while (++i < n) path.push(d3_geo_pathType(pathTypes, geometries[i]));
      return path.join("");
    }

  };

  var areaTypes = {

    FeatureCollection: function(f) {
      var area = 0,
          features = f.features,
          i = -1, // features.index
          n = features.length;
      while (++i < n) area += d3_geo_pathType(areaTypes, features[i]);
      return area;
    },

    Feature: function(f) {
      return d3_geo_pathType(areaTypes, f.geometry);
    },

    Point: d3_geo_pathZero,
    MultiPoint: d3_geo_pathZero,
    LineString: d3_geo_pathZero,
    MultiLineString: d3_geo_pathZero,

    Polygon: function(o) {
      return polygonArea(o.coordinates);
    },

    MultiPolygon: function(o) {
      var sum = 0,
          coordinates = o.coordinates,
          i = -1, // coordinates index
          n = coordinates.length;
      while (++i < n) sum += polygonArea(coordinates[i]);
      return sum;
    },

    GeometryCollection: function(o) {
      var sum = 0,
          geometries = o.geometries,
          i = -1, // geometries index
          n = geometries.length;
      while (++i < n) sum += d3_geo_pathType(areaTypes, geometries[i]);
      return sum;
    }

  };

  function polygonArea(coordinates) {
    var sum = area(coordinates[0]), // exterior ring
        i = 0, // coordinates.index
        n = coordinates.length;
    while (++i < n) sum -= area(coordinates[i]); // holes
    return sum;
  }

  function polygonCentroid(coordinates) {
    var polygon = d3.geom.polygon(coordinates[0].map(projection)), // exterior ring
        centroid = polygon.centroid(1),
        x = centroid[0],
        y = centroid[1],
        z = Math.abs(polygon.area()),
        i = 0, // coordinates index
        n = coordinates.length;
    while (++i < n) {
      polygon = d3.geom.polygon(coordinates[i].map(projection)); // holes
      centroid = polygon.centroid(1);
      x -= centroid[0];
      y -= centroid[1];
      z -= Math.abs(polygon.area());
    }
    return [x, y, 6 * z]; // weighted centroid
  }

  var centroidTypes = {

    // TODO FeatureCollection
    // TODO Point
    // TODO MultiPoint
    // TODO LineString
    // TODO MultiLineString
    // TODO GeometryCollection

    Feature: function(f) {
      return d3_geo_pathType(centroidTypes, f.geometry);
    },

    Polygon: function(o) {
      var centroid = polygonCentroid(o.coordinates);
      return [centroid[0] / centroid[2], centroid[1] / centroid[2]];
    },

    MultiPolygon: function(o) {
      var area = 0,
          coordinates = o.coordinates,
          centroid,
          x = 0,
          y = 0,
          z = 0,
          i = -1, // coordinates index
          n = coordinates.length;
      while (++i < n) {
        centroid = polygonCentroid(coordinates[i]);
        x += centroid[0];
        y += centroid[1];
        z += centroid[2];
      }
      return [x / z, y / z];
    }

  };


  function area(coordinates) {
    return Math.abs(d3.geom.polygon(coordinates.map(projection)).area());
  }

  path.projection = function(x) {
    projection = x;
    return path;
  };

  path.clip = function(x) {
    if (!arguments.length) return clip;
    clip = x;
    return path;
  }

  path.area = function(d) {
    return d3_geo_pathType(areaTypes, d);
  };

  path.centroid = function(d) {
    return d3_geo_pathType(centroidTypes, d);
  };

  path.pointRadius = function(x) {
    if (typeof x === "function") pointRadius = x;
    else {
      pointRadius = +x;
      pointCircle = d3_path_circle(pointRadius);
    }
    return path;
  };

  return path;
};

function d3_path_circle(radius) {
  return "m0," + radius
      + "a" + radius + "," + radius + " 0 1,1 0," + (-2 * radius)
      + "a" + radius + "," + radius + " 0 1,1 0," + (+2 * radius)
      + "z";
}

function d3_geo_pathZero() {
  return 0;
}

function d3_geo_pathType(types, o) {
  return o && o.type in types ? types[o.type](o) : "";
}
/**
 * Given a GeoJSON object, returns the corresponding bounding box. The bounding
 * box is represented by a two-dimensional array: [[left, bottom], [right,
 * top]], where left is the minimum longitude, bottom is the minimum latitude,
 * right is maximum longitude, and top is the maximum latitude.
 */
d3.geo.bounds = function(feature) {
  var left = Infinity,
      bottom = Infinity,
      right = -Infinity,
      top = -Infinity;
  d3_geo_bounds(feature, function(x, y) {
    if (x < left) left = x;
    if (x > right) right = x;
    if (y < bottom) bottom = y;
    if (y > top) top = y;
  });
  return [[left, bottom], [right, top]];
};

function d3_geo_bounds(o, f) {
  if (o.type in d3_geo_boundsTypes) d3_geo_boundsTypes[o.type](o, f);
}

var d3_geo_boundsTypes = {
  Feature: d3_geo_boundsFeature,
  FeatureCollection: d3_geo_boundsFeatureCollection,
  LineString: d3_geo_boundsLineString,
  MultiLineString: d3_geo_boundsMultiLineString,
  MultiPoint: d3_geo_boundsLineString,
  MultiPolygon: d3_geo_boundsMultiPolygon,
  Point: d3_geo_boundsPoint,
  Polygon: d3_geo_boundsPolygon
};

function d3_geo_boundsFeature(o, f) {
  d3_geo_bounds(o.geometry, f);
}

function d3_geo_boundsFeatureCollection(o, f) {
  for (var a = o.features, i = 0, n = a.length; i < n; i++) {
    d3_geo_bounds(a[i].geometry, f);
  }
}

function d3_geo_boundsLineString(o, f) {
  for (var a = o.coordinates, i = 0, n = a.length; i < n; i++) {
    f.apply(null, a[i]);
  }
}

function d3_geo_boundsMultiLineString(o, f) {
  for (var a = o.coordinates, i = 0, n = a.length; i < n; i++) {
    for (var b = a[i], j = 0, m = b.length; j < m; j++) {
      f.apply(null, b[j]);
    }
  }
}

function d3_geo_boundsMultiPolygon(o, f) {
  for (var a = o.coordinates, i = 0, n = a.length; i < n; i++) {
    for (var b = a[i][0], j = 0, m = b.length; j < m; j++) {
      f.apply(null, b[j]);
    }
  }
}

function d3_geo_boundsPoint(o, f) {
  f.apply(null, o.coordinates);
}

function d3_geo_boundsPolygon(o, f) {
  for (var a = o.coordinates[0], i = 0, n = a.length; i < n; i++) {
    f.apply(null, a[i]);
  }
}
// From http://williams.best.vwh.net/avform.htm#Intermediate
d3.geo.greatCircle = function() {
  var source = d3_geo_greatCircleSource,
      target = d3_geo_greatCircleTarget,
      coordinates = Object,
      precision = 1,
      radius = d3_geo_earthRadius;
  // TODO: breakAtDateLine?

  function greatCircle(d, i) {
    return d3_geo_greatCirclePath([
      source.call(this, d, i), target.call(this, d, i)], precision);
  }

  greatCircle.coordinates = function(x) {
    if (!arguments.length) return coordinates;
    coordinates = x;
    return greatCircle;
  };

  greatCircle.precision = function(x) {
    if (!arguments.length) return precision;
    precision = +x;
    return greatCircle;
  };

  greatCircle.radius = function(x) {
    if (!arguments.length) return radius;
    radius = +x;
    return greatCircle;
  };

  // Haversine formula for great-circle distance.
  greatCircle.distance = function(d, i) {
    var from = source.call(this, d, i),
        to = target.call(this, d, i),
        x0 = from[0] * d3_radians,
        y0 = from[1] * d3_radians,
        x1 = to[0] * d3_radians,
        y1 = to[1] * d3_radians,
        sy = Math.sin((y1 - y0) / 2),
        sx = Math.sin((x1 - x0) / 2),
        a = sy * sy + Math.cos(y0) * Math.cos(y1) * sx * sx;

    return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  greatCircle.polyline = function(d, i) {
    return d3_geo_greatCirclePath(coordinates.call(this, d, i), precision);
  };

  return greatCircle;
};

function d3_geo_greatCirclePath(coordinates, precision) {
  var m = coordinates.length;
  if (m < 2) return coordinates;

  var i = 0,
      p = precision * d3_radians,
      from = coordinates[0],
      to,
      x0 = from[0] * d3_radians,
      y0 = from[1] * d3_radians,
      cx0 = Math.cos(x0), sx0 = Math.sin(x0),
      cy0 = Math.cos(y0), sy0 = Math.sin(y0),
      path = [from];

  while (++i < m) {
    to = coordinates[i];
    var x1 = to[0] * d3_radians,
        y1 = to[1] * d3_radians,
        cx1 = Math.cos(x1), sx1 = Math.sin(x1),
        cy1 = Math.cos(y1), sy1 = Math.sin(y1),
        d = Math.acos(Math.max(-1, Math.min(1, sy0 * sy1 + cy0 * cy1 * Math.cos(x1 - x0)))),
        sd = Math.sin(d),
        n = Math.ceil(d / p),
        f = d / n,
        e = 0,
        j = 0;

    while (++j < n) {
      e += f;
      var A = Math.sin(d - e) / sd,
          B = Math.sin(e) / sd,
          x = A * cy0 * cx0 + B * cy1 * cx1,
          y = A * cy0 * sx0 + B * cy1 * sx1,
          z = A * sy0       + B * sy1;
      path.push([
        Math.atan2(y, x) / d3_radians,
        Math.atan2(z, Math.sqrt(x * x + y * y)) / d3_radians
      ]);
    }
    path.push(to);
    x0 = x1;
    y0 = y1;
    cx0 = cx1; sx0 = sx1;
    cy0 = cy1; sy0 = sy1;
  }

  return path;
}

function d3_geo_greatCircleSource(d) {
  return d.source;
}

function d3_geo_greatCircleTarget(d) {
  return d.target;
}
d3.geo.clip = function() {
  var origin = [0, 0],
      angle = 90,
      r = d3_geo_earthRadius * angle / 180 * Math.PI,
      coordinates = Object;

  function clip(d, i) {
    var d = coordinates.call(this, d, i),
        o = {source: origin, target: null},
        n = d.length,
        i = -1,
        j,
        path,
        clipped = [],
        p = null,
        q = null;
    while (++i < n) {
      o.target = d[i];
      distance = d3_geo_clipGreatCircle.distance(o);
      if (distance < r) {
        if (q) {
          path = d3_geo_clipGreatCircle({source: q, target: o.target});
          j = d3_geo_clipClosest(path, o, r);
          if (path.length) clipped.push(path[j]);
          p = q = null;
        } else {
          clipped.push(o.target);
        }
      } else {
        q = o.target;
        if (!p && clipped.length) {
          path = d3_geo_clipGreatCircle({source: clipped[clipped.length - 1], target: o.target});
          j = d3_geo_clipClosest(path, o, r);
          if (path.length) clipped.push(path[j]);
          p = o.target;
        }
      }
    }
    if (q && clipped.length) {
      o.target = clipped[0];
      path = d3_geo_clipGreatCircle({source: q, target: o.target});
      j = d3_geo_clipClosest(path, o, r);
      if (path.length) clipped.push(path[j]);
    }
    return clipped;
  }

  clip.coordinates = function(x) {
    if (!arguments.length) return coordinates;
    coordinates = x;
    return clip;
  };

  clip.origin = function(x) {
    if (!arguments.length) return origin;
    origin = x;
    return clip;
  };

  clip.angle = function(x) {
    if (!arguments.length) return angle;
    angle = +x;
    r = d3_geo_earthRadius * angle / 180 * Math.PI;
    return clip;
  };

  return clip;
}

var d3_geo_clipGreatCircle = d3.geo.greatCircle();

function d3_geo_clipClosest(path, o, r) {
  var i = -1,
      n = path.length,
      index = 0,
      best = Infinity;
  while (++i < n) {
    o.target = path[i];
    var d = Math.abs(d3_geo_clipGreatCircle.distance(o) - r);
    if (d < best) {
      best = d;
      index = i;
    }
  }
  o.target = path[index];
  return index;
}
})();
