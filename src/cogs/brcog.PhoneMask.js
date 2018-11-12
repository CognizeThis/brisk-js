/// <reference path="../../jquery.intellisense.js" />
/// <reference path="../brisk.js" />
"use strict";

/*
*  Script: brcog.phonemask.js
*  Brisk Cog (plugin) custom attribute for brisk.js: br-PhoneMask
*  Programmer: Bryan T. Lyman
*  Used for masking textbox input elements, restricting it to phone number formats
*
*  attributes usage:
*  br-phonemask="[10 - 12]": Apply a phone restriction mask to a textbox input field, the value specifies how many digits are expected (default=10)
*/

(function ($, B_, win) {

    function PhoneMask() {
        //protected variables
        this._version = "17.2.0";
        this._attributeName = "br-phonemask";
        this._masks = ["(000) 000-0000", "0+(000) 000-0000", "00+(000) 000-0000"];

        this._phoneMask = function (e, brInst, elem, digitCount, mask) {
            var $elem = $(elem);
            var keyVal;
            var isDeleteKey;
            var eventType = e.type.toLowerCase();
            if (eventType === "input") { //main handler
                keyVal = $elem.val().replace(brInst.rxNonNumber, "").substr(0, digitCount);
                $elem.val("");
                e.preventDefault();
                elem.brPhoneKeyPressed = false;
            } else if (eventType === "keydown") {
                var keyCode = e.which ? e.which : e.keyCode;
                if (keyCode === 46) { //delete
                    e.preventDefault();
                    isDeleteKey = true;
                } else
                    return true;
            }

            var caretStart = elem.caretStart;
            var caretEnd = elem.caretEnd;

            if (!keyVal && !isDeleteKey)
                return !e.isDefaultPrevented();

            //handle selection range and new digits
            var oldVal = $elem.val().replaceAt(caretStart, caretEnd, keyVal);

            //handle delete key
            if (isDeleteKey) {
                if (oldVal.Length < caretStart) return false;
                var valPreCaret = oldVal.substring(0, caretStart);
                var valPostCaret = oldVal.substring(caretEnd);
                if (caretEnd > caretStart) {
                    //delete selection, has already been carried out at this point
                    caretEnd = caretStart;
                } else {
                    //delete single char
                    if (caretStart >= oldVal.length) return false;
                    oldVal = valPreCaret + valPostCaret.substring(1);
                }
            }

            //reduce to valid characters
            var digits = oldVal.replace(brInst.rxNonNumber, "");

            //block invalid keystrokes and restrict length
            //let mask characters be typed
            var invalidKeyMatch = brInst.rxNonNumber.exec(keyVal);
            if (digits.length > digitCount || !isDeleteKey && invalidKeyMatch && keyVal !== mask[caretStart])
                return !e.isDefaultPrevented();

            //mask replacement
            var newVal = mask.replace(/0/gmi, " "); //0 placeholders blanked
            var digitIndex = 0;
            var chrIndex;
            for (chrIndex = 0; chrIndex < mask.length; chrIndex++) {
                if (digitIndex >= digits.length) break;

                var chr = mask[chrIndex];
                if (chrIndex >= caretStart && !isDeleteKey)
                    caretStart++;

                //TODO: do international prefixing, extensions here by handling other characters in the mask
                if (chr !== "0") {
                    if (chrIndex === caretStart) caretStart++; //when caret typed next to mask character, increment caret appropriately
                    continue;
                }
                newVal = newVal.replaceChr(chrIndex, digits[digitIndex++]);
            }

            $elem.val(newVal);

            elem.setSelectionRange(caretStart, caretStart);
            elem.caretStart = caretStart;
            elem.caretEnd = caretStart;

            return !e.isDefaultPrevented();
        };

        //called when an element with br-phonemask attribute is found
        this.brPhoneMask = function (brInst, elem) {
            if (!elem.brPhoneMaskSet) {
                elem.brPhoneMaskSet = true;

                var attr = elem.attributes[PhoneMask._attributeName];

                var error = "";
                try {
                    var digitCount = Number(attr.value.replace(brInst.rxNonNumber, ""));
                    if (digitCount < 10 || digitCount > 12) digitCount = 10; //default to 10 digit phone number
                    var mask = PhoneMask._masks[digitCount - 10]; //select appropriate phone mask

                    var events = "input keydown";
					$(elem).on(events, function (e) { PhoneMask._phoneMask(e, brInst, elem, digitCount, mask); });

                } catch (ex) {
                    error = "ERROR: " + ex;
                    if (brInst.isDebug) win.brDebugCall(ex);
                } finally {
                    attr.value = error; //obfuscate attribute after processed, or show user error
                }
            }
        };

    }

    //initialize and privatize class
    PhoneMask = new PhoneMask;

    //register attribute with brisk
    B_.registerAttr(PhoneMask._attributeName, PhoneMask.brPhoneMask);

}($, B_, window)); //inject jQuery, Brisk, global window dependencies