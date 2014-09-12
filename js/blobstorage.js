
/*
*  Copyright (c) 2009 Harin Sandhoo
*  Permission is hereby granted, free of charge, to any person obtaining a copy of this 
*  software and associated documentation files (the "Software"), to deal in the Software 
*  without restriction, including without limitation the rights to use, copy, modify, 
*  merge, publish, distribute, sublicense, and/or sell copies of the Software, and to 
*  permit persons to whom the Software is furnished to do so, subject to the following 
*  conditions:
*
*  The above copyright notice and this permission notice shall be included in all copies
*  or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
*  INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
*  PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
*  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF 
*  CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE 
*  OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*
*
*
*  blobstorage.js 
*
*  Version:         1.0
*  Author:          Harin Sandhoo
*  Date:            August 25, 2009
*  Description:     This is a javascript implementation of a Windows Azure 
*                   BlobStorage client I am working on mainly as a learning exercise.  
*                   Please feel free to use and modify as you like, 
*                   but be forwarned it is a work in progress and I'm not
*                   guarenteeing it'll work / I'll keep it up to date / anything really.
*                   You'll need a reference to the jquery library when you use this, 
*                   I originally used jquery-1.3.2.js.  I also haven't tested 
*                   this very well yet so if something doesn't work, don't blame me.
*                   I'll be updating this occassionally implementing 
*                   additional methods as I get some free time.
*
*  -------------------------------------------------------------------------------------
*  REST BlobStorage methods implemented so far:
*  
*  Operations on the Account:       listContainers
*  Operations on Containers:        createContainer
*                                   getContainerProperties
*                                   setContainerMetaData
*                                   setContainerACL
*                                   getContainerACL
*                                   deleteContainer
*                                   listBlobs
*
*  Operations on Blobs:
*                                   getBlob
*                                   getBlobProperties
*                                   getBlobMetaData
*                                   setBlobMetaData
*                                   getBlockList  // 2009-04-14 version not implemeted since not available on dev storage.
*                                   deleteBlob
*
*
*  -------------------------------------------------------------------------------------
*  REST BlobStorage methods I still need to implement aka TBD but not sure when 
*  or even how:
*  
*  Operations on the Account:       
*  Operations on Containers:         
*  Operations on Blobs:             putBlob
*                                   putBlock
*                                   putBlockList
*                                   copyBlob  // Not available on dev storage yet.
*
*  -------------------------------------------------------------------------------------
*
*
*/








