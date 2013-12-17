// Generated by CoffeeScript 1.6.3
var JsImage, b_exp, colorify, colormap, colormap1, createContext, drawScene, g_exp, generateShader, get_channels, glHandleOnChangeFile, glHandleOnClickColor, glHandleOnClickDownload, glHandleOnClickGrey, glHandleOnClickNdvi, glHandleOnClickNir, glHandleOnClickRaw, glHandleOnLoadTexture, glHandleOnSlide, glHandleOnSubmitInfra, glHandleOnSubmitInfraHsv, glHandleOnSubmitInfraMono, glInitInfragram, glSetMode, greyscale_colormap, histogram, hsv2rgb, image, imgContext, infragrammar, initBuffers, initShaders, jsHandleOnChangeFile, jsHandleOnClickColor, jsHandleOnClickDownload, jsHandleOnClickGrey, jsHandleOnClickNdvi, jsHandleOnClickNir, jsHandleOnClickRaw, jsHandleOnSlide, jsHandleOnSubmitInfra, jsHandleOnSubmitInfraHsv, jsHandleOnSubmitInfraMono, m_exp, mapContext, mode, ndvi, r_exp, render, rgb2hsv, save_expressions, save_expressions_hsv, segmented_colormap, set_mode, update, update_colorbar, webGlSupported,
  _this = this;

image = null;

mode = "raw";

r_exp = "";

g_exp = "";

b_exp = "";

m_exp = "";

JsImage = (function() {
  function JsImage(data, width, height, channels) {
    this.data = data;
    this.width = width;
    this.height = height;
    this.channels = channels;
  }

  JsImage.prototype.copyToImageData = function(imgData) {
    return imgData.data.set(this.data);
  };

  JsImage.prototype.extrema = function() {
    var c, i, j, maxs, mins, n, _i, _j, _ref;
    n = this.width * this.height;
    mins = (function() {
      var _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = this.channels; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        _results.push(this.data[i]);
      }
      return _results;
    }).call(this);
    maxs = (function() {
      var _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = this.channels; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        _results.push(this.data[i]);
      }
      return _results;
    }).call(this);
    j = 0;
    for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
      for (c = _j = 0, _ref = this.channels; 0 <= _ref ? _j < _ref : _j > _ref; c = 0 <= _ref ? ++_j : --_j) {
        if (this.data[j] > maxs[c]) {
          maxs[c] = this.data[j];
        }
        if (this.data[j] < mins[c]) {
          mins[c] = this.data[j];
        }
        j++;
      }
    }
    return [mins, maxs];
  };

  return JsImage;

})();

histogram = function(array, _arg, nbins) {
  var a, bins, d, i, max, min, _i, _len;
  min = _arg[0], max = _arg[1];
  bins = (function() {
    var _i, _results;
    _results = [];
    for (i = _i = 0; 0 <= nbins ? _i < nbins : _i > nbins; i = 0 <= nbins ? ++_i : --_i) {
      _results.push(0);
    }
    return _results;
  })();
  d = (max - min) / nbins;
  for (_i = 0, _len = array.length; _i < _len; _i++) {
    a = array[_i];
    i = Math.floor((a - min) / d);
    if ((0 <= i && i < nbins)) {
      bins[i]++;
    }
  }
  return bins;
};

segmented_colormap = function(segments) {
  return function(x) {
    var i, result, x0, x1, xstart, y0, y1, _i, _j, _len, _ref, _ref1, _ref2, _ref3;
    _ref = [0, 0], y0 = _ref[0], y1 = _ref[1];
    _ref1 = [segments[0][0], 1], x0 = _ref1[0], x1 = _ref1[1];
    if (x < x0) {
      return y0;
    }
    for (i = _i = 0, _len = segments.length; _i < _len; i = ++_i) {
      _ref2 = segments[i], xstart = _ref2[0], y0 = _ref2[1], y1 = _ref2[2];
      x0 = xstart;
      if (i === segments.length - 1) {
        x1 = 1;
        break;
      }
      x1 = segments[i + 1][0];
      if ((xstart <= x && x < x1)) {
        break;
      }
    }
    result = [];
    for (i = _j = 0, _ref3 = y0.length; 0 <= _ref3 ? _j < _ref3 : _j > _ref3; i = 0 <= _ref3 ? ++_j : --_j) {
      result[i] = (x - x0) / (x1 - x0) * (y1[i] - y0[i]) + y0[i];
    }
    return result;
  };
};

