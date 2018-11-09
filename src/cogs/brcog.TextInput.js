/// <reference path="../../jquery.intellisense.js" />
/// <reference path="../brisk.js" />
"use strict";

/*
*  Script: brcog.textinput.js
*  Brisk Cog (plugin) custom attributes for brisk.js: br-nopaste, br-limittext, br-onlyallowchars
*  Programmer: Bryan T. Lyman
*  Used for manipulating the text on input fields: not allowing pasting, resticting to certain characters, or limiting the amount of characters than can by typed
*
*  attributes usage:
*  br-nopaste="": Prevents the paste event from firing on an input field, value should be empty
*
*  br-limittext="[number]": Restrict the amount of characters that can be typed into a textbox field, value is the number of characters to limit to
*
*  br-onlyallowchars="[regex]: Prevent any characters not in the regular expression character set from being typed. You may only use single character
*       expression sets (ex. "[\w.]" for all alpha numeric characters plus a period). You may also use a negative set to use exclusion (ex. "[^\s]" all
*       characters except whitespace).
*/

(function($, B_) {

    function TextInput() {
        //protected variables
        this._version = "17.2.0";
        this._noPasteAttributeName = "br-nopaste";
        this._limitTextAttributeName = "br-limittext";
        this._onlyAllowCharsAttributeName = "br-onlyallowchars";

        //called when an element with br-nopaste attribute is found
        this.brNoPaste = function(brInst, elem) {
            if (!elem.brNoPasteSet) {
                elem.brNoPasteSet = true;

                var attr = elem.attributes[TextInput._noPasteAttributeName];
                $(elem).on("paste", function(e) {
                    e.preventDefault();
                    return false;
                });

                attr.value = ""; //obfuscate attribute after processed
            }
        };

        //called when an element with br-limittext attribute is found
        this.brLimitText = function(brInst, elem) {
            if (!elem.brLimitTextSet) {
                elem.brLimitTextSet = true;

                var $elem = $(elem);
                var attr = elem.attributes[TextInput._limitTextAttributeName];
                var limit = Number(attr.value.replace(brInst.rxNonNumber, ""));

                $elem.on("keypress", function(e) {
                    var val = $elem.val();

                    //restrict length
                    if (val.length >= limit) {
                        e.preventDefault();
                        return false;
                    }

                    return true;
                });

                attr.value = ""; //obfuscate attribute after processed
            }
        };

        //called when an element with br-onlyallowchars attribute is found
        this.brOnlyAllowChars = function(brInst, elem) {
            if (!elem.brOnlyAllowCharsSet) {
                var attr = elem.attributes[TextInput._onlyAllowCharsAttributeName];
                var attrVal = attr.value.trim();
                if (!attrVal.startsWith("[") && !attrVal.endsWith("]"))
                    throw "Invalid character set regular expression.";
                elem.brOnlyAllowCharsSet = new RegExp(attrVal);

                $(elem).on("keypress", function(e) {
                    var keyVal = String.fromCharCode(e.keyCode);
                    if (!elem.brOnlyAllowCharsSet.test(keyVal)) {
                        e.preventDefault();
                        return false;
                    }
                    return true;
                });

                attr.value = ""; //obfuscate attribute after processed
            }
        };

    }

    //initialize and privatize class
    TextInput = new TextInput;

    //register attribute with brisk
    B_.registerAttr(TextInput._noPasteAttributeName, TextInput.brNoPaste);
    B_.registerAttr(TextInput._limitTextAttributeName, TextInput.brLimitText);
    B_.registerAttr(TextInput._onlyAllowCharsAttributeName, TextInput.brOnlyAllowChars);

}($, B_)); //inject jQuery, Brisk