var BlobStorage = {

    /********************************************************************************
    *   Member variables and helper methods.
    ********************************************************************************/
    m_returnDataType: 'html',
    m_prefixForMetadata: 'x-ms-meta',
    m_publicAccessHeaderName: 'x-ms-prop-publicaccess',
    m_authorizationHeaderName: 'Authorization',

    getBaseUrl: function(accountName, localStorage) {
        return (true == localStorage) ?
            "http://127.0.0.1:10000" :
            "http://" + accountName + ".blob.core.windows.net";
    },

    getUri: function(accountName, uri, localStorage) {
        var retVal = "/";
        retVal += (true == localStorage) ? accountName : '';
        retVal += (uri == undefined || uri == null || '' == uri) ? '' : '/' + uri;
        return retVal;
    },

    getCurrentDate: function() {
        return (new Date()).toUTCString().replace('UTC', 'GMT');
    },

    getResourceString: function(accountName, uriPath, compParameter) {
        var retVal = "/" + accountName + uriPath;
        retVal += (compParameter == undefined || compParameter == null) ? '' : compParameter;
        return retVal;
    },

    /*
    *   buildSignature
    *   Creates the hashed authorization header for the request
    *
    *           VERB + "\n" +
    *           Content-MD5 + "\n" +
    *           Content-Type + "\n" +
    *           Date + "\n" +
    *           CanonicalizedHeaders + 
    *           CanonicalizedResource;
    */
    buildSignature: function(accountName, sharedKey, verb, contentMD5, contentType, requestDate, canonicalizedHeaders, canonicalizedResources) {

        var retVal = new Hash();

        var deckey = decode(sharedKey);

        var canonicalizedHeadersString = '';

        for (var hdr in canonicalizedHeaders.items) {
            canonicalizedHeadersString += hdr.toLowerCase() + ':' + canonicalizedHeaders.getItem(hdr) + '\n';
            retVal.setItem(hdr, canonicalizedHeaders.getItem(hdr));
        }

        var signature = verb + '\n' +
                        ((contentMD5 == undefined || contentMD5 == null) ? '' : contentMD5) + '\n' +
                        ((contentType == undefined || contentType == null) ? '' : contentType) + '\n' +
                        '\n' +
                        canonicalizedHeadersString +
                        canonicalizedResources;

        // Hash it
        HMAC_SHA256_init(deckey);
        HMAC_SHA256_write(signature);
        var mac = HMAC_SHA256_finalize();

        // Encode the hashed signature
        var encsignature = encodeBase64(array_to_string(mac));

        retVal.setItem(this.m_authorizationHeaderName, "SharedKey " + accountName + ":" + encsignature);
        return retVal;

    },

    setRequestHeaders: function(accountName, sharedKey, verb, contentMD5, contentType, additionalHeaders, canonicalizedResources) {

        // Add the date request header
        var requestDate = this.getCurrentDate();
        var canonicalizedHeaders = new Hash();
        canonicalizedHeaders.setItem('x-ms-date', requestDate);

        // sort the additional header keys
        var sortedArr = new Array();
        for (var h in additionalHeaders.keys) {
            sortedArr.push(h);
        }
        sortedArr = sortedArr.sort();

        for (var hdr in sortedArr) {
            var key = sortedArr[hdr];
            canonicalizedHeaders.setItem(key, additionalHeaders.getItem(key));
        }

        // Build the authorization header signature, this will sort the headers and add the authorization header.
        return this.buildSignature(accountName, sharedKey, verb, contentMD5, contentType, requestDate, canonicalizedHeaders, canonicalizedResources);
    },

    makeRestCall: function(verb, requestUrl, returnDataType, requestHeaders, success, error, complete) {
        $.ajax(
        {
            type: verb,
            url: requestUrl,
            dataType: returnDataType,
            beforeSend: function(hdr) {
                for (var hdrName in requestHeaders.keys.sort()) {
                    hdr.setRequestHeader(hdrName, requestHeaders.getItem(hdrName));
                }
            },
            success: function(data) {
                if (success != undefined && success != null) {
                    success(data);
                }
            },
            error: function(req, type, ex) {
                if (error != undefined && error != null) {
                    error(req, type, ex);
                }
                else {
                    throw ex;
                }
            },
            complete: function(hxdr, textStatus) {
                if (complete != undefined && complete != null) {
                    complete(hxdr, textStatus);
                }
            }
        });
    },

    /********************************************************************************
    *   Operations on the Account
    ********************************************************************************/

    /*
    *   listContainers
    *   Lists all of the containers in the given storage account.
    /// Todo:   Test the prefix, maxresults, and marker parameters
    /// Todo:   Test against non-local storage account
    */
    listContainers: function(accountName, sharedKey, localStorage, prefix, marker, maxresults, success, error) {

        var uriPath = this.getUri(accountName, null, localStorage);

        // Build the parameter string
        var compParam = "?comp=list";
        var parameters = compParam;
        parameters += (prefix == undefined || prefix == null) ? "" : "&prefix=" + prefix;
        parameters += (marker == undefined || marker == null) ? "" : "&marker=" + marker;
        parameters += (maxresults == undefined || maxresults == null) ? "" : "&maxresults=" + maxresults;


        // Set the values for the authorization headers aside from x-ms-date and Authorization
        var verb = 'GET';
        var additionalHeaders = new Hash();
        var canonicalizedResources = this.getResourceString(accountName, uriPath, compParam);

        // Build the request headers
        var requestHeaders = this.setRequestHeaders(accountName, sharedKey, verb, '', '', additionalHeaders, canonicalizedResources);

        // Build the request url
        var requestUrl = this.getBaseUrl(accountName, localStorage) + uriPath + parameters;

        // Make the request
        this.makeRestCall(verb, requestUrl, this.m_returnDataType, requestHeaders, success, error);
    },

    /********************************************************************************
    *   Operations on the Containers.
    ********************************************************************************/

    /*
    *   createContainer
    *   Creates a new container in the given storage account.
    *   Hash metaData:  A Hash object containing meta data key value pairs
    /// Todo:   Test the prefix, maxresults, and marker parameters
    /// Todo:   Test against non-local storage account
    /// Todo:   Add validation of container names (all lower case, etc);
    */
    createContainer: function(accountName, sharedKey, localStorage, containerName, metaData, publicAccess, success, error, complete) {
        var uriPath = this.getUri(accountName, containerName, localStorage);

        // Build the parameter string
        var compParam = "";
        var parameters = compParam;

        var verb = 'PUT';
        // Set the values for the authorization headers aside from x-ms-date and Authorization       
        var additionalHeaders = new Hash();
        // Set the meta data headers
        if (metaData != undefined && metaData != null) {
            for (var tag in metaData.items) {
                additionalHeaders.setItem(this.m_prefixForMetadata + '-' + tag, metaData.getItem(tag));
            }
        }
        // Set the public access header
        if (publicAccess != undefined && publicAccess != null) {
            additionalHeaders.setItem(this.m_publicAccessHeaderName, (publicAccess == true) ? 'True' : 'False');
        }
        var canonicalizedResources = this.getResourceString(accountName, uriPath, compParam);

        // Build the request headers
        var requestHeaders = this.setRequestHeaders(accountName, sharedKey, verb, '', '', additionalHeaders, canonicalizedResources);

        // Build the request url
        var requestUrl = this.getBaseUrl(accountName, localStorage) + uriPath + parameters;

        // Make the request
        this.makeRestCall(verb, requestUrl, this.m_returnDataType, requestHeaders, success, error, complete);

    },

    /*
    *   getContainerProperties
    *   Returns the user-defined metadata for this container.
    *   complete(Hash) :  A function delegate that takes a Hash as a parameter once the call is complete.
    /// Todo:   Test against non-local storage account
    */
    getContainerProperties: function(accountName, sharedKey, localStorage, containerName, success, error, complete, processResults) {

        var uriPath = this.getUri(accountName, containerName, localStorage);

        // Build the parameter string
        var compParam = "?comp=metadata";
        var parameters = compParam;

        // Set the values for the authorization headers aside from x-ms-date and Authorization
        var verb = 'GET';
        var additionalHeaders = new Hash();
        var canonicalizedResources = this.getResourceString(accountName, uriPath, compParam);

        // Build the request headers
        var requestHeaders = this.setRequestHeaders(accountName, sharedKey, verb, '', '', additionalHeaders, canonicalizedResources);

        // Build the request url
        var requestUrl = this.getBaseUrl(accountName, localStorage) + uriPath + parameters;


        var retVal = new Hash();
        // Make the request
        //this.makeSynchronousRestCall(verb, requestUrl, this.m_returnDataType, canonicalizedHeaders,
        this.makeRestCall(verb, requestUrl, this.m_returnDataType, requestHeaders, success, error,
            function(hxdr, textStatus) {

                var responseHeaderText = hxdr.getAllResponseHeaders();
                var responseHeaders = responseHeaderText.split("\n");
                for (var i = 0; i < responseHeaders.length; i++) {
                    var header = responseHeaders[i].split(":");
                    if (header[0].match(BlobStorage.m_prefixForMetadata) != null) {
                        var metaDataName = header[0].substring(BlobStorage.m_prefixForMetadata.length + 1, header[0].length);
                        retVal.setItem(metaDataName, header[1]);
                    }
                }

                // Give users a Hash of the results
                if (processResults != undefined && processResults != null) {
                    processResults(retVal);
                }

                // Allow callees access to the raw response headers
                if (complete != undefined && complete != null) {
                    complete(hxdr, textStatus);
                }
            }
        );
        return retVal;
    },

    /*
    *   setContainerMetaData
    *   Sets user-defined metadata for the container.
    *   Hash metaData:  A Hash object containing meta data key value pairs without the preceding x-ms-meta- prefix
    /// Todo:   Test against non-local storage account
    /// Todo:   Add validation of meta data names (all lower case, etc);
    /// Todo:   Add sorting of the meta data tags
    */
    setContainerMetaData: function(accountName, sharedKey, localStorage, containerName, metaData, success, error, complete) {
        var uriPath = this.getUri(accountName, containerName, localStorage);

        // Build the parameter string
        var compParam = "?comp=metadata";
        var parameters = compParam;

        // Set the values for the authorization headers aside from x-ms-date and Authorization
        var verb = 'PUT';
        var additionalHeaders = new Hash();
        // Set the values for the meta data headers
        if (metaData != undefined && metaData != null) {
            for (var tag in metaData.items) {
                additionalHeaders.setItem(this.m_prefixForMetadata + '-' + tag, metaData.getItem(tag));
            }
        }
        var canonicalizedResources = this.getResourceString(accountName, uriPath, compParam);

        // Build the request headers
        var requestHeaders = this.setRequestHeaders(accountName, sharedKey, verb, '', '', additionalHeaders, canonicalizedResources);

        // Build the request url
        var requestUrl = this.getBaseUrl(accountName, localStorage) + uriPath + parameters;

        // Make the request
        this.makeRestCall(verb, requestUrl, this.m_returnDataType, requestHeaders, success, error, complete);
    },

    /*
    *   getContainerACL
    *   Returns the ACL for this container.
    /// Todo:   Test against non-local storage account
    */
    getContainerACL: function(accountName, sharedKey, localStorage, containerName, success, error, complete, processResults) {
        var uriPath = this.getUri(accountName, containerName, localStorage);

        // Build the parameter string
        var compParam = "?comp=acl";
        var parameters = compParam;

        // Set the values for the authorization header
        // Set the values for the authorization headers aside from x-ms-date and Authorization
        var verb = 'GET';
        var additionalHeaders = new Hash();
        var canonicalizedResources = this.getResourceString(accountName, uriPath, compParam);

        // Build the request headers
        var requestHeaders = this.setRequestHeaders(accountName, sharedKey, verb, '', '', additionalHeaders, canonicalizedResources);

        // Build the request url
        var requestUrl = this.getBaseUrl(accountName, localStorage) + uriPath + parameters;

        // Make the request
        this.makeRestCall(verb, requestUrl, this.m_returnDataType, requestHeaders, success, error,
            function(hxdr, textStatus) {
                var publicResponse = new Boolean();
                var responseHeaderText = hxdr.getAllResponseHeaders();
                var responseHeaders = responseHeaderText.split("\n");
                for (var i = 0; i < responseHeaders.length; i++) {
                    var header = responseHeaders[i].split(":");
                    if (header[0].toLowerCase().match(BlobStorage.m_publicAccessHeaderName) != null) {
                        publicResponse = (header[1].toLowerCase().match("true") != null) ? true : false;
                    }
                }

                // Give users a Hash of the results
                if (processResults != undefined && processResults != null) {
                    processResults(publicResponse);
                }

                // Allow callees access to the raw response headers
                if (complete != undefined && complete != null) {
                    complete(hxdr, textStatus);
                }
            }
        );

    },

    /*
    *   setContainerACL
    *   Sets the ACL for the container.
    /// Todo:   Test the prefix, maxresults, and marker parameters
    /// Todo:   Test against non-local storage account
    */
    setContainerACL: function(accountName, sharedKey, localStorage, containerName, publicAccess, success, error, complete) {
        var uriPath = this.getUri(accountName, containerName, localStorage);

        // Build the parameter string
        var compParam = "?comp=acl";
        var parameters = compParam;

        var verb = 'PUT';
        // Set the values for the authorization headers aside from x-ms-date and Authorization       
        var additionalHeaders = new Hash();
        // Set the public access header
        if (publicAccess != undefined && publicAccess != null) {
            additionalHeaders.setItem(this.m_publicAccessHeaderName, (publicAccess == true) ? 'True' : 'False');
        }
        var canonicalizedResources = this.getResourceString(accountName, uriPath, compParam);

        // Build the request headers
        var requestHeaders = this.setRequestHeaders(accountName, sharedKey, verb, '', '', additionalHeaders, canonicalizedResources);

        // Build the request url
        var requestUrl = this.getBaseUrl(accountName, localStorage) + uriPath + parameters;

        // Make the request
        this.makeRestCall(verb, requestUrl, this.m_returnDataType, requestHeaders, success, error, complete);

    },

    /*
    *   deleteContainer
    *   Deletes the container and all of its blobs.
    /// Todo:   Test against non-local storage account
    */
    deleteContainer: function(accountName, sharedKey, localStorage, containerName, success, error, complete) {
        var uriPath = this.getUri(accountName, containerName, localStorage);

        // Build the parameter string
        var compParam = "";
        var parameters = compParam;

        // Set the values for the authorization header
        // Set the values for the authorization headers aside from x-ms-date and Authorization
        var verb = 'DELETE';
        var additionalHeaders = new Hash();
        var canonicalizedResources = this.getResourceString(accountName, uriPath, compParam);

        // Build the request headers
        var requestHeaders = this.setRequestHeaders(accountName, sharedKey, verb, '', '', additionalHeaders, canonicalizedResources);

        // Build the request url
        var requestUrl = this.getBaseUrl(accountName, localStorage) + uriPath + parameters;

        // Make the request
        this.makeRestCall(verb, requestUrl, this.m_returnDataType, requestHeaders, success, error, complete);

    },


    /*
    *   listContainerBlobs
    *   Lists all of the blobs in the given container.
    /// Todo:   Test the prefix, maxresults, and marker parameters
    /// Todo:   Test against non-local storage account
    */
    listBlobs: function(accountName, sharedKey, localStorage, containerName, prefix, delimeter, marker, maxresults, success, error, complete) {
        var uriPath = this.getUri(accountName, containerName, localStorage);

        // Build the parameter string
        var compParam = "?comp=list";

        var parameters = compParam;
        parameters += (prefix == undefined || prefix == null) ? "" : "&prefix=" + prefix;
        parameters += (delimeter == undefined || delimeter == null) ? "" : "&delimeter=" + delimeter;
        parameters += (marker == undefined || marker == null) ? "" : "&marker=" + marker;
        parameters += (maxresults == undefined || maxresults == null) ? "" : "&maxresults=" + maxresults;


        // Set the values for the authorization header
        // Set the values for the authorization headers aside from x-ms-date and Authorization
        var verb = 'GET';
        var additionalHeaders = new Hash();
        var canonicalizedResources = this.getResourceString(accountName, uriPath, compParam);

        // Build the request headers
        var requestHeaders = this.setRequestHeaders(accountName, sharedKey, verb, '', '', additionalHeaders, canonicalizedResources);

        // Build the request url
        var requestUrl = this.getBaseUrl(accountName, localStorage) + uriPath + parameters;

        // Make the request
        this.makeRestCall(verb, requestUrl, this.m_returnDataType, requestHeaders, success, error, complete);

    },

    /*
    *   getBlob
    *   Returns the blob's content, properties, and metadata.
    /// Todo:   Test the range parameter
    /// Todo:   Test against non-local storage account
    */
    getBlob: function(accountName, sharedKey, localStorage, containerName, blobName, range, success, error, complete) {
        var uriPath = this.getUri(accountName, containerName + "/" + blobName, localStorage);

        // Build the parameter string
        var compParam = "";

        var parameters = compParam;

        // Set the values for the authorization header
        // Set the values for the authorization headers aside from x-ms-date and Authorization
        var verb = 'GET';
        var additionalHeaders = new Hash();
        if (range != undefined && range != null) {
            additionalHeaders.setItem('Range', range);
        }
        var canonicalizedResources = this.getResourceString(accountName, uriPath, compParam);

        // Build the request headers
        var requestHeaders = this.setRequestHeaders(accountName, sharedKey, verb, '', '', additionalHeaders, canonicalizedResources);

        // Build the request url
        var requestUrl = this.getBaseUrl(accountName, localStorage) + uriPath + parameters;

        // Make the request
        this.makeRestCall(verb, requestUrl, this.m_returnDataType, requestHeaders, success, error, complete);

    },
    
    /*
    *   getBlobProperties
    *   Returns the blob's content, properties, and metadata.
    /// Todo:   Test the range parameter
    /// Todo:   Test against non-local storage account
    */
    getBlobProperties: function(accountName, sharedKey, localStorage, containerName, blobName, success, error, complete) {
        var uriPath = this.getUri(accountName, containerName + "/" + blobName, localStorage);

        // Build the parameter string
        var compParam = "";

        var parameters = compParam;

        // Set the values for the authorization header
        // Set the values for the authorization headers aside from x-ms-date and Authorization
        var verb = 'HEAD';
        var additionalHeaders = new Hash();
        var canonicalizedResources = this.getResourceString(accountName, uriPath, compParam);

        // Build the request headers
        var requestHeaders = this.setRequestHeaders(accountName, sharedKey, verb, '', '', additionalHeaders, canonicalizedResources);

        // Build the request url
        var requestUrl = this.getBaseUrl(accountName, localStorage) + uriPath + parameters;

        // Make the request
        this.makeRestCall(verb, requestUrl, this.m_returnDataType, requestHeaders, success, error, complete);

    },
    
        /*
    *   getBlobMetaData
    *   Returns the user-defined metadata for this blob.
    *   complete(Hash) :  A function delegate that takes a Hash as a parameter once the call is complete.
    /// Todo:   Test against non-local storage account
    */
    getBlobMetaData: function(accountName, sharedKey, localStorage, containerName, blobName, success, error, complete, processResults) {

        var uriPath = this.getUri(accountName, containerName + "/" + blobName, localStorage);

        // Build the parameter string
        var compParam = "?comp=metadata";
        var parameters = compParam;

        // Set the values for the authorization headers aside from x-ms-date and Authorization
        var verb = 'GET';
        var additionalHeaders = new Hash();
        var canonicalizedResources = this.getResourceString(accountName, uriPath, compParam);

        // Build the request headers
        var requestHeaders = this.setRequestHeaders(accountName, sharedKey, verb, '', '', additionalHeaders, canonicalizedResources);

        // Build the request url
        var requestUrl = this.getBaseUrl(accountName, localStorage) + uriPath + parameters;


        var retVal = new Hash();
        // Make the request
        //this.makeSynchronousRestCall(verb, requestUrl, this.m_returnDataType, canonicalizedHeaders,
        this.makeRestCall(verb, requestUrl, this.m_returnDataType, requestHeaders, success, error,
            function(hxdr, textStatus) {

                var responseHeaderText = hxdr.getAllResponseHeaders();
                var responseHeaders = responseHeaderText.split("\n");
                for (var i = 0; i < responseHeaders.length; i++) {
                    var header = responseHeaders[i].split(":");
                    if (header[0].match(BlobStorage.m_prefixForMetadata) != null) {
                        var metaDataName = header[0].substring(BlobStorage.m_prefixForMetadata.length + 1, header[0].length);
                        retVal.setItem(metaDataName, header[1]);
                    }
                }

                // Give users a Hash of the results
                if (processResults != undefined && processResults != null) {
                    processResults(retVal);
                }

                // Allow callees access to the raw response headers
                if (complete != undefined && complete != null) {
                    complete(hxdr, textStatus);
                }
            }
        );
        return retVal;
    },
    
    /*
    *   setBlobMetaData
    *   Sets user-defined metadata for the blob.
    *   Hash metaData:  A Hash object containing meta data key value pairs without the preceding x-ms-meta- prefix
    /// Todo:   Test against non-local storage account
    /// Todo:   Add validation of meta data names (all lower case, etc);
    /// Todo:   Add sorting of the meta data tags
    */
    setBlobMetaData: function(accountName, sharedKey, localStorage, containerName, blobName, metaData, success, error, complete) {

        var uriPath = this.getUri(accountName, containerName + "/" + blobName, localStorage);

        // Build the parameter string
        var compParam = "?comp=metadata";
        var parameters = compParam;

        // Set the values for the authorization headers aside from x-ms-date and Authorization
        var verb = 'PUT';
        var additionalHeaders = new Hash();
        // Set the values for the meta data headers
        if (metaData != undefined && metaData != null) {
            for (var tag in metaData.items) {
                additionalHeaders.setItem(this.m_prefixForMetadata + '-' + tag, metaData.getItem(tag));
            }
        }
        var canonicalizedResources = this.getResourceString(accountName, uriPath, compParam);

        // Build the request headers
        var requestHeaders = this.setRequestHeaders(accountName, sharedKey, verb, '', '', additionalHeaders, canonicalizedResources);

        // Build the request url
        var requestUrl = this.getBaseUrl(accountName, localStorage) + uriPath + parameters;

        // Make the request
        this.makeRestCall(verb, requestUrl, this.m_returnDataType, requestHeaders, success, error, complete);
    },
    
    /*
    *   getBlockList
    *   Returns the list of blocks for the blob.
    /// Todo:   Test against non-local storage account
    */
    getBlockList: function(accountName, sharedKey, localStorage, containerName, blobName, success, error, complete) {
        var uriPath = this.getUri(accountName, containerName + "/" + blobName, localStorage);

        // Build the parameter string
        var compParam = "?comp=blocklist";

        var parameters = compParam;

        // Set the values for the authorization header
        // Set the values for the authorization headers aside from x-ms-date and Authorization
        var verb = 'GET';
        var additionalHeaders = new Hash();
        var canonicalizedResources = this.getResourceString(accountName, uriPath, compParam);

        // Build the request headers
        var requestHeaders = this.setRequestHeaders(accountName, sharedKey, verb, '', '', additionalHeaders, canonicalizedResources);

        // Build the request url
        var requestUrl = this.getBaseUrl(accountName, localStorage) + uriPath + parameters;

        // Make the request
        this.makeRestCall(verb, requestUrl, this.m_returnDataType, requestHeaders, success, error, complete);

    },
    
    /*
    *   deleteBlob
    *   Deletes the blob.
    /// Todo:   Test against non-local storage account
    */
    deleteBlob: function(accountName, sharedKey, localStorage, containerName, blobName, success, error, complete) {
        var uriPath = this.getUri(accountName, containerName + "/" + blobName, localStorage);

        // Build the parameter string
        var compParam = "";
        var parameters = compParam;

        // Set the values for the authorization header
        // Set the values for the authorization headers aside from x-ms-date and Authorization
        var verb = 'DELETE';
        var additionalHeaders = new Hash();
        var canonicalizedResources = this.getResourceString(accountName, uriPath, compParam);

        // Build the request headers
        var requestHeaders = this.setRequestHeaders(accountName, sharedKey, verb, '', '', additionalHeaders, canonicalizedResources);

        // Build the request url
        var requestUrl = this.getBaseUrl(accountName, localStorage) + uriPath + parameters;

        // Make the request
        this.makeRestCall(verb, requestUrl, this.m_returnDataType, requestHeaders, success, error, complete);

    }
    


}






