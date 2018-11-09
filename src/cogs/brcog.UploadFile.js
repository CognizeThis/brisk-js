/// <reference path="../../jquery.intellisense.js" />
/// <reference path="../brisk.js" />
"use strict";

/*
*  Script: brcog.UploadFile.js
*  Brisk Cog (plugin) custom attribute for brisk.js: br-UploadFile
*  Programmer: Bryan T. Lyman
*  Used to set the click event to upload files asynchronously. Uses full html requests (non-header) and Base64 encoding to break upload files up into chunks for
*  faster and larger file uploads than html usually allows, without the need for an external plugin. For back-end server code which handles these requests,
*  contact the developer.
*
*  attributes usage: br-uploadfile="{optionsName: optionValue}":
*       JSON list of settings as follows:
*       "postUrl"[string]:      Defaults to "./FileUpload.ashx", the url to upload data to.
*       "allowMultiple"[bool]:  Set to true to allow the file browser to select multiple files for asynchronous upload, defaults to single file selection
*       "mimeTypes"[string]:    A comma separated list of file type mimes which will be used as suggestions for the file upload browser.
*       "speedChunkSize"[int]:  Defaults to 579344 (in Bytes) Used to break large upload files into multiple upload sessions to increase upload speed asychronously.
*                               Suggested for single large files rather than multiple small files. Ignored by default; when specified, indicates the byte chunk
*                               size to break transactions up into. A good suggestion is 65535.
*       "progressCallback"[delegate(sender, progress)]: Optional. A function which will be called to display the upload progress of each uploaded file.
*                               An event parameter object will be sent to differentiate which file has progress and how much it has progressed:
*       "callback"[delegate(sender, response)]: Optional. A function which will be called and passed the response and state object when any upload sever request
*                               is completed (each file part).
*       "errorCallback"[delegate(sender, response)]: Optional. A function which will be called when an error occurs on any upload server request (each file part).
*       "startStopCallback"[delegate(sender, isStart): Optional. A function which is called twice, once when the ajax call begins, and once when the call
*                               is completed. Used to allow the user to set wait indicators.
*       "reusable"[bool]:       Set to true to allow another upload event to occur once the previous upload has completed, normally the control is disabled
*                               after a single upload.
*       "dragDrop"[bool]:       Defaults to false. When set to true, the event message handling suppport is added for dragging files onto the element area.
*/

