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
/*global define: true, require: true, describe: true, beforeEach: true, afterEach: true, it: true */

var expect = require('chai').expect,
    svgOMGI = require("../svgOMGeneratorImage.js"),
    sinon = require('sinon');

describe('svgOMGeneratorImage', function () {
    
    var sandbox = sinon.sandbox.create();
    
    beforeEach(function () {
    });
    
    afterEach(function () {
        sandbox.restore();
    });
    
    
    it("can survive sparse data", function () {
        
        sandbox.stub(console, "log");
        
        var fnCallback = sinon.stub();
        
        expect(svgOMGI.pathComponentOrigin({}, fnCallback)).to.equal(false);
        expect(fnCallback.callCount).to.equal(0);
        
        expect(svgOMGI.addImageData({}, {})).to.equal(false);
        expect(console.log.calledOnce).to.equal(true);
    });

});