/*******************************************************************************************
Helper functions...From various sources on the web.
*******************************************************************************************/

// TODO:  Add reference for this section.

function urlDecode(str) {
str = str.replace(new RegExp('\\+', 'g'), ' ');
return unescape(str);
}
function urlEncode(str) {
str = escape(str);
str = str.replace(new RegExp('\\+', 'g'), '%2B');
return str.replace(new RegExp('%20', 'g'), '+');
}

var END_OF_INPUT = -1;

var base64Chars = new Array(
'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
'w', 'x', 'y', 'z', '0', '1', '2', '3',
'4', '5', '6', '7', '8', '9', '+', '/'
);

var reverseBase64Chars = new Array();
for (var i = 0; i < base64Chars.length; i++) {
reverseBase64Chars[base64Chars[i]] = i;
}

var base64Str;
var base64Count;
function setBase64Str(str) {
base64Str = str;
base64Count = 0;
}
function readBase64() {
if (!base64Str) return END_OF_INPUT;
if (base64Count >= base64Str.length) return END_OF_INPUT;
var c = base64Str.charCodeAt(base64Count) & 0xff;
base64Count++;
return c;
}
function encodeBase64(str) {
setBase64Str(str);
var result = '';
var inBuffer = new Array(3);
var lineCount = 0;
var done = false;
while (!done && (inBuffer[0] = readBase64()) != END_OF_INPUT) {
inBuffer[1] = readBase64();
inBuffer[2] = readBase64();
result += (base64Chars[inBuffer[0] >> 2]);
if (inBuffer[1] != END_OF_INPUT) {
result += (base64Chars[((inBuffer[0] << 4) & 0x30) | (inBuffer[1] >> 4)]);
if (inBuffer[2] != END_OF_INPUT) {
result += (base64Chars[((inBuffer[1] << 2) & 0x3c) | (inBuffer[2] >> 6)]);
result += (base64Chars[inBuffer[2] & 0x3F]);
} else {
result += (base64Chars[((inBuffer[1] << 2) & 0x3c)]);
result += ('=');
done = true;
}
} else {
result += (base64Chars[((inBuffer[0] << 4) & 0x30)]);
result += ('=');
result += ('=');
done = true;
}
lineCount += 4;
if (lineCount >= 76) {
result += ('\n');
lineCount = 0;
}
}
return result;
}
function readReverseBase64() {
if (!base64Str) return END_OF_INPUT;
while (true) {
if (base64Count >= base64Str.length) return END_OF_INPUT;
var nextCharacter = base64Str.charAt(base64Count);
base64Count++;
if (reverseBase64Chars[nextCharacter]) {
return reverseBase64Chars[nextCharacter];
}
if (nextCharacter == 'A') return 0;
}
return END_OF_INPUT;
}

