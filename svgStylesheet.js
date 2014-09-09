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
/*global define: true, module: true, require: true */

/* Part of the write context, built up during preprocessing */

(function () {
    "use strict";
    
    var svgWriterUtils = require("./svgWriterUtils.js"),
        svgWriterIDs = require("./svgWriterIDs.js");
    
    var write = svgWriterUtils.write,
        indent = svgWriterUtils.indent,
        undent = svgWriterUtils.undent,
        writeColor = svgWriterUtils.writeColor,
        indentify = svgWriterUtils.indentify;
    
    var ONLY_EXTERNALIZE_CONSOLIDATED = false;
    
    function CSSStyleRule(prop, val) {
        this.propertyName = prop;
        this.value = val;
        
        this.write = function (ctx) {
            write(ctx, ctx.currentIndent + this.propertyName + ": " + this.value + ";" + ctx.terminator);
        };
    }
    
    function CSSStyleBlock(cls) {
        this.class = cls;
        this.rules = [];
        this.elements = [];
        
        this.addRule = function (prop, val) {
            this.rules.push(new CSSStyleRule(prop, val));
        };
        
        this.hasRules = function () {
            return (this.rules.length > 0);
        };
        
        this.write = function (ctx) {
            var i;
            
            write(ctx, ctx.currentIndent + "." + this.class + " {" + ctx.terminator);
            indent(ctx);
            
            for (i = 0; i < this.rules.length; i++) {
                this.rules[i].write(ctx);
            }
            
            undent(ctx);
            write(ctx, ctx.currentIndent + "}" + ctx.terminator);
        };
        
        this.hasProperty = function (prop) {
            var i;
            for (i = 0; i < this.rules.length; i++) {
                if (this.rules[i].propertyName === prop) {
                    return true;
                }
            }
            return false;
        };

        this.getPropertyValue = function (prop) {
            var i;
            for (i = 0; i < this.rules.length; i++) {
                if (this.rules[i].propertyName === prop) {
                    return this.rules[i].value;
                }
            }
            return;
        }
    }
    
	function SVGStylesheet() {
        
        this.defines = {};
        this.eleDefines = {};
        this.blocks = {};
        this.eleBlocks = {};
        
        this.hasDefines = function () {
            var hasDefines = false,
                defn;
            
            for (defn in this.defines) {
                if (this.defines.hasOwnProperty(defn)) {
                    if (this.defines[defn] && !this.defines[defn].written) {
                        hasDefines = true;
                        break;
                    }
                }
            }
            
            return hasDefines;
        };
        
        this.getDefines = function (elId) {
            return this.eleDefines[elId];
        };
        
        this.getDefine = function (elId, type) {
            var aEl = this.getDefines(elId),
                i;
            
            for (i = 0; aEl && i < aEl.length; i++) {
                if (aEl[i].type === type) {
                    return aEl[i];
                }
            }
            return null;
        };
        
        this.define = function (type, elId, defnId, defnOut, defnFingerprint) {
            
            this.defines[defnId] = {
                type: type,
                defnId: defnId,
                fingerprint: defnFingerprint,
                out: defnOut,
                elements: [elId],
                written: false
            };

            this.addElementDefn(this.eleDefines, elId, this.defines[defnId]);
        };
        
        this.addElementDefn = function (eleList, elId, defn) {
            eleList[elId] = eleList[elId] || [];
            eleList[elId].push(defn);

            // Always consolidate all defines to remove
            // duplicates right away.
            this.consolidateDefines();
        };
        
        this.removeElementDefn = function (elId, defnId) {
            var aDef = this.eleDefines[elId],
                i;
            
            for (i = 0; aDef && i < aDef.length; i++) {
                if (aDef[i].defnId === defnId) {
                    aDef.splice(i, 1);
                    this.eleDefines[elId] = aDef;
                    break;
                }
            }
            
            delete this.defines[defnId];
        };

        this.removeElementBlocks = function (elId, className) {
            var aDef = this.eleBlocks[elId],
                i;
            
            for (i = 0; aDef && i < aDef.length; i++) {
                if (aDef[i].className === className) {
                    aDef.splice(i, 1);
                    this.eleBocks[elId] = aDef;
                    break;
                }
            }

            delete this.blocks[className];
        };
        
        this.consolidateDefines = function () {
            
            //find dupes and make em shared...
            var dupTable = {},
                defnId,
                defn,
                i,
                aDups,
                dup,
                dupElId,
                fingerprint;
            
            for (defnId in this.defines) {
                if (this.defines.hasOwnProperty(defnId)) {
                    defn = this.defines[defnId];
                
                    dupTable[defn.fingerprint] = dupTable[defn.fingerprint] || [];
                    dupTable[defn.fingerprint].push(defn);
                }
            }

            //migrate any eleDefines to re-point
            for (fingerprint in dupTable) {
                if (dupTable.hasOwnProperty(fingerprint)) {
                    aDups = dupTable[fingerprint];
                    if (aDups && aDups.length > 1) {

                        for (i = 1; i < aDups.length; i++) {
                            dup = aDups[i];
                            dupElId = dup.elements[0];

                            this.removeElementDefn(dupElId, dup.defnId);
                            this.addElementDefn(this.eleDefines, dupElId, aDups[0]);
                            aDups[0].elements.push(dupElId);
                            aDups[0].consolidated = true;
                        }
                    }
                }
            }
        };
        
        this.hasRules = function () {
            var hasRules = false,
                cls;
            for (cls in this.blocks) {
                if (this.blocks.hasOwnProperty(cls)) {
                    if (this.blocks[cls].hasRules()) {
                        hasRules = true;
                        break;
                    }
                }
            }
            return hasRules;
        };
        
        this.hasStyleBlock = function (omNode) {
            return !!(omNode.styleBlock && omNode.styleBlock.hasRules());
        };
        
        this.getStyleBlock = function (omNode) {
            
            omNode.className = omNode.className || svgWriterIDs.getUnique("cls");
            
            //TBD: factor in IDs
            
            omNode.styleBlock = omNode.styleBlock || new CSSStyleBlock(omNode.className);
            
            this.blocks[omNode.className] = omNode.styleBlock;
            // We create an styleBlock for each element initially.
            // Store the element for later reference.
            omNode.styleBlock['element'] = omNode.id;
            
            return omNode.styleBlock;
        };

        this.getStyleBlockForElement = function (omNode) {

            if (this.eleBlocks[omNode.id]) {
                return this.eleBlocks[omNode.id][0];
            }
            return null;
        };

        this.consolidateStyleBlocks = function () {
            
            //find dupes and make em shared...
            var dupTable = {},
                className,
                defn,
                i,
                aDups,
                dup,
                dupElId,
                fingerprint;
            
            for (className in this.blocks) {
                if (this.blocks.hasOwnProperty(className)) {
                    defn = this.blocks[className];
                    fingerprint = JSON.stringify(defn.rules);
                    defn['fingerprint'] = fingerprint;

                    dupTable[fingerprint] = dupTable[fingerprint] || [];
                    dupTable[fingerprint].push(defn);
                }
            }
            
            //migrate any eleDefines to re-point
            for (fingerprint in dupTable) {
                if (dupTable.hasOwnProperty(fingerprint)) {
                    aDups = dupTable[fingerprint];
                    if (aDups && aDups.length >= 1) {
                        this.addElementDefn(this.eleBlocks, aDups[0].element, aDups[0]);

                        for (i = 1; i < aDups.length; i++) {
                            dup = aDups[i];
                            dupElId = dup.element;

                            this.removeElementBlocks(dupElId, dup.class);
                            this.addElementDefn(this.eleBlocks, dupElId, aDups[0]);
                            aDups[0].elements.push(dupElId);
                            aDups[0].consolidated = true;
                        }
                    }
                }
            }

        }
        
        this.writeSheet = function (ctx) {
            
            var blockClass;
            
            write(ctx, ctx.currentIndent + "<style>" + ctx.terminator);
            indent(ctx);
            
            for (blockClass in this.blocks) {
                if (this.blocks.hasOwnProperty(blockClass)) {
                    if (this.blocks[blockClass].hasRules()) {
                        write(ctx, ctx.terminator);//new line before blocks
                        this.blocks[blockClass].write(ctx);
                    }
                }
            }
            
            undent(ctx);
            write(ctx, ctx.currentIndent + "</style>" + ctx.terminator);
            
        };
        
        this.writePredefines = function (ctx) {
            var omIn = ctx.currentOMNode,
                eleDefines = this.getDefines(omIn.id),
                defn,
                i;
            if (eleDefines && eleDefines.length > 0) {
                for (i = 0; i < eleDefines.length; i++) {
                    defn = eleDefines[i];
                    if (!defn.written) {
                        write(ctx, indentify(ctx.currentIndent, defn.out));
                        defn.written = true;
                    }
                }
            }
        };
        
        this.writeDefines = function (ctx) {
            
            var defnId,
                defn;
            
            for (defnId in this.defines) {
                if (this.defines.hasOwnProperty(defnId)) {
                    defn = this.defines[defnId];

                    if (!defn.written && (!ONLY_EXTERNALIZE_CONSOLIDATED || (ONLY_EXTERNALIZE_CONSOLIDATED && defn.consolidated))) {
                        write(ctx, indentify(ctx.currentIndent, defn.out));
                        defn.written = true;
                    }
                }
            }
        };
        
	}

	module.exports = SVGStylesheet;
    
}());
     
    
