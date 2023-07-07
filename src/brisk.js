"use strict";

/*
*  Script: brisk.js (custom attributes)
*  Programmer: Bryan T. Lyman
*  Used to tie elements to custom attributes using render time binding rather than identifier select binding using JQuery, much like Angular.js
*  JQuery is used to look for elements with specific attributes and then call user-defined functions.
*
*  built-in attributes usage:
*  br-id="[name]": Sets an element id to link to other calls using the {{br-id}} syntax, value is the unique id of the element.
*
*  br-call="[javascript function/statement]([params])": Calls a script, value specifies the javascript you wish to be called. (can use {{br-id}})
*
*  br-noSelect="[bool]": Defaults to true. Prevents cursor-drag-selecting an element and all of it's children unless that child is a form input element.
*       You may place a true attribute directly on an input element to enable the same behavior. Set to false and place on a specific child element you wish
*       to allow selection, even though a parent may have this enabled.
*
*  br-noDrag="[bool]": Defaults to true. Prevents dragging of an element and all of it's children unless that child is a form input element.
*       You may place a true attribute directly on an input element to enable the same behavior. Set to false and place on a specific child element you wish
*       to allow selection, even though a parent may have this enabled.
*
*  br-ajax="{stateObject}": Used to make a single page ajax call. The value of the attribute represents a asychronous state object and is in
*       JSON format which can also trigger certain behavior as well as being used to pass state information.
*       JSON list of settings as follows:
*       "method"['GET','PUT','POST','DELETE','PATCH']: Defaults to "POST". This is the web request method type.
*       "url"[string]:          Optional. If this is omitted, the submit url of the first form element on the page (usually postback to itself) or a url to
*                               the local web location will be used, otherwise this is the url to make the ajax request to.
*       "path"[string]:         Optional. This path is appeneded to the end of the specified url. If url is ommitted, this is the path from the root of the
*                               current local web location.
*       "sendFormat"[string:'html','form','xml','json','text']: Defaults to "json" which allows CORS pre-flight check, but also disables request header
*                               limitations. The format in which data will be sent from the ajax server request.
*       "encoding"[string]:     defaults to "utf-8". The type of charset text encoding to use for the ajax request what is expected by the response.
*       "returnFormat"[string:'html','xml','json','text']: Defaults to "json". The format in which data is expected to be returned from the server response.
*       "data"[object]:         Optional. The data sent to the server request in the format of [sendFormat]. Can be a function delegate to evaluate data
*                               immediately before sending the request.
*       "crossDomain"[bool]:    Defaults to true. Enables/disables the request to try and support crossdomain traffic and CORS. Set returnFormat="json" and
*                               crossDomain=false in order to create a jsonp request in which the bind event will point to a jsonpCallback delegate.
*       "bindEvent"[string]:    Defaults to "click". The (space separated) event(s) to bind on the element in order to trigger the ajax single page request.
*       "blocking"[bool]:       Defaults to true. Block events from triggering multiple ajax requests until the response is returned from the first request.
*       "callback"[delegate(sender, response, stateObject)]: Required. A function which will be called and passed the response and state object when the ajax
*                               sever request is completed.
*       "errorCallback"[delegate(sender, response, stateObject)]: Optional. A function which will be called when an error occurs on the ajax server request.
*       "startStopCallback"[delegate(sender, isStart): Optional. A function which is called twice, once when the ajax call begins, and once when the call
*                               is completed. Used to allow the user to set wait indicators.
*       "headers"[object]:      Optional. A delegate which returns an object or an objact of header keys and thier related values. If left null, defaults to
*								standard accept and content-type headers built upon sendFormat, returnFormat, and encoding values.
*       [Any other key/value pair desired as part of the state object]: This includes br-id references and javascript function delegates.
*
*  br-view="{stateObject}": Used to make read a single page html update region call to an ajax service. The value of the attribute represents a asychronous
*       state object and is in JSON format which can also trigger certain behavior as well as being used to pass state information. Also installs the
*       brViewRefresh(callback) function upon the element owning the attribute; if the callback is specified, it will be called once the refresh is complete.
*       "method"['GET','PUT','POST','DELETE','PATCH']: Defaults to "POST". This is the web request method type.
*       "url"[string]:          Optional. If this is omitted, the submit url of the first form element on the page (usually postback to itself) will be used,
*                               otherwise this is the url make the ajax request to. Uses the same backend call as the br-ajax attribute but hard set to the
*                               the following settings: sendFormat:json, encoding:utf-8, returnFormat:html, crossDomain:true, bindEvent:none,
*                               blocking: true, callback: render straight to element.
*       "gatherInputs[bool]:    Defaults to false. When true, the sendDataObject is injected with detailed values from all current input fields on the parent
*                               form in JSON format under the parent key "gatheredInputs". For more optimized performance, this should be set to false and
*                               then use data as a delegate function to pass only the data that is absolutely necessary for the request.
*       "data"[object]:         Optional. The data sent to the server request in the format of [sendFormat]. Can be a function delegate to evaluate data
*                               immediately before sending the request; return data from the delegate is encoded with html parameter encoding before sending.
*       "refreshInterval"[number in seconds]: Optional, 0 (disabled) by default. The number of seconds to wait until the panel is refeshed.
*       "delayed[bool]:         Defaults to false. When true, the view does not load immediately. Instead it waits for the first refresh interval (if using
*                               the refreshInterval option, or until brViewRefresh() is triggered on the element from code.
*       "errorCallback"[delegate(sender, response, stateObject)]: Optional. A function which will be called when an error occurs on the ajax server request.
*                               if omitted, the error html will shunt directly to render upon the element.
*       "startStopCallback"[delegate(sender, isStart): Optional. A function which is called twice, once when the ajax call begins, and once when the call
*                               is completed. Used to allow the user to set wait indicators.
*       "headers"[object]:      Optional. A delegate which returns an object or an objact of header keys and thier related values. If left null, defaults to
*								standard accept and content-type headers built upon sendFormat, returnFormat, and encoding values.
*       [Any other key/value pair desired as part of the state object]: This includes br-id references and javascript function delegates.
*
*  br-refresh="{stateObject}": Used to link a refresh command to a specific br-view through a br-id.
*		"id"{{object}}:			The brisk object reference id of the br-view element to refresh.
*		"url"[string]:			Optional. Use this to override the url of the br-view with a different location.
*
*
*  br-load="[html resource url]": Used to load a html resource file contents into an element.
*/

//replaceAll() polyfill repalce all instances of a string within another string
if (!String.prototype.replaceAll)
	String.prototype.replaceAll = function (str, newStr) {
		var a = (this + ""); //string copy to avoid extension reference bleeding
		if (Object.prototype.toString.call(str).toLowerCase() === '[object regexp]') // If a regex pattern
			return a.replace(str, newStr);
		return a.replace(new RegExp(str, 'g'), newStr); // If a string
	};

//polyfill to extend the String object to add the replaceChr function for a single character
if (!String.prototype.replaceChr)
	String.prototype.replaceChr = function (index, str) {
		var a = (this + "").split(""); //string copy to avoid extension reference bleeding
		a[index] = str;
		return a.join("");
	};

//polyfill to extend the String object to add the replaceAt function for a string range
if (!String.prototype.replaceAt)
	String.prototype.replaceAt = function (startIndex, endIndex, str) {
		var a = (this + "").split(""); //string copy to avoid extension reference bleeding
		a.splice(startIndex, endIndex - startIndex, str);
		return a.join("");
	};

//polyfill to extend the String object to add the trim function if does not already exist
if (!String.prototype.trim)
	String.prototype.trim = function () {
		return (this + "").replace(/^\s+|\s+$/gmi, ""); //string copy to avoid extension reference bleeding
	};