function ntos(n) {
n = n.toString(16);
if (n.length == 1) n = "0" + n;
n = "%" + n;
return unescape(n);
}

function decodeBase64(str) {
setBase64Str(str);
var result = "";
var inBuffer = new Array(4);
var done = false;
while (!done && (inBuffer[0] = readReverseBase64()) != END_OF_INPUT
&& (inBuffer[1] = readReverseBase64()) != END_OF_INPUT) {
inBuffer[2] = readReverseBase64();
inBuffer[3] = readReverseBase64();
result += ntos((((inBuffer[0] << 2) & 0xff) | inBuffer[1] >> 4));
if (inBuffer[2] != END_OF_INPUT) {
result += ntos((((inBuffer[1] << 4) & 0xff) | inBuffer[2] >> 2));
if (inBuffer[3] != END_OF_INPUT) {
result += ntos((((inBuffer[2] << 6) & 0xff) | inBuffer[3]));
} else {
done = true;
}
} else {
done = true;
}
}
return result;
}

var digitArray = new Array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f');
function toHex(n) {
var result = ''
var start = true;
for (var i = 32; i > 0; ) {
i -= 4;
var digit = (n >> i) & 0xf;
if (!start || digit != 0) {
start = false;
result += digitArray[digit];
}
}
return (result == '' ? '0' : result);
}

