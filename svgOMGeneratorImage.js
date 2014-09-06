// Copyright (c) 2014 Adobe Systems Incorporated. All rights reserved.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, bitwise: true */
/*global define: true, require: true */

/* Help construct the svgOM */

(function () {
"use strict";

    var omgStyles = require("./svgOMGeneratorStyles.js");

	function SVGOMGeneratorImage() {

        this.pathComponentOrigin = function (layer, fn) {
            if (layer.rawPixel) {
                return fn(layer.rawPixel);
            }
            return false;
        };

        this.addImage = function (svgNode, layer) {
            return this.pathComponentOrigin(layer, function (pixel) {
                svgNode.pixel = pixel;
                svgNode.shapeBounds = layer.bounds;

                omgStyles.addStylingData(svgNode, layer);
                
                return true;
            });
        };

        this.addImageData = function(svgNode, layer) {
            if (this.addImage(svgNode, layer)) {
                return true;
            }
            console.log("ERROR: No image data added for " + JSON.stringify(layer));
            return false;
        };
	}

	module.exports = new SVGOMGeneratorImage();

}());