//polyfill to extend the String object to add the startsWith function if does not already exist
if (!String.prototype.startsWith)
	String.prototype.startsWith = function (search) {
		return (this + "").substr(0, search.length) === search; //string copy to avoid extension reference bleeding
	};

//polyfill to extend the String object to add the endsWith function if does not already exist
if (!String.prototype.endsWith)
	String.prototype.endsWith = function (search) {
		var thisStr = this + ""; //string copy to avoid extension reference bleeding
		var position = thisStr.length - search.length;
		return thisStr.indexOf(search, position) === position;
	};

//polyfill to extend the String object to add the toBool function
if (!String.prototype.toBool)
	String.prototype.toBool = function () {
		var a = (this + "").trim(); //string copy to avoid extension reference bleeding
		if (!/^(false|true|1|0|yes|no|on|off|set|clear)(?!.+)$/gmi.test(a) || /^(false|0|no|off|clear)(?!.+)$/gmi.test(a))
			return false;
		return true;
	};

//polyfill to extend the Uint8Array (data stream) to convert to a string
if (!Uint8Array.prototype.toFlatString)
	Uint8Array.prototype.toFlatString = function () {
		var chunkSize = 0x8000;
		var index = 0;
		var length = this.length;
		var result = "";
		var slice;
		while (index < length) {
			slice = this.subarray(index, Math.min(index + chunkSize, length));
			result += String.fromCharCode.apply(null, slice);
			index += chunkSize;
		}
		return result;
	};

//polyfill to extend the Uint8Array to convert to a base64 string
if (!Uint8Array.prototype.toBase64)
	Uint8Array.prototype.toBase64 = function () {
		return btoa(this.toFlatString());
	};

//reverse polyfill for threaded timers using workers
window.setIntervalW = setInterval;
window.clearIntervalW = clearInterval;
window.setTimeoutW = setTimeout;
window.clearTimeoutW = clearTimeout;
if (Worker && URL && URL.createObjectURL) {
	Worker.threads = {};
	Worker.threads.uid = 0;
	var blobPrefix = "self.addEventListener('message',function(e){switch(e.data.c){case 'a':self.active=e.data.v;break;case 's':var k=";
	var blobSuffix = "(function(){if(self.active)postMessage('');},e.data.t);postMessage({'k':k,'l':e.data.l});break;case 'c':clearInterval(e.data.k);break;}});";
	var clearThread = function (localKey) {
		var worker = Worker.threads["_" + localKey];
		if (!worker) return;
		if (!worker.key) {
			worker.key = 0;
			worker.postMessage({ "c": "a", "v": false });
			return;
		}
		worker.postMessage({ "c": "c", "k": worker.key });
		worker.terminate();
		delete Worker.threads["_" + localKey];
	};
	var setThread = function (handler, timeout, worker) {
		var localKey = ++Worker.threads.uid;
		if (localKey === 0) ++Worker.threads.uid;
		Worker.threads["_" + localKey] = worker;
		worker.addEventListener("message", function (e) {
			if (e.data) {
				var cancelled = (Worker.threads["_" + e.data.l].key === 0);
				worker.key = e.data.k;
				if (cancelled)
					clearThread(e.data.l);
				else
					worker.postMessage({ "c": "a", "v": true });
			}
			else handler();
		}, false);
		worker.postMessage({ "c": "s", "t": timeout, "l": localKey });
		return localKey;
	};

	var iBlobUrl = URL.createObjectURL(new Blob([blobPrefix + "setInterval" + blobSuffix]));
	window.setIntervalW = function (handler, timeout) {
		return setThread(handler, timeout, new Worker(iBlobUrl));
	};
	window.clearIntervalW = clearThread;

	var tBlobUrl = URL.createObjectURL(new Blob([blobPrefix + "setTimeout" + blobSuffix + ";self.active=true;"]));
	window.setTimeoutW = function (handler, timeout) {
		return setThread(handler, timeout, new Worker(tBlobUrl));
	};
	window.clearTimeoutW = clearThread;
}

//polyfill to merge with a json object to create a case lowercase json keyed object which is also integer indexed for each original key
if (!window.LowCaseIndex) {
	var LowCaseIndex = function (mergeObject) {
		var index = this;
		if (mergeObject) {
			var i = 0;
			for (var key in mergeObject)
				if (mergeObject.hasOwnProperty(key)) {
					var val = mergeObject[key];
					index[key] = val;
					var lowKey = key.toLowerCase();
					if (lowKey !== key)
						Object.defineProperty(index, lowKey, {
							__proto__: null,
							enumerable: false,
							configurable: false,
							get: function (ii, ki) { return function () { return ii[ki]; }; }(index, key),
							set: function (ii, ki) { return function (value) { ii[ki] = value; }; }(index, key)
						});
					index[i++] = key;
				}
			index.length = i;
		}

		this.expectBool = function (fieldName) {
			var index = this;
			var valCheck = index[fieldName.toLowerCase()];
			var ret = null;
			if (typeof valCheck === "function")
				valCheck = valCheck(index);
			if (typeof valCheck === "string")
				ret = valCheck.toBool();
			else if (typeof valCheck === "boolean")
				ret = valCheck;
			return ret;
		};

		this.expectNum = function (fieldName) {
			var index = this;
			var valCheck = index[fieldName.toLowerCase()];
			var ret = null;
			if (typeof valCheck === "function")
				valCheck = valCheck(index);
			if (typeof valCheck === "string")
				ret = new Number(valCheck);
			else if (typeof valCheck === "number")
				ret = valCheck;
			return ret;
		};

		this.expectStr = function (fieldName) {
			var index = this;
			var valCheck = index[fieldName.toLowerCase()];
			var ret = null;
			if (typeof valCheck === "function")
				valCheck = valCheck(index);
			if (valCheck === null || valCheck === undefined)
				return null;
			if (typeof valCheck === "string")
				ret = valCheck;
			else
				ret = valCheck + "";
			return ret;
		};

		return index;
	};
	LowCaseIndex.prototype = [];
}