function pad(str, len, pad) {
var result = str;
for (var i = str.length; i < len; i++) {
result = pad + result;
}
return result;
}

function encodeHex(str) {
var result = "";
for (var i = 0; i < str.length; i++) {
result += pad(toHex(str.charCodeAt(i) & 0xff), 2, '0');
}
return result;
}

var hexv = {
"00": 0, "01": 1, "02": 2, "03": 3, "04": 4, "05": 5, "06": 6, "07": 7, "08": 8, "09": 9, "0A": 10, "0B": 11, "0C": 12, "0D": 13, "0E": 14, "0F": 15,
"10": 16, "11": 17, "12": 18, "13": 19, "14": 20, "15": 21, "16": 22, "17": 23, "18": 24, "19": 25, "1A": 26, "1B": 27, "1C": 28, "1D": 29, "1E": 30, "1F": 31,
"20": 32, "21": 33, "22": 34, "23": 35, "24": 36, "25": 37, "26": 38, "27": 39, "28": 40, "29": 41, "2A": 42, "2B": 43, "2C": 44, "2D": 45, "2E": 46, "2F": 47,
"30": 48, "31": 49, "32": 50, "33": 51, "34": 52, "35": 53, "36": 54, "37": 55, "38": 56, "39": 57, "3A": 58, "3B": 59, "3C": 60, "3D": 61, "3E": 62, "3F": 63,
"40": 64, "41": 65, "42": 66, "43": 67, "44": 68, "45": 69, "46": 70, "47": 71, "48": 72, "49": 73, "4A": 74, "4B": 75, "4C": 76, "4D": 77, "4E": 78, "4F": 79,
"50": 80, "51": 81, "52": 82, "53": 83, "54": 84, "55": 85, "56": 86, "57": 87, "58": 88, "59": 89, "5A": 90, "5B": 91, "5C": 92, "5D": 93, "5E": 94, "5F": 95,
"60": 96, "61": 97, "62": 98, "63": 99, "64": 100, "65": 101, "66": 102, "67": 103, "68": 104, "69": 105, "6A": 106, "6B": 107, "6C": 108, "6D": 109, "6E": 110, "6F": 111,
"70": 112, "71": 113, "72": 114, "73": 115, "74": 116, "75": 117, "76": 118, "77": 119, "78": 120, "79": 121, "7A": 122, "7B": 123, "7C": 124, "7D": 125, "7E": 126, "7F": 127,
"80": 128, "81": 129, "82": 130, "83": 131, "84": 132, "85": 133, "86": 134, "87": 135, "88": 136, "89": 137, "8A": 138, "8B": 139, "8C": 140, "8D": 141, "8E": 142, "8F": 143,
"90": 144, "91": 145, "92": 146, "93": 147, "94": 148, "95": 149, "96": 150, "97": 151, "98": 152, "99": 153, "9A": 154, "9B": 155, "9C": 156, "9D": 157, "9E": 158, "9F": 159,
"A0": 160, "A1": 161, "A2": 162, "A3": 163, "A4": 164, "A5": 165, "A6": 166, "A7": 167, "A8": 168, "A9": 169, "AA": 170, "AB": 171, "AC": 172, "AD": 173, "AE": 174, "AF": 175,
"B0": 176, "B1": 177, "B2": 178, "B3": 179, "B4": 180, "B5": 181, "B6": 182, "B7": 183, "B8": 184, "B9": 185, "BA": 186, "BB": 187, "BC": 188, "BD": 189, "BE": 190, "BF": 191,
"C0": 192, "C1": 193, "C2": 194, "C3": 195, "C4": 196, "C5": 197, "C6": 198, "C7": 199, "C8": 200, "C9": 201, "CA": 202, "CB": 203, "CC": 204, "CD": 205, "CE": 206, "CF": 207,
"D0": 208, "D1": 209, "D2": 210, "D3": 211, "D4": 212, "D5": 213, "D6": 214, "D7": 215, "D8": 216, "D9": 217, "DA": 218, "DB": 219, "DC": 220, "DD": 221, "DE": 222, "DF": 223,
"E0": 224, "E1": 225, "E2": 226, "E3": 227, "E4": 228, "E5": 229, "E6": 230, "E7": 231, "E8": 232, "E9": 233, "EA": 234, "EB": 235, "EC": 236, "ED": 237, "EE": 238, "EF": 239,
"F0": 240, "F1": 241, "F2": 242, "F3": 243, "F4": 244, "F5": 245, "F6": 246, "F7": 247, "F8": 248, "F9": 249, "FA": 250, "FB": 251, "FC": 252, "FD": 253, "FE": 254, "FF": 255
};