get_channels = function(img) {
  var b, g, i, mkImage, n, r, _i;
  n = img.width * img.height;
  r = new Float32Array(n);
  g = new Float32Array(n);
  b = new Float32Array(n);
  for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
    r[i] = img.data[4 * i + 0];
    g[i] = img.data[4 * i + 1];
    b[i] = img.data[4 * i + 2];
  }
  mkImage = function(d) {
    return new JsImage(d, img.width, img.height, 1);
  };
  return [mkImage(r), mkImage(g), mkImage(b)];
};

ndvi = function(nir, vis) {
  var d, i, n, _i;
  n = nir.width * nir.height;
  d = new Float64Array(n);
  for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
    d[i] = (nir.data[i] - vis.data[i]) / (nir.data[i] + vis.data[i]);
  }
  return new JsImage(d, nir.width, nir.height, 1);
};

colorify = function(img, colormap) {
  var b, cimg, data, g, i, j, n, r, _i, _ref;
  n = img.width * img.height;
  data = new Uint8ClampedArray(4 * n);
  j = 0;
  for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
    _ref = colormap(img.data[i]), r = _ref[0], g = _ref[1], b = _ref[2];
    data[j++] = r;
    data[j++] = g;
    data[j++] = b;
    data[j++] = 255;
  }
  cimg = new JsImage();
  cimg.width = img.width;
  cimg.height = img.height;
  cimg.data = data;
  return new JsImage(data, img.width, img.height, 4);
};

infragrammar = function(img) {
  var b, g, i, n, o, r, _i;
  n = img.width * img.height;
  r = new Float32Array(n);
  g = new Float32Array(n);
  b = new Float32Array(n);
  o = new Float64Array(4 * n);
  for (i = _i = 0; 0 <= n ? _i < n : _i > n; i = 0 <= n ? ++_i : --_i) {
    r[i] = img.data[4 * i + 0] / 255;
    g[i] = img.data[4 * i + 1] / 255;
    b[i] = img.data[4 * i + 2] / 255;
    o[4 * i + 0] = 255 * r_exp(r[i], g[i], b[i]);
    o[4 * i + 1] = 255 * g_exp(r[i], g[i], b[i]);
    o[4 * i + 2] = 255 * b_exp(r[i], g[i], b[i]);
    o[4 * i + 3] = 255;
  }
  return new JsImage(o, img.width, img.height, 4);
};

render = function(img) {
  var ctx, d, e;
  e = document.getElementById("image");
  e.width = img.width;
  e.height = img.height;
  ctx = e.getContext("2d");
  d = ctx.getImageData(0, 0, img.width, img.height);
  img.copyToImageData(d);
  return ctx.putImageData(d, 0, 0);
};

greyscale_colormap = segmented_colormap([[0, [0, 0, 0], [255, 255, 255]], [1, [255, 255, 255], [255, 255, 255]]]);

colormap1 = segmented_colormap([[0, [0, 0, 255], [38, 195, 195]], [0.5, [0, 150, 0], [255, 255, 0]], [0.75, [255, 255, 0], [255, 50, 50]]]);

colormap = greyscale_colormap;

update_colorbar = function(min, max) {
  var b, ctx, d, e, g, i, j, k, r, _i, _j, _ref, _ref1, _ref2;
  $('#colorbar-container')[0].style.display = 'inline-block';
  e = $('#colorbar')[0];
  ctx = e.getContext("2d");
  d = ctx.getImageData(0, 0, e.width, e.height);
  for (i = _i = 0, _ref = e.width; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
    for (j = _j = 0, _ref1 = e.height; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
      _ref2 = colormap(i / e.width), r = _ref2[0], g = _ref2[1], b = _ref2[2];
      k = 4 * (i + j * e.width);
      d.data[k + 0] = r;
      d.data[k + 1] = g;
      d.data[k + 2] = b;
      d.data[k + 3] = 255;
    }
  }
  ctx.putImageData(d, 0, 0);
  $("#colorbar-min")[0].textContent = min.toFixed(2);
  return $("#colorbar-max")[0].textContent = max.toFixed(2);
};

