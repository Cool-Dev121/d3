# D3

**D3** is a small, free JavaScript library for manipulating HTML documents
based on data. D3 can help you quickly visualize your data as HTML or SVG,
handle interactivity, and incorporate smooth transitions and staged animations
into your pages. You can use D3 as a visualization framework (like Protovis),
or you can use it to build dynamic pages (like jQuery).

### Browser Support

D3 should work on any browser, with minimal requirements such as JavaScript
and the [W3C DOM](http://www.w3.org/DOM/) API. By default D3 requires the
[Selectors API](http://www.w3.org/TR/selectors-api/) Level 1, but you can
preload [Sizzle](http://sizzlejs.com/) for compatibility with older browsers.
Some of the included D3 examples use additional browser features, such as
[SVG](http://www.w3.org/TR/SVG/) and [CSS3
Transitions](http://www.w3.org/TR/css3-transitions/). These features are not
required to use D3, but are useful for visualization! D3 is not a
compatibility layer. The examples should work on Firefox, Chrome (Chromium),
Safari (WebKit), Opera and IE9.

Note: Chrome has strict permissions for reading files out of the local file
system. To view some of the examples locally, you will need to start a local web
server. One easy way to do that is to install Tornado:

    cd ..
    git clone https://github.com/facebook/tornado.git
    cd tornado
    sudo python setup.py install
    cd ../d3

We have provided a Tornado script for serving static files:

    python examples

Once this is running, go to: <http://0.0.0.0:8888/examples/index.html>
