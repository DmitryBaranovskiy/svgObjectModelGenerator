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
/*global define: true, require: true, module: true */

/* Help construct the svgOM */

(function () {
"use strict";

	function SVGOMWriter() {
        
		var _root = {
                children: []
		    },
            _currentNodeStack = [];
        
        this.peekCurrent = function () {
            if (_currentNodeStack.length > 0) {
                return _currentNodeStack[_currentNodeStack.length - 1];
            }
            return null;
        };
        this.pushCurrent = function(oNode) {
            _currentNodeStack.push(oNode);
        };
        this.popCurrent = function () {
            _currentNodeStack.pop();
        };
        this.pushCurrent(_root);
        
        this.setDocOffset = function (offX, offY) {
            _root.offsetX = offX;
            _root.offsetY = offY;
        };
        
        this.setDocViewBox = function (bounds) {
            _root.viewBox = bounds;
        };

        this.setDocPxToInchRatio = function (pxToInchRatio) {
            _root.pxToInchRatio = pxToInchRatio;
        };

        this.setDocGlobalLight = function (globalLight) {
            _root.globalLight = globalLight;
        };

		this.addSVGNode = function (nodeID, nodeType, nodeVisible) {
			var n = {
				id: nodeID,
                type: nodeType,
                visible: nodeVisible,
				style: {},
                children: []
			};
            this.peekCurrent().children.push(n);
			return n;
		};

		this.addFontRule = function() {
			var r = {
				"rule-type": "font",
				"style": {}
			};
            
            //Undefined... comment out until this is wired in
            //_appendRule(r);

			return r.style;
		};
        
		
		this.toSVGOM = function() {
			return _root;
		};
	}

	module.exports = SVGOMWriter;
    
}());