update = function(img) {
  var b, g, max, min, ndvi_img, normalize, r, result, _ref, _ref1;
  $('#colorbar-container')[0].style.display = 'none';
  if (mode === "ndvi") {
    _ref = get_channels(img), r = _ref[0], g = _ref[1], b = _ref[2];
    ndvi_img = ndvi(r, b);
    min = -1;
    max = 1;
    normalize = function(x) {
      return (x - min) / (max - min);
    };
    result = colorify(ndvi_img, function(x) {
      return colormap(normalize(x));
    });
    update_colorbar(min, max);
  } else if (mode === "raw") {
    result = img;
  } else if (mode === "nir") {
    _ref1 = get_channels(img), r = _ref1[0], g = _ref1[1], b = _ref1[2];
    result = colorify(r, function(x) {
      return [x, x, x];
    });
  } else {
    result = infragrammar(img);
  }
  $('#download').show();
  return render(result);
};

save_expressions = function(r, g, b) {
  r = r.toUpperCase().replace(/X/g, $('#slider').val() / 100);
  g = g.toUpperCase().replace(/X/g, $('#slider').val() / 100);
  b = b.toUpperCase().replace(/X/g, $('#slider').val() / 100);
  if (r === "") {
    r = "R";
  }
  if (g === "") {
    g = "G";
  }
  if (b === "") {
    b = "B";
  }
  eval("r_exp = function(R,G,B){return " + r + ";}");
  eval("g_exp = function(R,G,B){return " + g + ";}");
  return eval("b_exp = function(R,G,B){return " + b + ";}");
};

save_expressions_hsv = function(h, s, v) {
  h = h.toUpperCase().replace(/X/g, $('#slider').val() / 100);
  s = s.toUpperCase().replace(/X/g, $('#slider').val() / 100);
  v = v.toUpperCase().replace(/X/g, $('#slider').val() / 100);
  if (h === "") {
    h = "H";
  }
  if (s === "") {
    s = "S";
  }
  if (v === "") {
    v = "V";
  }
  eval("r_exp = function(R,G,B){var hsv = rgb2hsv(R, G, B), H = hsv[0], S = hsv[1], V = hsv[2]; return hsv2rgb(" + h + "," + s + "," + v + ")[0];}");
  eval("g_exp = function(R,G,B){var hsv = rgb2hsv(R, G, B), H = hsv[0], S = hsv[1], V = hsv[2]; return hsv2rgb(" + h + "," + s + "," + v + ")[1];}");
  return eval("b_exp = function(R,G,B){var hsv = rgb2hsv(R, G, B), H = hsv[0], S = hsv[1], V = hsv[2]; return hsv2rgb(" + h + "," + s + "," + v + ")[2];}");
};

hsv2rgb = function(h, s, v) {
  var data, f, i, p, q, rgb, t;
  data = [];
  if (s === 0) {
    rgb = [v, v, v];
  } else {
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    data = [v * (1 - s), v * (1 - s * (h - i)), v * (1 - s * (1 - (h - i)))];
    switch (i) {
      case 0:
        rgb = [v, t, p];
        break;
      case 1:
        rgb = [q, v, p];
        break;
      case 2:
        rgb = [p, v, t];
        break;
      case 3:
        rgb = [p, q, v];
        break;
      case 4:
        rgb = [t, p, v];
        break;
      default:
        rgb = [v, p, q];
    }
  }
  return rgb;
};

rgb2hsv = function(r, g, b) {
  var d, h, max, min, s, v;
  max = Math.max(r, g, b);
  min = Math.min(r, g, b);
  h = s = v = max;
  d = max - min;
  s = max === 0 ? 0 : d / max;
  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return [h, s, v];
};

set_mode = function(new_mode) {
  mode = new_mode;
  update(image);
  if (mode === "ndvi") {
    return $("#colormaps-group")[0].style.display = "inline-block";
  } else {
    return $("#colormaps-group")[0].style.display = "none";
  }
};

jsHandleOnChangeFile = function(files) {
  var file, file_reader;
  if (files && files[0]) {
    file = files[0];
    file_reader = new FileReader();
    file_reader.onload = function(oFREvent) {
      var d, data, img, jpeg, png;
      data = new Uint8Array(file_reader.result);
      if (file.type === "image/png") {
        png = new PNG(data);
        data = png.decode();
        img = new JsImage(data, png.width, png.height);
      } else if (file.type === "image/jpeg") {
        jpeg = new JpegImage();
        jpeg.parse(data);
        d = new Uint8ClampedArray(4 * jpeg.width * jpeg.height);
        img = new JsImage(d, jpeg.width, jpeg.height, 4);
        jpeg.copyToImageData(img);
      } else {
        document.getElementById("error").html = "Unrecognized file format (supports PNG and JPEG)";
        return;
      }
      image = img;
      return update(img);
    };
    return file_reader.readAsArrayBuffer(file);
  }
};

