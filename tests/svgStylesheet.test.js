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
    svgStylesheet = require("../svgStylesheet.js"),
    sinon = require('sinon');

describe('svgStylesheet', function () {
    
    describe('our SVG stylesheet', function () {
        
        it("knows whether it has rules to write", function () {
            
            var sheet = new svgStylesheet(),
                styleBlock;
            
            expect(sheet.hasRules()).to.equal(false);
            
            styleBlock = sheet.getStyleBlock({className: "clsTest" });
            styleBlock.addRule("fill", "#ed3ecc");
            
            expect(sheet.hasRules()).to.equal(true);
        });
        
        
        it("knows whether it has defines to write", function () {
            var sheet = new svgStylesheet(),
                defn;
            
            expect(sheet.hasDefines()).to.equal(false);
            
            sheet.define("defineable-type", "ele-id", "defineable-type-1", "<filter id=\"defineable-type-1\"></filter>", "{className: \"clsTest\" }");
            
            expect(sheet.hasDefines()).to.equal(true);
            
            defn = sheet.getDefine("ele-id", "defineable-type");
            expect(defn === null).to.equal(false);
            defn.written = true;
            expect(sheet.hasDefines()).to.equal(false);
        });
        
        it("combines like defines", function () {
            var sheet = new svgStylesheet(),
                defn;
            
            expect(sheet.hasDefines()).to.equal(false);
            
            sheet.define("defineable-type", "ele-id", "defineable-type-1", "<filter id=\"defineable-type-1\"></filter>", "fingerprint");
            sheet.define("defineable-type", "ele-id2", "defineable-type-2", "<filter id=\"defineable-type-2\"></filter>", "fingerprint");
            
            sheet.consolidateDefines();
            
            expect(sheet.hasDefines()).to.equal(true);
            
            expect(sheet.getDefine("ele-id", "defineable-type").out).to.equal(sheet.getDefine("ele-id2", "defineable-type").out);
            
        });
        
        
        
    });
});