(function($, B_) {

    function UploadFile() {
        //protected variables
        this._version = "17.2.0";
        this._attributeName = "br-uploadfile";

        //called when an element with br-uploadfile attribute is found
        this.brUploadFile = function(brInst, elem) {
            if (elem.brUploadFile) return;
            elem.brUploadFile = true;

            var $elem = $(elem);
            var attrName = UploadFile._attributeName;
            var attr = elem.attributes[attrName];

            var error = "";
            try {
                if (typeof FileReader === "undefined")
                    throw "FileReader object not supported for Brisk UploadFile plugin. Try using a Modernizr module such as dopfile.js";

                var options = brInst.parseJSON(attr.value, brInst, attr);

                var valCheck = options.posturl;
                if (valCheck) {
                    if (typeof valCheck !== "string")
                        throw "[postUrl] is required.";
                }

                var allowMultiple = false;
                valCheck = options.allowmultiple;
                if (typeof valCheck === "string")
                    allowMultiple = valCheck.toBool();
                else if (typeof valCheck === "boolean")
                    allowMultiple = valCheck;

                var mimeTypes = "*";
                valCheck = options.mimetypes;
                if (typeof valCheck === "string")
                    mimeTypes = valCheck;

                $elem.click(function() {
                    if (elem.uploading || elem.getAttribute("disabled")) return false;

                    var $browser = $("<input type='file' style='visibility:hidden;position:absolute;z-index:-1;'>");
                    $(document.forms[0]).append($browser);
                    $browser[0].multiple = allowMultiple;
                    $browser[0].accept = mimeTypes;
                    $browser.change(function(e) {
                        var browserObj = $browser[0];
                        options.timeStamp = Date.now();
                        UploadFile.uploadList(brInst, elem, browserObj.files, options);
                        $browser.remove();
                    });
                    $browser.click();

                    return true;
                });

                valCheck = options["dragdrop"];
                if (typeof valCheck === "string")
                    options.dragdrop = valCheck.toBool();

                if (options.dragdrop) {
                    $elem.on("dragover", function(e) {
                        e.stopPropagation();
                        e.preventDefault();
                        e.originalEvent.dataTransfer.dropEffect = "copy";
                    });
                    $elem.on("drop", function(e) {
                        e.stopPropagation();
                        e.preventDefault();
                        if (elem.uploading || elem.getAttribute("disabled")) return false;
                        options.timeStamp = Date.now();
                        UploadFile.uploadList(brInst, elem, e.originalEvent.dataTransfer.files, options);
                    });
                }

            } catch (ex) {
                error = "ERROR: " + ex;
                if (brInst.isDebug) throw ex;
            } finally {
                attr.value = error; //obfuscate attribute after processed, or show user error
            }
        };

        this.uploadList = function (brInst, elem, fileList, options) {
            elem.uploading = true;
            var fileCount = fileList.length;
            var validFileCount = fileCount;
            //show initial progress bar while waiting for data conversion
            if (fileCount > 0 && options.progresscallback) options.progresscallback(elem, 0);
            for (var fileIndex = 0; fileIndex < fileCount; fileIndex++) {
                var fileObj = fileList[fileIndex];
                var fileName = fileObj.name;
                if (fileObj.size < 1) {
                    validFileCount--;
                    alert("[" + fileName + "] is an empty file and will be ignored.");
                    if (validFileCount === 0) elem.uploading = false;
                    continue;
                }
                var mime = fileObj.type;
                var shortName = fileName;
                var dotIndex = shortName.lastIndexOf(".");
                var fileExtension = "";
                if (dotIndex > -1) {
                    fileExtension = shortName.substring(dotIndex, shortName.length);
                    shortName = shortName.substring(0, dotIndex);
                }
                if (fileExtension && !mime)
                    mime = "application/" + fileExtension.substring(1);
                if (!mime)
                    mime = "application/octet-stream";

                //create data chunk handler
                var fReader = new FileReader();
                fReader.fileName = fileName + "";
                fReader.shortName = shortName + "";
                fReader.fileExtension = fileExtension + "";
                fReader.mime = mime + "";
                fReader.options = options;
                fReader.timeStamp = options.timeStamp;
                fReader.fileNumber = fileIndex + 1;
                fReader.validFileCount = validFileCount;
                fReader.onloadend = function (fEvent) {
                    var options = fEvent.target.options;
                    var validFileCount = fEvent.target.validFileCount;
                    var readerFileName = fEvent.target.fileName;
                    var timeStamp = fEvent.target.timeStamp;
                    var mime = fEvent.target.mime;
                    var shortName = fEvent.target.shortName;
                    var fileExtension = fEvent.target.fileExtension;
                    var fileNumber = fEvent.target.fileNumber;
                    if (!fEvent.target.result) {
                        validFileCount--;
                        alert("[" + readerFileName + "] too large to upload. Some browsers limit the size of local file requests. Use a different browser or try breaking the file down into smaller pieces.");
                        if (validFileCount === 0) elem.uploading = false;
                        return;
                    }
                    var fileSize = (fEvent.target.result.byteLength) ? fEvent.target.result.byteLength : fEvent.total;
                    var fileParts = 1;
                    var speedChunkSize = 579344; //important, chunking above this size yielded unreliable results which led to incomplete uploads
                    if (options.speedchunksize)
                        speedChunkSize = options.speedchunksize;
                    if (typeof (speedChunkSize) === "string")
                        speedChunkSize = Number.parseInt(speedChunkSize);
                    if (typeof (speedChunkSize) === "number" && speedChunkSize > 0 && fileSize > speedChunkSize) {
                        fileParts = Math.floor(fileSize / speedChunkSize);
                        if (fileSize % speedChunkSize > 0)
                            fileParts++;
                    }
                    for (var filePart = 1; filePart <= fileParts; filePart++) {
                        var dataChunk = null;
                        var chunkSize = fileSize;
                        if (fileParts === 1)
                            //dataChunk = encodeURI((new Uint8Array(fEvent.target.result)).toBase64());
                            dataChunk = (new Uint8Array(fEvent.target.result)).toBase64();
                        else {
                            var startIndex = (filePart - 1) * speedChunkSize;
                            chunkSize = speedChunkSize;
                            if (filePart * speedChunkSize > fileSize)
                                chunkSize = fileSize - startIndex;
                            //dataChunk = encodeURI((new Uint8Array(fEvent.target.result.slice(startIndex, startIndex + chunkSize))).toBase64());
                            dataChunk = (new Uint8Array(fEvent.target.result.slice(startIndex, startIndex + chunkSize))).toBase64();
                        }
                        chunkSize = dataChunk.length; //reset size to match newly encoded data

                        if (filePart === 1 && typeof options.callback === "function") {
                            options.callback(elem, { readySate: 4, responseText: "", status: 202, statusText: "Upload Started", fileName: readerFileName, mime: mime, fileCount: validFileCount, fileParts: fileParts });
                        }

                        brInst.ajaxCall(brInst, elem, options.posturl, "POST", {
                            command: "upload",
                            timeStamp: timeStamp,
                            fileName: readerFileName,
                            shortName: shortName,
                            fileExtension: fileExtension,
                            mime: mime,
                            reusable: options.reusable,
                            fileCount: validFileCount,
                            fileNumber: fileNumber,
                            fileParts: fileParts,
                            part: filePart,
                            chunkSize: chunkSize,
                            upFile: dataChunk
                        },
                            function (data, response) {
                                if (options.callback && typeof (options.callback) == "function") {
                                    options.callback(elem, response);
                                }
                            },
                            function (data, response) {
                                if (options.errorcallback && typeof (options.errorcallback) == "function") {
                                    options.errorcallback(elem, response);
                                }
                            },
                            function (sender, isStart) {
                            },
                            function (progress) {
                                if (options.progresscallback && typeof (options.progresscallback) == "function") {
                                    options.progresscallback(elem, progress);
                                }
                                if (progress === 100) {
                                    if (options.reusable)
                                        elem.uploading = false;
                                    if (options.startstopcallback && typeof (options.startstopcallback) == "function") {
                                        options.startstopcallback(elem, false);
                                    }
                                }
                            },
                            true,
                            "application/json",
                            "ascii",
                            "json"
                        );
                    }

                    //done queuing, free up memory
                    delete fEvent.target.result;
                }

                //trigger start event before pre-caching stream event happens in browser
                if (options.startstopcallback && typeof (options.startstopcallback) == "function") {
                    options.startstopcallback(elem, true);
                }
                //begin data chunk queuing
                fReader.readAsArrayBuffer(fileObj);
            }
        };

    }

    //initialize and privatize class
    UploadFile = new UploadFile;

    //register attribute with brisk
    B_.registerAttr(UploadFile._attributeName, UploadFile.brUploadFile);

}($, B_)); //inject jQuery, Brisk dependancy