jsHandleOnClickRaw = function() {
  return set_mode("raw");
};

jsHandleOnClickNdvi = function() {
  return set_mode("ndvi");
};

jsHandleOnClickNir = function() {
  return set_mode("nir");
};

jsHandleOnClickDownload = function() {
  var ctx, e, event, lnk;
  e = document.getElementById("image");
  ctx = e.getContext("2d");
  lnk = document.createElement("a");
  lnk.download = (new Date()).toISOString().replace(/:/g, "_") + ".png";
  lnk.href = ctx.canvas.toDataURL("image/png");
  if (document.createEvent) {
    event = document.createEvent("MouseEvents");
    event.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    return lnk.dispatchEvent(event);
  } else if (lnk.fireEvent) {
    return lnk.fireEvent("onclick");
  }
};

jsHandleOnSubmitInfraHsv = function() {
  save_expressions_hsv($('#h_exp').val(), $('#s_exp').val(), $('#v_exp').val());
  return set_mode("infragrammar_hsv");
};

jsHandleOnSubmitInfra = function() {
  save_expressions($('#r_exp').val(), $('#g_exp').val(), $('#b_exp').val());
  return set_mode("infragrammar");
};

jsHandleOnSubmitInfraMono = function() {
  save_expressions($('#m_exp').val(), $('#m_exp').val(), $('#m_exp').val());
  return set_mode("infragrammar_mono");
};

jsHandleOnClickGrey = function() {
  colormap = greyscale_colormap;
  return update(image);
};

jsHandleOnClickColor = function() {
  colormap = colormap1;
  return update(image);
};

jsHandleOnSlide = function(event) {
  if (mode === "infragrammar") {
    save_expressions($('#r_exp').val(), $('#g_exp').val(), $('#b_exp').val());
  } else if (mode === "infragrammar_hsv") {
    save_expressions_hsv($('#h_exp').val(), $('#s_exp').val(), $('#v_exp').val());
  } else {
    save_expressions($('#m_exp').val(), $('#m_exp').val(), $('#m_exp').val());
  }
  return update(image);
};

imgContext = null;

mapContext = null;

initBuffers = function(ctx) {
  var gl, textureCoords, vertices;
  gl = ctx.gl;
  ctx.vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, ctx.vertexBuffer);
  vertices = [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  ctx.vertexBuffer.itemSize = 2;
  ctx.textureBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, ctx.textureBuffer);
  textureCoords = [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 1.0];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
  return ctx.textureBuffer.itemSize = 2;
};

createContext = function(mode, greyscale, colormap, slider, canvasName) {
  var ctx;
  ctx = new Object();
  ctx.mode = mode;
  ctx.greyscale = greyscale;
  ctx.colormap = colormap;
  ctx.slider = slider;
  ctx.canvas = document.getElementById(canvasName);
  ctx.gl = getWebGLContext(ctx.canvas);
  if (ctx.gl) {
    initBuffers(ctx);
    return ctx;
  } else {
    return null;
  }
};