function decodeHex(str) {
str = str.toUpperCase().replace(new RegExp("s/[^0-9A-Z]//g"));
var result = "";
var nextchar = "";
for (var i = 0; i < str.length; i++) {
nextchar += str.charAt(i);
if (nextchar.length == 2) {
result += ntos(hexv[nextchar]);
nextchar = "";
}
}
return result;

}


//http://www.faqts.com/knowledge_base/view.phtml/aid/1748

var base64s =
"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function encode(decStr) {
decStr = escape(decStr); 	//line add for chinese char
var bits, dual, i = 0, encOut = '';
while (decStr.length >= i + 3) {
bits =
(decStr.charCodeAt(i++) & 0xff) << 16 |
(decStr.charCodeAt(i++) & 0xff) << 8 |
decStr.charCodeAt(i++) & 0xff;
encOut +=
base64s.charAt((bits & 0x00fc0000) >> 18) +
base64s.charAt((bits & 0x0003f000) >> 12) +
base64s.charAt((bits & 0x00000fc0) >> 6) +
base64s.charAt((bits & 0x0000003f));
}
if (decStr.length - i > 0 && decStr.length - i < 3) {
dual = Boolean(decStr.length - i - 1);
bits =
((decStr.charCodeAt(i++) & 0xff) << 16) |
(dual ? (decStr.charCodeAt(i) & 0xff) << 8 : 0);
encOut +=
base64s.charAt((bits & 0x00fc0000) >> 18) +
base64s.charAt((bits & 0x0003f000) >> 12) +
(dual ? base64s.charAt((bits & 0x00000fc0) >> 6) : '=') +
'=';
}
return encOut
}

