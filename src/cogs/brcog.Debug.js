/// <reference path="../../jquery.intellisense.js" />
/// <reference path="../brisk.js" />
"use strict";

/*
*  Script: brcog.debug.js
*  Brisk Cog (plugin) custom attribute for brisk.js: br-Debug
*  Programmer: Bryan T. Lyman
*  Used for displaying an alert box with verbose information any time an exception is thrown in a script
*
*  attributes usage:
*  br-debug="[bool]": Set to 'true' in order to display an alert any time an exception is thrown. Setting at runtime is global to all attributes.
*/

(function ($, B_, win) {

    function publicDebug() {
        //protected variables
        this._version = "17.2.0";
        this._attributeName = "br-debug";

        //called when an element with br-debug attribute is found
        //used to show more verbose information when an error is thrown
        this.brDebug = function (brInst, elem) {
            var attr = elem.attributes[B_.debugAttributeName];
            var val = attr.value.toBool();
            var neverSet = win.brDebug === undefined;
            if (win.brDebug !== "setting" && win.brDebug !== val) {
                win.brDebug = "setting";
                $("[" + B_.debugAttributeName + "]").each(function (key, elem) {
                    elem.attributes[B_.debugAttributeName].value = val;
                });

                var errCall = function ($e) {
                    if (!$e) return;
                    var oe = $e;
                    if ($e.originalEvent) {
                        oe = $e.originalEvent.error;
                        if (!oe) oe = $e.originalEvent;
                    }
                    var message = oe.message;
                    if (message === "Unspecified error.") return;
                    var errorType = oe.name ? oe.name : "Error";
                    var parentProc;
                    var procedure;
                    var fileName = oe.filename ? oe.filename : oe.sourceURL;
                    var lineNumber = oe.lineno ? oe.lineno : oe.line;
                    var colNumber = oe.colno ? oe.colno : "?";
                    if (oe.stack) try {
                        var matches = (/(?=at\s)[^\(|@]*/gmi).exec(oe.stack);
                        if (!matches)
                            matches = (/^[^\(|@]*/gmi).exec(oe.stack);
                        procedure = matches[0].trim();
                        var infos = (/(?=(\(|@))[^\)|\n]*/i).exec(oe.stack);
                        var info = infos[0].substr(1);
                        var lineCol = (/\d+\:\d+$/).exec(info)[0];
                        fileName = info.substr(0, info.length - lineCol.length - 1);
                        var splits = lineCol.split(":");
                        lineNumber = splits[0];
                        colNumber = splits[1];
                        if (matches.length > 0)
                            parentProc = matches[1].trim();
					} catch (ex) { procedure = null; }
                    debugger;
                    //alert(errorType + "\n" +((parentProc) ? "Owner - " + parentProc + " \n" : "") + ((procedure) ? "Procedure - " + procedure + " \n" : "") + "Url - " + fileName + " \nLine/Col - " + lineNumber + ":" + colNumber + " \nError - " + message + ((oe.stack) ? " \nStack - \n" + oe.stack : ""));
                };

                if (val)
                    $(win).on("error", errCall);
                else if (!neverSet)
                    $(win).off("error", errCall);

                brInst.isDebug = val;
                win.brDebugCall = errCall;
                win.brDebug = val;
            }
        };

    }

    //initialize and privatize class
    publicDebug = new publicDebug;

    //register attribute with brisk
    B_.registerAttr(B_.debugAttributeName, publicDebug.brDebug, 1);

}($, B_, window)); //inject jQuery, Brisk, global::windowInstance dependency