initShaders = function(ctx) {
  var gl;
  gl = ctx.gl;
  ctx.shaderProgram = createProgramFromScripts(gl, ["shader-vs", "shader-fs"]);
  gl.useProgram(ctx.shaderProgram);
  ctx.shaderProgram.vertexPositionAttribute = gl.getAttribLocation(ctx.shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(ctx.shaderProgram.vertexPositionAttribute);
  ctx.shaderProgram.textureCoordAttribute = gl.getAttribLocation(ctx.shaderProgram, "aTextureCoord");
  return gl.enableVertexAttribArray(ctx.shaderProgram.textureCoordAttribute);
};

drawScene = function(ctx, returnImage) {
  var gl, pColormap, pGreyscaleUniform, pHsvUniform, pNdviUniform, pSliderUniform;
  gl = ctx.gl;
  gl.bindBuffer(gl.ARRAY_BUFFER, ctx.vertexBuffer);
  gl.vertexAttribPointer(ctx.shaderProgram.vertexPositionAttribute, ctx.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, ctx.textureBuffer);
  gl.vertexAttribPointer(ctx.shaderProgram.textureCoordAttribute, ctx.textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
  pSliderUniform = gl.getUniformLocation(ctx.shaderProgram, "uSlider");
  gl.uniform1f(pSliderUniform, ctx.slider);
  pNdviUniform = gl.getUniformLocation(ctx.shaderProgram, "uNdvi");
  gl.uniform1f(pNdviUniform, (ctx.mode === "ndvi" ? 1.0 : 0.0));
  pGreyscaleUniform = gl.getUniformLocation(ctx.shaderProgram, "uGreyscale");
  gl.uniform1f(pGreyscaleUniform, (ctx.greyscale ? 1.0 : 0.0));
  pHsvUniform = gl.getUniformLocation(ctx.shaderProgram, "uHsv");
  gl.uniform1f(pHsvUniform, (ctx.mode === "hsv" ? 1.0 : 0.0));
  pColormap = gl.getUniformLocation(ctx.shaderProgram, "uColormap");
  gl.uniform1f(pColormap, (ctx.colormap ? 1.0 : 0.0));
  gl.drawArrays(gl.TRIANGLES, 0, 6);
  if (returnImage) {
    return ctx.canvas.toDataURL("image/png");
  }
};

generateShader = function(ctx, r, g, b) {
  var code;
  r = r.toLowerCase().replace(/h/g, "r").replace(/s/g, "g").replace(/v/g, "b");
  g = g.toLowerCase().replace(/h/g, "r").replace(/s/g, "g").replace(/v/g, "b");
  b = b.toLowerCase().replace(/h/g, "r").replace(/s/g, "g").replace(/v/g, "b");
  r = r.replace(/[^xrgb\/\-\+\*\(\)\.0-9]*/g, "");
  g = g.replace(/[^xrgb\/\-\+\*\(\)\.0-9]*/g, "");
  b = b.replace(/[^xrgb\/\-\+\*\(\)\.0-9]*/g, "");
  r = r.replace(/([0-9])([^\.])?/g, "$1.0$2");
  g = g.replace(/([0-9])([^\.])?/g, "$1.0$2");
  b = b.replace(/([0-9])([^\.])?/g, "$1.0$2");
  if (r === "") {
    r = "r";
  }
  if (g === "") {
    g = "g";
  }
  if (b === "") {
    b = "b";
  }
  code = $("#shader-fs-template").html();
  code = code.replace(/@1@/g, r);
  code = code.replace(/@2@/g, g);
  code = code.replace(/@3@/g, b);
  $("#shader-fs").html(code);
  return initShaders(ctx);
};

glSetMode = function(ctx, newMode) {
  ctx.mode = newMode;
  $("#download").show();
  if (ctx.mode === "ndvi") {
    $("#colorbar-container")[0].style.display = "inline-block";
    return $("#colormaps-group")[0].style.display = "inline-block";
  } else {
    $("#colorbar-container")[0].style.display = "none";
    return $("#colormaps-group")[0].style.display = "none";
  }
};

glHandleOnLoadTexture = function(ctx, imageData) {
  var gl, texImage;
  gl = ctx.gl;
  texImage = new Image();
  texImage.onload = function(event) {
    var texture;
    texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, event.target);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    return drawScene(ctx);
  };
  return texImage.src = imageData;
};

glInitInfragram = function() {
  imgContext = createContext("raw", true, false, 1.0, "image");
  if (imgContext) {
    $("#shader-vs").load("shader.vert");
    $("#shader-fs-template").load("shader.frag");
    mapContext = createContext("ndvi", true, true, 1.0, "colorbar");
  }
  if (imgContext && mapContext) {
    return true;
  } else {
    return false;
  }
};

glHandleOnChangeFile = function(files) {
  var reader;
  if (files && files[0]) {
    reader = new FileReader();
    reader.onload = function(eventObject) {
      glSetMode(imgContext, "raw");
      generateShader(imgContext, "r", "g", "b");
      glHandleOnLoadTexture(imgContext, eventObject.target.result);
      return generateShader(mapContext, "r", "g", "b");
    };
    return reader.readAsDataURL(files[0]);
  }
};

glHandleOnClickRaw = function() {
  glSetMode(imgContext, "raw");
  generateShader(imgContext, "r", "g", "b");
  return drawScene(imgContext);
};

glHandleOnClickNdvi = function() {
  glSetMode(imgContext, "ndvi");
  generateShader(imgContext, "(((r-b)/(r+b))+1)/2", "(((r-b)/(r+b))+1)/2", "(((r-b)/(r+b))+1)/2");
  drawScene(imgContext);
  return drawScene(mapContext);
};

glHandleOnClickNir = function() {
  glSetMode(imgContext, "nir");
  generateShader(imgContext, "r", "r", "r");
  return drawScene(imgContext);
};

glHandleOnClickDownload = function() {
  var event, lnk;
  lnk = document.createElement("a");
  lnk.download = (new Date()).toISOString().replace(/:/g, "_") + ".png";
  lnk.href = drawScene(imgContext, true);
  if (document.createEvent) {
    event = document.createEvent("MouseEvents");
    event.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    return lnk.dispatchEvent(event);
  } else if (lnk.fireEvent) {
    return lnk.fireEvent("onclick");
  }
};

glHandleOnSubmitInfraHsv = function() {
  glSetMode(imgContext, "hsv");
  generateShader(imgContext, $("#h_exp").val(), $("#s_exp").val(), $("#v_exp").val());
  return drawScene(imgContext);
};

glHandleOnSubmitInfra = function() {
  glSetMode(imgContext, "rgb");
  generateShader(imgContext, $("#r_exp").val(), $("#g_exp").val(), $("#b_exp").val());
  return drawScene(imgContext);
};

glHandleOnSubmitInfraMono = function() {
  glSetMode(imgContext, "mono");
  generateShader(imgContext, $("#m_exp").val(), $("#m_exp").val(), $("#m_exp").val());
  return drawScene(imgContext);
};

glHandleOnClickGrey = function() {
  imgContext.greyscale = true;
  drawScene(imgContext);
  mapContext.greyscale = true;
  return drawScene(mapContext);
};

glHandleOnClickColor = function() {
  imgContext.greyscale = false;
  drawScene(imgContext);
  mapContext.greyscale = false;
  return drawScene(mapContext);
};

glHandleOnSlide = function(event) {
  imgContext.slider = event.value / 100.0;
  return drawScene(imgContext);
};

webGlSupported = false;

$(document).ready(function() {
  $("#image-container").ready(function() {
    return webGlSupported = glInitInfragram();
  });
  $("#file-sel").change(function() {
    if (webGlSupported) {
      return glHandleOnChangeFile(this.files);
    } else {
      return jsHandleOnChangeFile(this.files);
    }
  });
  $("button#raw").click(function() {
    if (webGlSupported) {
      return glHandleOnClickRaw();
    } else {
      return jsHandleOnClickRaw();
    }
  });
  $("button#ndvi").click(function() {
    if (webGlSupported) {
      return glHandleOnClickNdvi();
    } else {
      return jsHandleOnClickNdvi();
    }
  });
  $("button#nir").click(function() {
    if (webGlSupported) {
      return glHandleOnClickNir();
    } else {
      return jsHandleOnClickNir();
    }
  });
  $("#download").click(function() {
    if (webGlSupported) {
      return glHandleOnClickDownload();
    } else {
      return jsHandleOnClickDownload();
    }
  });
  $("#infragrammar_hsv").submit(function() {
    if (webGlSupported) {
      return glHandleOnSubmitInfraHsv();
    } else {
      return jsHandleOnSubmitInfraHsv();
    }
  });
  $("#infragrammar").submit(function() {
    if (webGlSupported) {
      return glHandleOnSubmitInfra();
    } else {
      return jsHandleOnSubmitInfra();
    }
  });
  $("#infragrammar_mono").submit(function() {
    if (webGlSupported) {
      return glHandleOnSubmitInfraMono();
    } else {
      return jsHandleOnSubmitInfraMono();
    }
  });
  $("button#grey").click(function() {
    if (webGlSupported) {
      return glHandleOnClickGrey();
    } else {
      return jsHandleOnClickGrey();
    }
  });
  $("button#color").click(function() {
    if (webGlSupported) {
      return glHandleOnClickColor();
    } else {
      return jsHandleOnClickColor();
    }
  });
  return $("#slider").slider().on("slide", function(event) {
    if (webGlSupported) {
      return glHandleOnSlide(event);
    } else {
      return jsHandleOnSlide(event);
    }
  });
});