function decode(encStr) {
var bits, decOut = '', i = 0;
for (; i < encStr.length; i += 4) {
bits =
(base64s.indexOf(encStr.charAt(i)) & 0xff) << 18 |
(base64s.indexOf(encStr.charAt(i + 1)) & 0xff) << 12 |
(base64s.indexOf(encStr.charAt(i + 2)) & 0xff) << 6 |
base64s.indexOf(encStr.charAt(i + 3)) & 0xff;
decOut += String.fromCharCode(
(bits & 0xff0000) >> 16, (bits & 0xff00) >> 8, bits & 0xff);
}
if (encStr.charCodeAt(i - 2) == 61)
undecOut = decOut.substring(0, decOut.length - 2);
else if (encStr.charCodeAt(i - 1) == 61)
undecOut = decOut.substring(0, decOut.length - 1);
else undecOut = decOut;

return unescape(undecOut); 	//line add for chinese 
char
}



/*
*  jssha256 version 0.1  -  Copyright 2006 B. Poettering
*
*  This program is free software; you can redistribute it and/or
*  modify it under the terms of the GNU General Public License as
*  published by the Free Software Foundation; either version 2 of the
*  License, or (at your option) any later version.
*
*  This program is distributed in the hope that it will be useful,
*  but WITHOUT ANY WARRANTY; without even the implied warranty of
*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
*  General Public License for more details.
*
*  You should have received a copy of the GNU General Public License
*  along with this program; if not, write to the Free Software
*  Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA
*  02111-1307 USA
*/

/*
* http://point-at-infinity.org/jssha256/
*
* This is a JavaScript implementation of the SHA256 secure hash function
* and the HMAC-SHA256 message authentication code (MAC).
*
* The routines' well-functioning has been verified with the test vectors 
* given in FIPS-180-2, Appendix B and IETF RFC 4231. The HMAC algorithm 
* conforms to IETF RFC 2104. 
*
* The following code example computes the hash value of the string "abc".
*
*    SHA256_init();
*    SHA256_write("abc");
*    digest = SHA256_finalize();  
*    digest_hex = array_to_hex_string(digest);
* 
* Get the same result by calling the shortcut function SHA256_hash:
* 
*    digest_hex = SHA256_hash("abc");
* 
* In the following example the calculation of the HMAC of the string "abc" 
* using the key "secret key" is shown:
* 
*    HMAC_SHA256_init("secret key");
*    HMAC_SHA256_write("abc");
*    mac = HMAC_SHA256_finalize();
*    mac_hex = array_to_hex_string(mac);
*
* Again, the same can be done more conveniently:
* 
*    mac_hex = HMAC_SHA256_MAC("secret key", "abc");
*
* Note that the internal state of the hash function is held in global
* variables. Therefore one hash value calculation has to be completed 
* before the next is begun. The same applies the the HMAC routines.
*
* Report bugs to: jssha256 AT point-at-infinity.org
*
*/

/******************************************************************************/

/* Two all purpose helper functions follow */

/* string_to_array: convert a string to a character (byte) array */

function string_to_array(str) {
    var len = str.length;
    var res = new Array(len);
    for (var i = 0; i < len; i++)
        res[i] = str.charCodeAt(i);
    return res;
}

function array_to_string(arr) {
    var len = arr.length;
    var res = "";
    for (var i = 0; i < len; i++)
        res += String.fromCharCode(arr[i]);
    return res;
}

/* array_to_hex_string: convert a byte array to a hexadecimal string */

function array_to_hex_string(ary) {
    var res = "";
    for (var i = 0; i < ary.length; i++)
        res += SHA256_hexchars[ary[i] >> 4] + SHA256_hexchars[ary[i] & 0x0f];
    return res;
}

/******************************************************************************/

/* The following are the SHA256 routines */

/* 
SHA256_init: initialize the internal state of the hash function. Call this
function before calling the SHA256_write function.
*/

function SHA256_init() {
    SHA256_H = new Array(0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19);
    SHA256_buf = new Array();
    SHA256_len = 0;
}

/*
SHA256_write: add a message fragment to the hash function's internal state. 
'msg' may be given as string or as byte array and may have arbitrary length.

*/

function SHA256_write(msg) {
    if (typeof (msg) == "string")
        SHA256_buf = SHA256_buf.concat(string_to_array(msg));
    else
        SHA256_buf = SHA256_buf.concat(msg);
    for (var i = 0; i + 64 <= SHA256_buf.length; i += 64)
        SHA256_Hash_Byte_Block(SHA256_H, SHA256_buf.slice(i, i + 64));
    SHA256_buf = SHA256_buf.slice(i);
    SHA256_len += msg.length;
}

/*
SHA256_finalize: finalize the hash value calculation. Call this function
after the last call to SHA256_write. An array of 32 bytes (= 256 bits) 
is returned.
*/

function SHA256_finalize() {
    SHA256_buf[SHA256_buf.length] = 0x80;

    if (SHA256_buf.length > 64 - 8) {
        for (var i = SHA256_buf.length; i < 64; i++)
            SHA256_buf[i] = 0;
        SHA256_Hash_Byte_Block(SHA256_H, SHA256_buf);
        SHA256_buf.length = 0;
    }

    for (var i = SHA256_buf.length; i < 64 - 5; i++)
        SHA256_buf[i] = 0;
    SHA256_buf[59] = (SHA256_len >>> 29) & 0xff;
    SHA256_buf[60] = (SHA256_len >>> 21) & 0xff;
    SHA256_buf[61] = (SHA256_len >>> 13) & 0xff;
    SHA256_buf[62] = (SHA256_len >>> 5) & 0xff;
    SHA256_buf[63] = (SHA256_len << 3) & 0xff;
    SHA256_Hash_Byte_Block(SHA256_H, SHA256_buf);

    var res = new Array(32);
    for (var i = 0; i < 8; i++) {
        res[4 * i + 0] = SHA256_H[i] >>> 24;
        res[4 * i + 1] = (SHA256_H[i] >> 16) & 0xff;
        res[4 * i + 2] = (SHA256_H[i] >> 8) & 0xff;
        res[4 * i + 3] = SHA256_H[i] & 0xff;
    }

    delete SHA256_H;
    delete SHA256_buf;
    delete SHA256_len;
    return res;
}

/*
SHA256_hash: calculate the hash value of the string or byte array 'msg' 
and return it as hexadecimal string. This shortcut function may be more 
convenient than calling SHA256_init, SHA256_write, SHA256_finalize 
and array_to_hex_string explicitly.
*/

function SHA256_hash(msg) {
    var res;
    SHA256_init();
    SHA256_write(msg);
    res = SHA256_finalize();
    return array_to_hex_string(res);
}