var Brisk = Brisk || function ($, win) {

	var browserType,
		_textrange = {
			xul: {
				get: function (property) {
					var props = {
						position: this[0].selectionStart,
						start: this[0].selectionStart,
						end: this[0].selectionEnd,
						length: this[0].selectionEnd - this[0].selectionStart,
						text: this.val().substring(this[0].selectionStart, this[0].selectionEnd)
					};

					return typeof property === "undefined" ? props : props[property];
				},

				set: function (start, end) {
					if (typeof end === "undefined") {
						end = this[0].value.length;
					}

					this[0].selectionStart = start;
					this[0].selectionEnd = end;
				},

				replace: function (text) {
					var start = this[0].selectionStart;
					var end = this[0].selectionEnd;
					var val = this.val();
					this.val(val.substring(0, start) + text + val.substring(end, val.length));
					this[0].selectionStart = start;
					this[0].selectionEnd = start + text.length;
				}
			},
			msie: {
				get: function (property) {
					var range = document.selection.createRange();

					if (typeof range === "undefined") {
						var props = {
							position: 0,
							start: 0,
							end: this.val().length,
							length: this.val().length,
							text: this.val()
						};

						return typeof property === "undefined" ? props : props[property];
					}

					var start = 0;
					var end = 0;
					var length = this[0].value.length;
					var lfValue = this[0].value.replace(/\r\n/g, "\n");
					var rangeText = this[0].createTextRange();
					var rangeTextEnd = this[0].createTextRange();
					rangeText.moveToBookmark(range.getBookmark());
					rangeTextEnd.collapse(false);

					if (rangeText.compareEndPoints("StartToEnd", rangeTextEnd) === -1) {
						start = -rangeText.moveStart("character", -length);
						start += lfValue.slice(0, start).split("\n").length - 1;

						if (rangeText.compareEndPoints("EndToEnd", rangeTextEnd) === -1) {
							end = -rangeText.moveEnd("character", -length);
							end += lfValue.slice(0, end).split("\n").length - 1;
						} else {
							end = length;
						}
					} else {
						start = length;
						end = length;
					}

					var propsOut = {
						position: start,
						start: start,
						end: end,
						length: length,
						text: range.text
					};

					return typeof property === "undefined" ? propsOut : propsOut[property];
				},

				set: function (start, end) {
					var range = this[0].createTextRange();

					if (typeof range === "undefined") {
						return;
					}

					if (typeof end === "undefined") {
						end = this[0].value.length;
					}

					var ieStart = start - (this[0].value.slice(0, start).split("\r\n").length - 1);
					var ieEnd = end - (this[0].value.slice(0, end).split("\r\n").length - 1);

					range.collapse(true);

					range.moveEnd("character", ieEnd);
					range.moveStart("character", ieStart);

					range.select();
				},

				replace: function (text) {
					document.selection.createRange().text = text;
				}
			}
		},
		textrange = {
			get: function (property) {
				return _textrange[browserType].get.apply(this, [property]);
			},
			set: function (start, length) {
				var s = parseInt(start),
					l = parseInt(length),
					e;

				if (typeof start === "undefined") {
					s = 0;
				} else if (start < 0) {
					s = this[0].value.length + s;
				}

				if (typeof length !== "undefined") {
					if (length >= 0) {
						e = s + l;
					} else {
						e = this[0].value.length + l;
					}
				}

				_textrange[browserType].set.apply(this, [s, e]);

				return this;
			},
			setcursor: function (position) {
				return this.textrange("set", position, 0);
			},
			replace: function (text) {
				_textrange[browserType].replace.apply(this, [String(text)]);

				return this;
			},
			insert: function (text) {
				return this.textrange("replace", text);
			}
		};

	//install jquery module
	$.fn.textrange = function (method) {
		if (typeof this[0] === "undefined") return this;

		if (typeof browserType === "undefined")
			browserType = "selectionStart" in this[0] ? "xul" : document.selection ? "msie" : "unknown";

		if (browserType === "unknown") throw "Text Selection Unsupported";

		var preserveFocus = null;
		if (document.activeElement !== this[0]) {
			preserveFocus = $(document.activeElement);
			this.select();
		}
		var ret = this;
		if (typeof method === "undefined" || typeof method !== "string")
			ret = textrange.get.apply(this);
		else if (typeof textrange[method] === "function")
			ret = textrange[method].apply(this, Array.prototype.slice.call(arguments, 1));
		else
			$.error("Method " + method + " does not exist in jQuery.textrange");

		if (preserveFocus) preserveFocus.select();

		return ret;
	};

	function internalBr() {
		//br instance members
		var _version = "23.07.06";
		this._ids = {}; //quick lookup for br-id elements
		//initial list of built-in custom attributes and their associated handlers
		this._attrs = {}; //delegate format: function(currentBriskInstance, elementWithAttribute)
		this._idAttributeName = "br-id";
		this._debugAttributeName = "br-debug";
		this._jsCallAttributeName = "br-call";
		this._ajaxViewAttributeName = "br-view";
		this._viewRefreshAttributeName = "br-refresh";
		this._ajaxAttributeName = "br-ajax";
		this._restGetAttributeName = "br-restGet";
		this._restPutAttributeName = "br-restPut";
		this._restPostAttributeName = "br-restPost";
		this._restPatchAttributeName = "br-restPatch";
		this._restDeleteAttributeName = "br-restDelete";
		this._noSelectAttributeName = "br-noSelect";
		this._noDragAttributeName = "br-noDrag";
		this._loadAttributeName = "br-load";
		this._clickAttributeName = "br-click";

		this._allowedServerThreads = 6; //maximum concurrent asychronous server operations, default to 6
		this._threadRetryInterval = 100; //in milliseconds, the amount of time to re-poll a sever request if it was postponed to wait for a free thread
		this.isDebug = false;
		this.rxNonNumber = /[^\d]+/gmi; //used to replace all non-numeric characters
		this.rxNumeric = /[\d]+/gmi; //used to check for all numeric characters

		//watch page for changes (main purpose)
		this.domWatch = function (elem, callback, brInst) {
			var $obj = $(elem);
			var addThreadId, remThreadId;
			//throttle the events
			$obj.on("DOMNodeInserted", function (e) {
				if (addThreadId) {
					clearTimeout(addThreadId);
					addThreadId = null;
				}
				addThreadId = setTimeout(function () {
					callback(e.target); //true, going down
				}, 100);
			});
			$obj.on("DOMNodeRemoved", function (e) {
				if (addThreadId) {
					clearTimeout(addThreadId);
					addThreadId = null;
				}
				if (remThreadId) {
					clearTimeout(remThreadId);
					remThreadId = null;
				}
				remThreadId = setTimeout(function () {
					callback(e.target, true); //true, going down
				}, 100);
			});
		};

		//text selection watcher handler
		this._setGetCaret = function (e) {
			var target = e.currentTarget;
			target.brCaretRanging = true;
			var caret = $(target).textrange();
			target.brCaretRanging = undefined;
			target.caretStart = caret.start;
			target.caretEnd = caret.end;
		};

		//text selection watcher for text input fields
		this._installCaretTracking = function (elem) {
			if (elem.brCaretSet) return true;
			elem.brCaretSet = true;
			elem.caretStart = 0;
			elem.caretEnd = 0;
			var events = "keyup input focusin";
			$(elem).on(events, function (e) { if (!e.currentTarget.brCaretRanging) internalBr._setGetCaret(e); return true; });

			return true;
		};

		this._installAnchorTracking = function (elem) {
			if (elem.brAnchorSet) return true;
			elem.brAnchorSet = true;
			$(elem).on("click", function (e) {
				var href = elem.attributes["href"];
				if (href && href.value) {
					var url = null;
					try {
						url = new URL(href.value);
					}
					catch (ex) {
					}
					$(B_).trigger("anchorclick", [elem, e, url]);
				}
			});
		};

		//called when certain attributes need a bind/re-bind
		this.brInit = function (brInst, elem, down) {
			if (down) {
				//recurse and trigger brDown on any element that have implemented the function
				if (elem) {
					var downChildren = function (child) {
						if (child.brDown && typeof (child.brDown) === "function") child.brDown(brInst);
						if (child.children && child.children.length > 0)
							$(child.children).each(function (key, nextChild) {
								downChildren(nextChild);
							});
					};
					downChildren(elem);
				}
				brInst.idsLoaded = undefined;
				delete brInst._ids; //clean old references and refresh
				brInst._ids = {};
			}
			var $found = $("[" + brInst._idAttributeName + "]");
			if ($found.length > 0)
				$found.each(function (key, childElem) { return brInst.brId(brInst, childElem); }); //hardwire br-id to be always first

			brInst.idsLoaded = true;

			$found = $("input[type='text'],textarea");
			if ($found.length > 0)
				$found.each(function (key, childElem) { return brInst._installCaretTracking(childElem); }); //install new functionality onto text box inputs

			$found = $('a');
			if ($found.length > 0)
				$found.each(function (key, childElem) { return brInst._installAnchorTracking(childElem); }); //install new functionality onto anchor tags

			var brDebug = brInst._attrs[brInst._debugAttributeName];
			if (brDebug) {
				$found = $("[" + brInst._debugAttributeName + "]");
				if ($found.length > 0)
					$found.each(function (key, childElem) { return brDebug(brInst, childElem); }); //hardwire br-debug to be always second if plugged in
			}

			//process all registered attributes
			for (var attr in brInst._attrs) {
				if (brInst._attrs.hasOwnProperty(attr)) {
					var brFunc = brInst._attrs[attr];
					if (typeof brFunc === "function" && attr !== brInst._debugAttributeName) {
						$found = $("[" + attr + "]");
						if ($found.length > 0)
							$found.each(function (key, childElem) { return brFunc(brInst, childElem); });
					}
				}
			}

			$found = $("[" + brInst._jsCallAttributeName + "]");
			if ($found.length > 0)
				$found.each(function (key, childElem) { return brInst.brCall(brInst, childElem); }); //hardwire br-call to be always last
		};

		//called when an element with br-id attribute is found
		//used to allow other bound elements to access by alternate id
		this.brId = function (brInst, elem) {
			var attr = elem.attributes[brInst._idAttributeName];
			var val = attr.value.trim();
			if (!elem.brId || elem.brId !== val || !brInst.idsLoaded) {
				elem.brId = val;
				brInst._ids[val] = elem;
			}
		};

		//called when an element with br-call attribute is found
		this.brCall = function (brInst, elem) {
			if (!elem.brCallSet) {
				elem.brCallSet = true;
				var attr = elem.attributes[brInst._jsCallAttributeName];
				var fullVal = attr.value;
				this._parseEval(brInst, attr.name, elem, fullVal);
				attr.value = ""; //obfuscate attribute after processed
			}
			return null;
		};

		this._parseEval = function (brInst, attrName, elem, fullVal, noRun) {
			var quoteRx = new RegExp(attrName + "\\s*=\\s*'", "gmi");
			var quoted = !quoteRx.test(elem.outerHTML);

			//parse individual statements
			var combined = "";
			var statements = fullVal.split(";");
			for (var s = 0; s < statements.length; s++) {
				var val = statements[s].trim();
				if (val === "") continue;

				var seekPos = 0;
				do {
					var encStart = val.indexOf("{{", seekPos);
					seekPos = val.indexOf("}}", encStart) + 2;
					if (encStart > -1 && seekPos > -1) {
						var brId = val.substring(encStart + 2, seekPos - 2);
						var ret = "null";
						var elem = B_.getBrElement(brId);
						if (elem)
							ret = "B_.getBrElement(" + (quoted ? "'" : "\"") + brId + (quoted ? "'" : "\"") + ")";
						val = val.replaceAt(encStart, seekPos, ret);
					}
				} while (seekPos > 1);
				combined += val + "; ";
			}
			return B_.eval(combined, elem, noRun);
		};

		//parseJSON which allows brisk identifier lookups and references
		this.parseJSON = function (jsonString, brInst, attr) {
			var ret = [];
			//force array syntax for eval
			var toArr = function (str) {
				str = "[" + str + "]";
				//change br-id refs to strings for later
				str = str.replace(/\{\{(?!\{)(?=[^\}]+\}\})/gmi, "'{{");
				var match;
				while ((match = /'\{\{[^}]+\}\}(?!')/gmi.exec(str))) {
					var insIndex = match.index + match[0].length - 1;
					str = str.replaceChr(insIndex, "}'");
				}
				return eval(str); //eval array
			};

			var toObj = function (str) {
				var arr = toArr(str);
				var encap = arr[0];
				if (typeof (encap) === "function") {
					encap = encap(brInst, attr);
				}

				if (typeof (encap) === "string" && !(encap.startsWith("{{") && encap.endsWith("}}")) && (encap.startsWith("{") || encap.startsWith("[")))
					encap = toObj(encap);

				if (typeof (encap) !== "object") {
					var retArr = [];
					retArr.push(encap);
					encap = retArr;
				}

				if (!Array.isArray(encap))
					encap = new LowCaseIndex(encap);

				return encap;
			};

			ret = toObj(jsonString);
			//convert br-ids to references
			for (var i in ret) if (ret.hasOwnProperty(i) && !isNaN(i)) {
				var key = ret[i];
				var val = ret[key];
				if (Array.isArray(ret)) {
					val = key;
					key = i;
				}
				if (typeof (val) !== "string") continue;
				var dmStart = val.indexOf("{{") + 2;
				if (dmStart > 1) { //id lookup
					var dmEnd = val.indexOf("}}", dmStart) - 2;
					var param = null;
					if (dmEnd > dmStart)
						param = internalBr._ids[val.substring(dmStart, dmStart + dmEnd).trim()];
					if (param)
						ret[key] = param;
					else
						console.log("parseJSON: " + brInst._idAttributeName + "=" + ret[key] + " in attribute [" + attr.name + "] not found.");
				}
			}

			return ret;
		};

		//private, meant to be called from public ajaxCall
		this._ajaxCall = function (url, method, sendData, newHandler, progressHandler, progressCalc, crossDomain, sendFormat, textEncoding, returnFormat, headers) {
			if (crossDomain) $.support.cors = true;

			$.ajax({
				beforeSend: function (jqxhr, settings) {
					var xhr = settings.xhr;
					settings.xhr = function () {
						var output = xhr();
						if (!progressHandler) return output;

						if (sendData && sendData.command === "upload" && sendData.upFile && sendData.timeStamp && sendData.fileName && sendData.fileCount && sendData.fileNumber && sendData.fileParts && sendData.part) {
							var uploadProgress = function (currentProgress) {
								progressCalc("_" + sendData.timeStamp, sendData.timeStamp, sendData.fileName, sendData.fileCount, sendData.fileNumber, sendData.fileParts, sendData.part, currentProgress);
							}
							var currentProgress = 0;
							var $upload = $(output.upload);
							$upload.on("progress", function (ue) {
								var progress = currentProgress;
								var pe = ue.originalEvent;
								if (pe.total > pe.loaded)
									progress = Math.floor((pe.loaded / pe.total) * 100);
								if (progress > 0 && progress < 100 && progress > currentProgress) {
									currentProgress = progress;
									uploadProgress(progress);
								}
							});
							$upload.on("loadend", function () {
								if (currentProgress < 100) {
									currentProgress = 100;
									uploadProgress(100);
								}
							});
						}
						return output;
					}
				},
				headers: ((headers) ? headers : {
					Accept: ((sendFormat) ? sendFormat : "*/*"),
					Host: win.location.Host
				}),
				url: url,
				type: (method) ? method : "GET",
				contentType: ((sendFormat) ? sendFormat : "application/json") + ";charset=" + ((textEncoding) ? textEncoding : "utf-8"),
				dataType: (returnFormat) ? returnFormat : "json",
				cache: false,
				crossDomain: (crossDomain === undefined || crossDomain === null) ? true : crossDomain,
				data: sendData,
				jsonpCallback: (returnFormat === "jsonp") ? newHandler : null,
				success: (returnFormat !== "jsonp") ? newHandler : null,
				error: newHandler
			});
		};

		this.ajaxCall = function (brInst, elem, url, method, sendData, dataHandler, errorHandler, startStopHandler, progressHandler, crossDomain, sendFormat, textEncoding, returnFormat, headers) {

			var newHandler = function (htmlContentOrResponse, msg, htmlResponseOrMsg) {
				var response = htmlContentOrResponse;
				var readyState = (response) ? response.readyState : null;
				var status = (response) ? response.status : null;
				var data = (response) ? response.responseText : null;
				if (!status) {
					status = htmlResponseOrMsg.status;
					readyState = htmlResponseOrMsg.readyState;
					response = htmlResponseOrMsg;
					data = htmlContentOrResponse;
				}

				if (readyState === 4) {
					elem.ajaxStarted = undefined;
					if ($.brServerThreads > 0) $.brServerThreads--;

					if (status === 201 && sendData && sendData.fileCount) {
						if (elem.uploadedCount === undefined) elem.uploadedCount = 0;
						elem.uploadedCount++;
						if (elem.uploadedCount >= sendData.fileCount)
							Element.uploadedCount = undefined;
					}
					if (dataHandler && status >= 200 && status < 400) {
						dataHandler(data, response);
					} else if (errorHandler) {
						errorHandler(data, response);
					}

					$(elem).css("cursor", "inherit");
					if (startStopHandler) {
						if (elem.brStartStopThread) clearTimeoutW(elem.brStartStopThread);
						startStopHandler(elem, false);
					}
				}

				$(B_).trigger("ajaxEnd", [elem, url]);
			};

			var progressCalc = null;
			if (progressHandler)
				progressCalc = function (key, timeStamp, fileName, totalFiles, fileNumber, totalParts, part, progress) {
					var progressCompiler = win.progressCompiler;
					if (!progressCompiler) {
						progressCompiler = {};
						win.progressCompiler = progressCompiler;
					}
					var fileList = progressCompiler[key];
					if (!fileList) {
						fileList = new Array();
						fileList.timeStamp = timeStamp;
						fileList.totalProgress = 0;
						fileList.totalFiles = totalFiles;
						fileList.adjustedTotalFiles = totalFiles;
						progressCompiler[key] = fileList;
					}
					if (totalFiles < fileList.adjustedTotalFiles)
						fileList.adjustedTotalFiles = totalFiles;

					var partList = fileList[fileNumber - 1];
					if (!partList) {
						partList = new Array();
						partList.totalParts = totalParts;
						fileList[fileNumber - 1] = partList;
					}
					partList[part - 1] = progress;

					var totalProgress = 0;
					for (var fileIndex = 0; fileIndex < fileList.length; fileIndex++) {
						var workingPartList = fileList[fileIndex];
						if (!workingPartList) continue;
						var fileTotal = 0;
						if (!workingPartList.complete) {
							var partsTotal = 0;
							for (var partIndex = 0; partIndex < workingPartList.totalParts; partIndex++) {
								var partValue = workingPartList[partIndex];
								if (partValue)
									partsTotal += partValue;
							}
							fileTotal += Math.floor(partsTotal / workingPartList.totalParts);
							if (fileTotal > 99)
								workingPartList.complete = true;
						} else
							fileTotal = 100;

						totalProgress += Math.floor(fileTotal / fileList.adjustedTotalFiles);
					}
					fileList.totalProgress = totalProgress;
					progressHandler(fileList.totalProgress);

					//clear memory of individual file data
					if (progress > 99) {
						if (sendData.upFile)
							delete sendData.upFile;
					}

					//free up file compiler
					if (fileList.totalProgress > 99) {
						elem.progressComplete = true;
						delete progressCompiler[key];
					}
				};

			if (startStopHandler)
				elem.brStartStopThread = setTimeoutW(function () { startStopHandler(elem, true); }, 1);
			$(elem).css("cursor", "wait");

			if (!$.brServerThreads) $.brServerThreads = 0;
			var threadId = null;
			var beginCall = function () {
				if ($.brServerThreads < brInst._allowedServerThreads) {
					if (elem.progressComplete) elem.progressComplete = undefined;
					if (!elem.ajaxStarted) {
						elem.ajaxStarted = true;
					}
					$.brServerThreads++;
					if (threadId) clearIntervalW(threadId);
					brInst._ajaxCall(url, method, sendData, newHandler, progressHandler, progressCalc, crossDomain, sendFormat, textEncoding, returnFormat);
				}
			};
			threadId = setIntervalW(beginCall, brInst._threadRetryInterval);
			beginCall();
		};

		//use to gather detailed information about all inputs on the form parented by elem, and out put it as JSON
		this.gatherInputs = function (elem) {
			var ret = {};
			var $elem = $(elem);
			var $parentForm = $elem.closest("form");
			var $inputFields = $parentForm.find("input, textarea, select");
			var index = 0;
			$inputFields.each(function (i, child) {
				var $curInput = $(child);
				if (!$curInput.is(":visible"))
					return true;
				var type = $curInput[0].type.toLowerCase();
				var name = $curInput[0].name;
				if (!name) name = $curInput[0].id;
				if (!name) name = type + "_" + index;
				var val = $curInput.val();
				if (type === "checkbox")
					val = $curInput.is(":checked");
				if (type === "radio" && !$curInput.is(":checked"))
					return true;
				ret[name] = val;
				index++;
			});
			return ret;
		};

		var getSendDataValue = function (brInst, elem, options, shouldGatherInputs, sendData, errorCallback) {
			var pd = sendData;
			if (typeof sendData === "function")
				try {
					pd = sendData(elem, options);
				} catch (exv) {
					if (errorCallback)
						errorCallback(elem, exv, options);
				}

			options.sendDataValue = "{\"origin\":\"" + location.href + "\"";
			var id = ((elem.id) ? elem.id : null);
			if (id)
				options.sendDataValue += ", \"id\":\"" + id + "\"";
			id = ((elem.name) ? elem.name : null);
			if (id)
				options.sendDataValue += ", \"name\":\"" + id + "\"";
			id = elem.attributes[internalBr._idAttributeName];
			if (id)
				options.sendDataValue += ", \"brId\":\"" + id.value + "\"";
			if (pd) {
				if (typeof pd === "object") {
					elem.brViewName = pd["view"];
					options.sendDataValue += ", \"data\":" + JSON.stringify(pd);
				} else
					options.sendDataValue += ", \"data\":\"" + pd + "\"";
			}
			if (shouldGatherInputs)
				options.sendDataValue += ", \"fields\":" + JSON.stringify(brInst.gatherInputs(elem));
			options.sendDataValue += "}";
			return options.sendDataValue;
		};

		//wrap a new custom attribute with some param handling
		this.customAttributeWrap = function (brInst, elem, attrName, wrap) {
			if (elem["has_" + attrName]) return null;
			elem["has_" + attrName] = true; //single initialization

			var attr = elem.attributes[attrName];

			var error = "";
			try {
				var params = brInst.parseJSON(attr.value, brInst, attr);
				if (attr.value.length > 0 && params.length < 1)
					throw "Failure to parse options properly.";

				wrap(params);

			} catch (ex) {
				error = "ERROR: " + ex;
				if (brInst.isDebug) win.brDebugCall(ex);
			} finally {
				attr.value = error; //obfuscate attribute after processed, or show user error
			}
		};

		//called when an element with br-ajax attribute is found
		//is the root call of other REST verb aliases
		this.brAjax = function (brInst, elem, attrNameOverride, overrideVerb) {
			var attrName = (attrNameOverride) ? attrNameOverride : brInst._ajaxAttributeName;
			var overrideCallback = function(e,d) { }
			brInst.customAttributeWrap(brInst, elem, attrName, function (options) {

				var $elem = $(elem);
				var valError = "";
				var err = false;
				var blocking = true;
				var valCheck = options.expectBool("blocking");
				if (valCheck !== null)
					blocking = valCheck;

				var bindEvent = "click";
				valCheck = options.expectStr("bindevent");
				if (valCheck) {
					if (typeof valCheck !== "string")
						throw "[bindEvent] must be a space-separated string list of event names, or a single event name string.";
					bindEvent = valCheck;
				}

				var sendData = "";
				if (typeof options.data === "function")
					valCheck = options.data;
				else
					valCheck = options.expectStr("data");
				if (valCheck)
					sendData = valCheck;

				var returnFormat = "json";
				valCheck = options.expectStr("returnformat");
				if (valCheck) {
					valError = "[returnFormat] must be a string and have a value of `html`,`xml`,`json`, or `text`.";
					err = false;
					valCheck = valCheck.trim().toLowerCase();
					switch (valCheck) {
						case "json":
						case "html":
						case "xml":
						case "text":
							returnFormat = valCheck;
							break;
						default:
							err = true;
							break;
					}
					if (err)
						throw valError;
				}

				var encoding = "utf-8";
				valCheck = options.expectStr("encoding");
				if (valCheck) {
					if (typeof valCheck !== "string")
						throw "[encoding] must be a string which conforms to charset content encoding standards for the desired browser.";
					encoding = valCheck;
				}

				var sendFormat = "json";
				var sendFormatCode = "application/json";
				valCheck = options.expectStr("sendformat");
				if (valCheck) {
					valError = "[sendFormat] must be a string and have a value of 'html','form','xml','json', or 'text'.";
					err = false;
					valCheck = valCheck.trim().toLowerCase();
					switch (valCheck) {
						case "json":
							break;
						case "html":
							sendFormatCode = "application/x-www-form-urlencoded";
							break;
						case "form":
							sendFormatCode = "multipart/form-data";
							break;
						case "xml":
							sendFormatCode = "text/xml";
							break;
						case "text":
							sendFormatCode = "text/plain";
							break;
						default:
							err = true;
							break;
					}
					sendFormat = valCheck;
					if (err)
						throw valError;
				}

				var method = (overrideVerb) ? overrideVerb : "GET";
				valCheck = options.expectStr("method");
				if (valCheck && !overrideVerb)
					method = valCheck.toUpperCase();

				var errorCallback = null;
				valCheck = options.errorcallback;
				if (valCheck) {
					if (typeof valCheck !== "function")
						throw "[errorCallback] is NOT required, but it must be a function delegate of format: function(sender, response, stateObject).";
					errorCallback = valCheck;
				}

				var startStopCallback = null;
				valCheck = options.startstopcallback;
				if (valCheck && typeof valCheck === "function")
					startStopCallback = valCheck;

				var callback = (overrideCallback) ? overrideCallback : null;
				valCheck = options.callback;
				if (!overrideCallback && (!valCheck || typeof valCheck !== "function"))
					throw "[callback] option is required and must be a function delegate of format: function(sender, response, stateObject).";
				if (!overrideCallback)
					callback = valCheck;

				var crossDomain = false;
				valCheck = options.expectBool("crossdomain");
				if (valCheck !== null)
					crossDomain = valCheck;
				if (!crossDomain && sendFormat === "json") {
					//sendFormat = "jsonp";
					//sendFormatCode = "text/plain";
					sendFormat = "application/json";
				}

				var url = null;
				valCheck = options.expectStr("url");
				if (valCheck)
					url = valCheck;
				if (!url) {
					var parentForm = $elem.parent("form")[0];
					url = (parentForm) ? parentForm.action : ".";
				}

				var headers = null;
				valCheck = options.expectStr("headers");
				if (valCheck) headers = valcheck;

				var gatherInputs = false;
				valCheck = options.expectBool("gatherinputs");
				if (valCheck !== null)
					gatherInputs = valCheck;

				var eventTriggered = false;
				$elem.on(bindEvent, function () {
					if (blocking && eventTriggered) return false;
					eventTriggered = true;

					var callBackNew = null;
					if (sendFormat !== "jsonp") {
						callBackNew = function (data, response) {
							eventTriggered = false;
							if (!response.data)
								response.data = data;
							callback(elem, response, options);
						};
					} else {
						callBackNew = function (pa, pb, pc, pd) {
							eventTriggered = false;
							callback(pa, pb, pc, pd);
						};
					}

					var errorCallbackNew = function (data, response) {
						eventTriggered = false;
						if (errorCallback) {
							if (!response.data)
								response.data = data;
							errorCallback(elem, response, options);
						}
					};

					var sendDataValue = null;
					if (sendData && typeof sendData === "function")
						sendDataValue = sendData(elem, options);
					else
						getSendDataValue(brInst, elem, options, gatherInputs, sendData, errorCallback);

					brInst.ajaxCall(brInst, elem, url, method, sendDataValue, callBackNew, errorCallbackNew, startStopCallback, null, crossDomain, sendFormatCode, encoding, returnFormat, headers);
					return true;
				});

			});
		};

		//rest aliases
		this.brRestGet = function (brInst, elem) {
			brInst.brAjax(brInst, elem, brInst._restGetAttributeName, "GET");
		};

		this.brRestPut = function (brInst, elem) {
			brInst.brAjax(brInst, elem, brInst._restPutAttributeName, "PUT");
		};

		this.brRestPost = function (brInst, elem) {
			brInst.brAjax(brInst, elem, brInst._restPostAttributeName, "POST");
		};

		this.brRestPatch = function (brInst, elem) {
			brInst.brAjax(brInst, elem, brInst._restPatchAttributeName, "PATCH");
		};

		this.brRestDelete = function (brInst, elem) {
			brInst.brAjax(brInst, elem, brInst._restDeleteAttributeName, "DELETE");
		};

		//called when an element with br-View attribute is found
		this.brView = function (brInst, elem) {
			var attrName = brInst._ajaxViewAttributeName;
			brInst.customAttributeWrap(brInst, elem, attrName, function (options) {

				var $elem = $(elem);
				var errorCallback = null;
				var valCheck = options.errorcallback;
				if (valCheck) {
					if (typeof valCheck !== "function")
						throw "[errorCallback] is NOT required, but it must be a function delegate of format: function(sender, response, stateObject).";
					errorCallback = valCheck;
				}

				var startStopCallback = null;
				valCheck = options.startstopcallback;
				if (typeof valCheck === "function")
					startStopCallback = valCheck;

				var url = null;
				valCheck = options.url;
				if (valCheck) {
					url = valCheck;
				}
				if (!url) {
					var parentForm = $elem.parent("form")[0];
					url = (parentForm) ? parentForm.action : ".";
				}
				if (url) elem["brViewUrl"] = url;

				var method = "GET";
				valCheck = options.method;
				if (valCheck)
					method = valCheck.toUpperCase();

				var refreshInterval = 0;
				valCheck = options.refreshinterval;
				if (valCheck) {
					if (typeof valCheck === "string")
						refreshInterval = Number(valCheck.replace(brInst.rxNonNumber, ""));
					if (typeof valCheck === "number")
						refreshInterval = valCheck;
				}

				var delayed = false;
				valCheck = options.delayed;
				if (typeof valCheck === "string")
					delayed = valCheck.toBool();
				else if (typeof valCheck === "boolean")
					delayed = valCheck;

				var gatherInputs = false;
				valCheck = options.gatherinputs;
				if (typeof valCheck === "string")
					gatherInputs = valCheck.toBool();
				else if (typeof valCheck === "boolean")
					gatherInputs = valCheck;

				var sendData = "";
				valCheck = options.data;
				if (valCheck) {
					sendData = valCheck;
				}

				var refreshCallback = null;
				var refreshTriggered = false;
				var loadView = function () {
					if (refreshTriggered) return; //first request only
					refreshTriggered = true;
					elem.brViewLoaded = false;

					var errorCallbackNew = function (data, response) {
						refreshTriggered = false;
						if (errorCallback) {
							if (!response.data)
								response.data = data;
							errorCallback(elem, response, options);
						}
						else
							$(elem).html(data);
					};

					var callBackNew = function (data, response) {
						refreshTriggered = false;
						$(elem).html(data);
						elem.brViewLoaded = true;
						setTimeout(function () {
							brInst.brInit(brInst, elem);
							if (refreshCallback) {
								setTimeout(function () {
									refreshCallback(response);
									refreshCallback = null;
								}, 1);
							}
						}, 1);
					};

					//pre-calculate data just before request
					//var sendDataValue = getSendDataValue(brInst, elem, options, gatherInputs, sendData, errorCallback);
					var sendDataValue = sendData;

					brInst.ajaxCall(brInst, elem, elem["brViewUrl"], method, sendDataValue, callBackNew, errorCallbackNew, startStopCallback, null, true, "*/*", "utf-8", "html");
				};

				//install a refresh function on the element
				//allow a callback when ajax call completes
				elem.brViewRefresh = function (callback) {
					if (typeof callback === "function")
						refreshCallback = callback;
					loadView();
				};

				if (refreshInterval > 0)
					setIntervalW(loadView, refreshInterval * 1000);

				if (!delayed) loadView();

			});
		};

		//called when an element with br-Refresh attribute is found
		this.brRefresh = function (brInst, elem) {
			var attrName = brInst._viewRefreshAttributeName;
			brInst.customAttributeWrap(brInst, elem, attrName, function (options) {
				var $elem = $(elem);

				var valCheck = options.id;
				if (valCheck) elem.brRefresh = valCheck;

				valCheck = options.url;
				if (valCheck) elem.brUrl = valCheck;

				if (elem.brRefresh) {
					$elem.click(function () {
						var obj = elem.brRefresh;
						if (obj && typeof (obj.brViewRefresh) === "function") {
							if (elem.brUrl) obj.brViewUrl = elem.brUrl;
							obj.brViewRefresh();
						}
						else
							console.log("Call [" + attrName + "]: " + brInst._idAttributeName + "=" + obj + " not found.");
					});
				}
			});
		};

		this.brLoad = function (brInst, elem) {
			var attrName = brInst._loadAttributeName;
			if (elem["has_" + attrName]) return;
			elem["has_" + attrName] = true; //single initialization

			var attr = elem.attributes[attrName];
			var url = attr.value
			attr.value = "";
			this._loadFile(brInst, elem, url);
		};

		this.brClick = function (brInst, elem) {
			if (!elem.brClickSet) {
				elem.brClickSet = true;
				var attr = elem.attributes[brInst._clickAttributeName];
				var fullVal = attr.value;
				var func = brInst._parseEval(brInst, attr.name, elem, fullVal, true);
				$(elem).click(func);
				attr.value = ""; //obfuscate attribute after processed
			}
		};

		this._loadFile = function (brInst, elem, url) {
			brInst.ajaxCall(brInst, elem, url, "GET", null, function (data, response) { $(elem).html(data); }, null, null, null, false, "text/html", "utf-8", "html");
		};

		//called when an element with br-noSelect attribute is found
		this.brNoSelect = function (brInst, elem) {
			var $topElem = $(elem);
			var attr = elem.attributes[brInst._noSelectAttributeName];
			var val = attr.value.toBool();
			elem.brHasNoSelect = true;

			var noSelectAction = "selectstart";

			var prevent = function (e) {

				if (e.target.brNoSelect === true) {
					e.preventDefault();
					return false;
				}

				return true;
			};

			var recurse = function ($children) {
				if ($children && $children.length > 0)
					$children.each(function (i, child) {
						var $child = $(child);
						recurse($child.children());

						//single initialization, allow toggle
						if (child.brNoSelect !== undefined) {
							if (child.brNoSelect !== val) child.brNoSelect = val;
							return true;
						}

						var tagName = child.tagName.toLowerCase();
						var childVal = val;
						if (tagName === "input" || tagName === "textarea")
							childVal = false;

						child.brNoSelect = childVal;
						$child.on(noSelectAction, prevent);
						return true;
					});
			};
			recurse($topElem.children());

			//single initialization, allow toggle
			if (elem.brNoSelect !== undefined) {
				if (elem.brNoSelect !== val) elem.brNoSelect = val;
				return;
			}
			elem.brNoSelect = val;
			$topElem.on(noSelectAction, prevent);
		};

		//called when an element with br-noDrag attribute is found
		this.brNoDrag = function (brInst, elem) {
			var $topElem = $(elem);
			var attr = elem.attributes[brInst._noDragAttributeName];
			var val = attr.value.toBool();

			elem.brHasNoDrag = true;

			var noDragAction = "dragstart";

			var prevent = function (e) {
				var $target = $(e.target);

				if (e.target.brNoDrag === true) {
					$target.click();
					e.preventDefault();
					return false;
				}

				return true;
			};

			var recurse = function ($children) {
				if ($children && $children.length > 0)
					$children.each(function (i, child) {
						var $child = $(child);
						recurse($child.children());

						//single initialization, allow toggle
						if (child.brNoDrag !== undefined) {
							if (child.brNoDrag !== val) child.brNoDrag = val;
							return true;
						}

						var tagName = child.tagName.toLowerCase();
						var childVal = val;
						if (tagName === "input" || tagName === "textarea")
							childVal = false;

						child.brNoDrag = childVal;
						$child.on(noDragAction, prevent);
						return true;
					});
			};
			recurse($topElem.children());

			//single initialization, allow toggle
			if (elem.brNoDrag !== undefined) {
				if (elem.brNoDrag !== val) elem.brNoDrag = val;
				return;
			}
			elem.brNoDrag = val;
			$topElem.on(noDragAction, prevent);
		};

		this._scrubXSS = function (scriptText) {
			var xssIndex = scriptText.indexOf("open");
			if (xssIndex > -1) scriptText = scriptText.replaceChr(xssIndex, "O");
			xssIndex = scriptText.indexOf("location");
			if (xssIndex > -1) scriptText = scriptText.replaceChr(xssIndex, "L");
			xssIndex = scriptText.indexOf("cookie");
			if (xssIndex > -1) scriptText = scriptText.replaceChr(xssIndex, "C");
			xssIndex = scriptText.indexOf("debugger");
			if (xssIndex > -1) scriptText = scriptText.replaceChr(xssIndex, "D");
			xssIndex = scriptText.indexOf("throw");
			if (xssIndex > -1) scriptText = scriptText.replaceChr(xssIndex, "T");
			xssIndex = scriptText.indexOf("eval");
			if (xssIndex > -1) scriptText = scriptText.replaceChr(xssIndex, "E");
			xssIndex = scriptText.indexOf("apply");
			if (xssIndex > -1) scriptText = scriptText.replaceChr(xssIndex, "A");
			return scriptText;
		};
	}

	//initialize and privatize class for injection
	internalBr = new internalBr;

	function publicBr() {
		this.debugAttributeName = internalBr._debugAttributeName;

		//Brisk public methods
		this.eval = function (str, context, noRun) {
			str = internalBr._scrubXSS(str);
			var func = Function('"use strict"; ' + str );
			if (!noRun) {
				if (context) return func.apply(context);
				return func();
			}
			return func;
		};

		this.evalObj = function (str, context) {
			str = internalBr._scrubXSS(str);
			var func = Function('"use strict"; return (' + str + ');');
			if (context) return func.apply(context);
			return func();
		};

		this.getBrElement = function (brId) {
			if (typeof brId !== "string") throw "getBrElement method passed invalid arguments";
			return internalBr._ids[brId];
		};

		this.ajax = function (url, method, callback, sendData, headers, crossDomain, sendFormat, textEncoding, returnFormat) {
			internalBr._ajaxCall(url, method, sendData, callback, null, null, crossDomain, sendFormat, textEncoding, returnFormat, headers);
		};

		this.rest = function (url, method) {
			internalBr.brAjax(internalBr, elem, brInst._restPostAttributeName, "POST");
		};

		this.setView = function (elem, url, delayed, refreshInterval) {
			if (elem["has_br-view"]) {
				elem["brViewUrl"] = url;
				elem.brViewRefresh();
			} else {
				var $elem = $(elem);
				$elem.attr("br-view", "{url:'" + url + "'" +
					(delayed ? ", dalyed:true" : "") +
					(refreshInterval ? ", refreshInterval:" + refreshInterval : "") +
				"}");
				internalBr.brInit(internalBr, elem);
			}
		}

		this.registerAttr = function (attributeName, handler) {
			if (typeof attributeName !== "string" && typeof handler !== "function")
				throw "registerAttr method passed invalid arguments";

			if (internalBr._attrs[attributeName])
				throw "registerAttr: [" + attributeName + "] attribute handler already registered";

			internalBr._attrs[attributeName] = handler;
		};

		this.unregisterAttr = function (attributeName) {
			if (typeof attributeName !== "string")
				throw "unregisterAttr method passed invalid arguments";

			if (attributeName.toLowerCase() === internalBr._idAttributeName)
				throw "unregisterAttr: you cannot change the [" + internalBr._idAttributeName + "] attribute handler";

			if (!internalBr._attrs[attributeName])
				throw "unregisterAttr: [" + attributeName + "] does not exist";

			internalBr._attrs[attributeName] = handler;
		};

		//used for JSON lists to get the first object id if any, good for ordered key.value pairs with a single pair to get the key name
		this.firstKey = function (keyValuePair) {
			if (keyValuePair)
				for (var key in keyValuePair)
					if (key !== "foundIndex" && keyValuePair.hasOwnProperty(key))
						return key;
			return null;
		};

		//used for JsonArrays to find keyvalue pairs by key name
		this.findPair = function (jsonArray, keyToFind) {
			if (typeof jsonArray === "object" && typeof keyToFind === "string")
				for (var kvpIndex in jsonArray) {
					var keyValuePair = jsonArray[kvpIndex];
					var key = publicBr.firstKey(keyValuePair);
					if (key && keyToFind.toLowerCase() === key.toLowerCase()) {
						keyValuePair.foundIndex = kvpIndex;
						return keyValuePair;
					}
				}
			return null;
		};

		this.getUrlVarsJsonArray = function (urlVars) {
			var ret = [];
			var hash = urlVars;
			var splits = hash.split("&");
			for (var i = 0; i < splits.length; i++) {
				var key = splits[i];
				if (key.length < 1) continue;
				var val = null;
				var kvSplits = key.split("=");
				if (kvSplits.length > 1) {
					try {
						key = decodeURIComponent(kvSplits[0]);
						val = decodeURIComponent(kvSplits[1]);
					} catch (ex) { val = null; }
				}
				if (i === 0)
					key = key.substr(1, key.length - 1);
				var kvPair = {};
				kvPair[key] = val;
				ret.push(kvPair);
			}
			return ret;
		};

		this.objectToString = function (obj, encapStrings) {
			var ret = "";

			if (obj === null || typeof obj === "undefined")
				ret = "null";
			else if (typeof obj === "string") {
				var encap = "";
				if (encapStrings) encap = "\"";
				ret = encap + obj + encap;
			} else if (typeof obj === "boolean" ||
				typeof obj === "number")
				ret = obj + "";
			else if (typeof obj === "function")
				ret = obj(encapStrings) + "";
			else
				ret = JSON.stringify(obj);

			return ret;
		};

		this.setLocationHash = function (jsonArray) {
			if (typeof jsonArray !== "object") return;
			var setVal = "#";
			for (var jvi in jsonArray) {
				var kvPair = jsonArray[jvi];
				for (var jv in kvPair) {
					if (jv !== "foundIndex" && kvPair.hasOwnProperty(jv)) {
						setVal += jv;
						var value = kvPair[jv];
						setVal += "=" + encodeURIComponent(publicBr.objectToString(value)) + "&";
					}
				}
			}
			if (setVal.length > 1)
				setVal = setVal.substr(0, setVal.length - 1);

			win.brLocationChanging = true;
			location.hash = setVal;
			setTimeout(function () { win.brLocationChanging = undefined; }, 10);
		};

		this.getLocationHash = function (jsonArray) {
			win.brLocationChanging = true;
			var ret = publicBr.getUrlVarsJsonArray(location.hash);
			setTimeout(function () { win.brLocationChanging = undefined; }, 10);
			return ret;
		};

		this.getHashValue = function (keyName) {
			var ret = null;
			var hashArray = publicBr.getLocationHash();
			var hashSortCol = publicBr.findPair(hashArray, keyName);
			if (hashSortCol)
				ret = hashSortCol[keyName];
			return ret;
		};

		this.setHashValue = function (keyName, value) {
			var hashArray = publicBr.getLocationHash();
			var pair = publicBr.findPair(hashArray, keyName);
			if (!pair) {
				pair = {};
				hashArray.push(pair);
			}
			pair[keyName] = value;
			publicBr.setLocationHash(hashArray);
		};

		this.killHashValue = function (keyName) {
			var hashArray = publicBr.getLocationHash();
			var pair = publicBr.findPair(hashArray, keyName);
			if (pair) {
				hashArray.splice(pair.foundIndex, 1);
				publicBr.setLocationHash(hashArray);
			}
		};

		//used as a blocking thread sleep for other threads to complete
		this.sleep = function (milliSeconds) {
			var endTime = new Date().getTime() + milliSeconds;
			while (new Date().getTime() <= endTime) { var waste = new Date(); }
		};

		/*//used to make an ajax call using JSON data
		//callback is a delegate function in the form of function(sender, response, stateobject)
		//returnFormat is optional and is the type of data expected form the return: 'html','xml','json', or 'text' defaults to 'json'
		this.ajax = function (url, method, jsonData, callback, returnFormat) {
			internalBr.ajaxCall(internalBr, win, url, method, JSON.stringify(jsonData), callback, callback, null, null, null, null, null, returnFormat);
		};*/

		this.loadFile = function (elem, url) {
			internalBr._loadFile(internalBr, elem, url);
		};

		this.getUrl = function () {
			var tostring = function () {
				return this.protocol + "//" + this.host + this.pathname + this.search + this.hash;
			};
			function F() {
				$.extend(this, location);
				this.toString = tostring;
			}
			return new F();
		};
	}

	publicBr = new publicBr();

	//default custom attributes
	publicBr.registerAttr(internalBr._ajaxViewAttributeName, internalBr.brView);
	publicBr.registerAttr(internalBr._viewRefreshAttributeName, internalBr.brRefresh);
	publicBr.registerAttr(internalBr._ajaxAttributeName, internalBr.brAjax);
	publicBr.registerAttr(internalBr._restGetAttributeName, internalBr.brRestGet);
	publicBr.registerAttr(internalBr._restPutAttributeName, internalBr.brRestPut);
	publicBr.registerAttr(internalBr._restPostAttributeName, internalBr.brRestPost);
	publicBr.registerAttr(internalBr._restPatchAttributeName, internalBr.brRestPatch);
	publicBr.registerAttr(internalBr._restDeleteAttributeName, internalBr.brRestDelete);
	publicBr.registerAttr(internalBr._noSelectAttributeName, internalBr.brNoSelect);
	publicBr.registerAttr(internalBr._noDragAttributeName, internalBr.brNoDrag);
	publicBr.registerAttr(internalBr._loadAttributeName, internalBr.brLoad);
	publicBr.registerAttr(internalBr._clickAttributeName, internalBr.brClick);

	//document startup initialization
	$(document).ready(function () {
		var init = function (elem, down) {
			internalBr.brInit(internalBr, elem, down);
		};
		setTimeout(function () { init($("body")[0]); }, 1);
		setTimeoutW(function () { internalBr.domWatch($("body")[0], init, internalBr); }, 50);
	});

	return publicBr; //allow single instancing
};

//create global single class instance references
var B_ = Brisk($, window); //inject jQuery and global window dependencies
Brisk = B_; //re-assign seperately for strict-mode adherance
