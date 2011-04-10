// Node-link tree diagram using the Reingold-Tilford "tidy" algorithm
d3.layout.tree = function() {
  var hierarchy = d3.layout.hierarchy(),
      separation = d3_layout_treeSeparation,
      size = [1, 1]; // width, height

  function tree(d, i) {
    var nodes = hierarchy.call(this, d, i),
        root = nodes[0],
        x0 = 0, // min breadth
        x1 = 0, // max breadth
        y1 = 0; // max depth

    function firstWalk(node, previousSibling) {
      var children = node.children;
      if (!children) {
        if (previousSibling) {
          node.prelim = previousSibling.prelim + separation(node, previousSibling);
        }
      } else {
        var n = children.length,
            firstChild = children[0],
            lastChild = children[n - 1],
            ancestor = firstChild,
            previousChild,
            child,
            i = -1;
        while (++i < n) {
          child = children[i];
          firstWalk(child, previousChild);
          ancestor = apportion(child, previousChild, ancestor);
          previousChild = child;
        }
        d3_layout_treeShift(node);
        var midpoint = .5 * (firstChild.prelim + lastChild.prelim);
        if (previousSibling) {
          node.prelim = previousSibling.prelim + separation(node, previousSibling);
          node.mod = node.prelim - midpoint;
        } else {
          node.prelim = midpoint;
        }
      }
    }

    function secondWalk(node, x, y) {
      node.breadth = node.prelim + x;
      var children = node.children;
      if (children) {
        var i = -1,
            n = children.length;
        x += node.mod;
        y += 1;
        while (++i < n) {
          secondWalk(children[i], x, y);
        }
      }

      if (node.breadth < x0) x0 = node.breadth;
      if (node.breadth > x1) x1 = node.breadth;
      if (y > y1) y1 = y;
    }

    function apportion(node, previousSibling, ancestor) {
      if (previousSibling) {
        var vip = node,
            vop = node,
            vim = previousSibling,
            vom = node.parent.children[0],
            sip = vip.mod,
            sop = vop.mod,
            sim = vim.mod,
            som = vom.mod,
            shift;
        while (vim = d3_tree_layoutRight(vim), vip = d3_tree_layoutLeft(vip), vim && vip) {
          vom = d3_tree_layoutLeft(vom);
          vop = d3_tree_layoutRight(vop);
          vop.ancestor = node;
          shift = vim.prelim + sim - vip.prelim - sip + separation(vim, vip);
          if (shift > 0) {
            d3_layout_treeMove(d3_layout_treeAncestor(vim, node, ancestor), node, shift);
            sip += shift;
            sop += shift;
          }
          sim += vim.mod;
          sip += vip.mod;
          som += vom.mod;
          sop += vop.mod;
        }
        if (vim && !d3_tree_layoutRight(vop)) {
          vop.thread = vim;
          vop.mod += sim - sop;
        }
        if (vip && !d3_tree_layoutLeft(vom)) {
          vom.thread = vip;
          vom.mod += sip - som;
          ancestor = node;
        }
      }
      return ancestor;
    }

    // Initialize temporary layout variables. TODO store separately?
    d3_layout_treeVisitAfter(root, function(v, vl, i) {
      v.ancestor = v;
      v.prelim = 0;
      v.mod = 0;
      v.change = 0;
      v.shift = 0;
      v.number = vl ? vl.number + 1 : 0;
      v.depth = i;
    });

    // Compute the layout using Buchheim et al.'s algorithm.
    firstWalk(root);
    secondWalk(root, -root.prelim, 0);

    // Clear temporary layout variables; transform depth and breadth.
    d3_layout_treeVisitAfter(root, function(v) {
      v.x = ((v.breadth - x0) / (x1 - x0)) * size[0];
      v.y = v.depth / y1 * size[1];
      delete v.breadth;
      delete v.depth;
      delete v.ancestor;
      delete v.prelim;
      delete v.mod;
      delete v.change;
      delete v.shift;
      delete v.number;
      delete v.thread;
    });

    return nodes;
  }

  tree.sort = d3.rebind(tree, hierarchy.sort);
  tree.children = d3.rebind(tree, hierarchy.children);

  tree.separation = function(x) {
    if (!arguments.length) return separation;
    separation = x;
    return tree;
  };

  tree.size = function(x) {
    if (!arguments.length) return size;
    size = x;
    return tree;
  };

  return tree;
};

function d3_layout_treeSeparation(a, b) {
  return a.parent == b.parent ? 1 : 2;
}

// function d3_layout_treeSeparationRadial(a, b) {
//   return (a.parent == b.parent ? 1 : 2) / a.depth;
// }

function d3_tree_layoutLeft(node) {
  return node.children ? node.children[0] : node.thread;
}

function d3_tree_layoutRight(node) {
  return node.children ? node.children[node.children.length - 1] : node.thread;
}

function d3_layout_treeVisitAfter(node, callback) {
  function visit(node, previousSibling, depth) {
    var children = node.children;
    if (children) {
      var child,
          previousChild = null,
          i = -1,
          n = children.length;
      while (++i < n) {
        child = children[i];
        visit(child, previousChild, depth + 1);
        previousChild = child;
      }
    }
    callback(node, previousSibling, depth);
  }
  visit(node, null, 0);
}

function d3_layout_treeShift(node) {
  var shift = 0,
      change = 0,
      children = node.children,
      i = children.length,
      child;
  while (--i >= 0) {
    child = children[i];
    child.prelim += shift;
    child.mod += shift;
    shift += child.shift + (change += child.change);
  }
}

function d3_layout_treeMove(ancestor, node, shift) {
  var subtrees = node.number - ancestor.number;
  node.change -= shift / subtrees;
  node.shift += shift;
  ancestor.change += shift / subtrees;
  node.prelim += shift;
  node.mod += shift;
}

function d3_layout_treeAncestor(vim, node, ancestor) {
  return vim.ancestor.parent == node.parent ? vim.ancestor : ancestor;
}