/******************************************************************************/

/* The following are the HMAC-SHA256 routines */

/*
HMAC_SHA256_init: initialize the MAC's internal state. The MAC key 'key'
may be given as string or as byte array and may have arbitrary length.
*/

function HMAC_SHA256_init(key) {
    if (typeof (key) == "string")
        HMAC_SHA256_key = string_to_array(key);
    else
        HMAC_SHA256_key = new Array().concat(key);

    if (HMAC_SHA256_key.length > 64) {
        SHA256_init();
        SHA256_write(HMAC_SHA256_key);
        HMAC_SHA256_key = SHA256_finalize();
    }

    for (var i = HMAC_SHA256_key.length; i < 64; i++)
        HMAC_SHA256_key[i] = 0;
    for (var i = 0; i < 64; i++)
        HMAC_SHA256_key[i] ^= 0x36;
    SHA256_init();
    SHA256_write(HMAC_SHA256_key);
}

/*
HMAC_SHA256_write: process a message fragment. 'msg' may be given as 
string or as byte array and may have arbitrary length.
*/

function HMAC_SHA256_write(msg) {
    SHA256_write(msg);
}

/*
HMAC_SHA256_finalize: finalize the HMAC calculation. An array of 32 bytes
(= 256 bits) is returned.
*/

function HMAC_SHA256_finalize() {
    var md = SHA256_finalize();
    for (var i = 0; i < 64; i++)
        HMAC_SHA256_key[i] ^= 0x36 ^ 0x5c;
    SHA256_init();
    SHA256_write(HMAC_SHA256_key);
    SHA256_write(md);
    for (var i = 0; i < 64; i++)
        HMAC_SHA256_key[i] = 0;
    delete HMAC_SHA256_key;
    return SHA256_finalize();
}

/*
HMAC_SHA256_MAC: calculate the HMAC value of message 'msg' under key 'key'
(both may be of type string or byte array); return the MAC as hexadecimal 
string. This shortcut function may be more convenient than calling 
HMAC_SHA256_init, HMAC_SHA256_write, HMAC_SHA256_finalize and 
array_to_hex_string explicitly.
*/

function HMAC_SHA256_MAC(key, msg) {
    var res;
    HMAC_SHA256_init(key);
    HMAC_SHA256_write(msg);
    res = HMAC_SHA256_finalize();
    return array_to_hex_string(res);
}

/******************************************************************************/

/* The following lookup tables and functions are for internal use only! */

SHA256_hexchars = new Array('0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  'a', 'b', 'c', 'd', 'e', 'f');

SHA256_K = new Array(
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
  0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
  0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
  0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
  0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
  0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
);

function SHA256_sigma0(x) {
    return ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
}

function SHA256_sigma1(x) {
    return ((x >>> 17) | (x << 15)) ^ ((x >>> 19) | (x << 13)) ^ (x >>> 10);
}

function SHA256_Sigma0(x) {
    return ((x >>> 2) | (x << 30)) ^ ((x >>> 13) | (x << 19)) ^
    ((x >>> 22) | (x << 10));
}

function SHA256_Sigma1(x) {
    return ((x >>> 6) | (x << 26)) ^ ((x >>> 11) | (x << 21)) ^
    ((x >>> 25) | (x << 7));
}

function SHA256_Ch(x, y, z) {
    return z ^ (x & (y ^ z));
}

function SHA256_Maj(x, y, z) {
    return (x & y) ^ (z & (x ^ y));
}

function SHA256_Hash_Word_Block(H, W) {
    for (var i = 16; i < 64; i++)
        W[i] = (SHA256_sigma1(W[i - 2]) + W[i - 7] +
      SHA256_sigma0(W[i - 15]) + W[i - 16]) & 0xffffffff;
    var state = new Array().concat(H);
    for (var i = 0; i < 64; i++) {
        var T1 = state[7] + SHA256_Sigma1(state[4]) +
      SHA256_Ch(state[4], state[5], state[6]) + SHA256_K[i] + W[i];
        var T2 = SHA256_Sigma0(state[0]) + SHA256_Maj(state[0], state[1], state[2]);
        state.pop();
        state.unshift((T1 + T2) & 0xffffffff);
        state[4] = (state[4] + T1) & 0xffffffff;
    }
    for (var i = 0; i < 8; i++)
        H[i] = (H[i] + state[i]) & 0xffffffff;
}

function SHA256_Hash_Byte_Block(H, w) {
    var W = new Array(16);
    for (var i = 0; i < 16; i++)
        W[i] = w[4 * i + 0] << 24 | w[4 * i + 1] << 16 |
      w[4 * i + 2] << 8 | w[4 * i + 3];
    SHA256_Hash_Word_Block(H, W);
}


// From http://www.mojavelinux.com/articles/javascript_hashes.html
function Hash()
{
	this.length = 0;
	this.items = new Array();
	this.keys = new Array();
	
	for (var i = 0; i < arguments.length; i += 2) {
		if (typeof(arguments[i + 1]) != 'undefined') {
		    this.items[arguments[i]] = arguments[i + 1];
		    this.keys[arguments[i]] = arguments[i + 1];
			this.length++;
		}
	}

	this.removeItem = function(in_key) {
	    var tmp_previous;
	    if (typeof (this.items[in_key]) != 'undefined') {
	        this.length--;
	        var tmp_previous = this.items[in_key];
	        delete this.items[in_key];
	        delete this.keys[in_key];
	    }

	    return tmp_previous;
	}

	this.getItem = function(in_key) {
		return this.items[in_key];
	}

	this.setItem = function(in_key, in_value) {
	    var tmp_previous;
	    if (typeof (in_value) != 'undefined') {
	        if (typeof (this.items[in_key]) == 'undefined') {
	            this.length++;
	            this.keys[in_key] = in_key;
	        }
	        else {
	            tmp_previous = this.items[in_key];
	        }

	        this.items[in_key] = in_value;
	    }

	    return tmp_previous;
	}

	this.hasItem = function(in_key)
	{
		return typeof(this.items[in_key]) != 'undefined';
	}

	this.clear = function() {
	    for (var i in this.items) {
	        delete this.items[i];
	    }
	    for (var j in this.keys) {
	        delete this.keys[j];
	    }

	    this.length = 0;
	}

}
