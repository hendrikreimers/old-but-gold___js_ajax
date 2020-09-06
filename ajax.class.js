
//
//	AJAX JavaScript v2.3
//	von Hendrik Reimers
//
//	Internet: www.kern23.de
//
//
//	BESCHREIBUNG:
//	Wer schon immer mal AJAX (Asynchronous JavaScript and XML) benutzen wollte,
//	kann es hiermit ein bisschen leichter. Es gibt zwar schon 1000 Klassen für PHP etc.
//	aber ich möchte nur das nötigste zur Verfügung stellen um es den Benutzer flexibel zu lassen.
//
//	Mit der neuen Version der JavaScript AJAX Funktionen wurden meine Funktionen in eine Klasse verschachtelt.
//	Des Weiteren ist es nicht mehr nötig jedesmal eine Callback Funktion anzugeben die aufgerufen wird sobald
//	das HTTP Request vollständig wurde.
//	
//	Ab jetzt kann man über addListener() und removeListener() Funktionen angeben die aufgerufen werden nachdem
//	der HTTP Request durchgeführt wurde oder bevor er los geht oder wenn dieser fehlerhaft war.
//	Dadurch ist es möglich mehrere Funktionen aufzurufen und die Strukturierung des JS Codes dürfte dadurch etwas
//	leichter fallen.
//	
//	Zudem wurde das Ergebnis Objekt, welches an die Listener Funktion übergeben wird überarbeitet.
//	Man erhält jetzt ein Objekt mit TEXT und XML anstatt nur XML. Beispiel: obj.target.text ODER obj.target.xml
//  
//  SAMPLE XML FILE:
//  <ajax>
//    <result>Some Strings</result>
//  </ajax>
//  
//  USAGE:
//  var ajax = new Ajax();
//  
//  ajax.addListener('onRequestStart',ajax.REQUEST_START);
//  ajax.addListener('onRequestComplete',ajax.REQUEST_COMPLETE);
//  ajax.addListener('onRequestError',ajax.REQUEST_ERROR);
//  
//  // Some samples to call the Request Function
//  ajax.sendRequest('http://theurl.de/file.xml','GET');
//  ajax.sendRequest('http://theurl.de/file.xml','GET','myRequestIdentifierString');
//  ajax.sendRequest('http://theurl.de/file.xml','POST');
//  ajax.sendRequest('http://theurl.de/file.xml','POST','myRequestIdentifierString');
//  ajax.sendRequest('http://theurl.de/file.xml','POST','myRequestIdentifierString','additionalPostDataString');
//  
//  function onRequestComplete(e) {
//  	var ajaxObj    = e;                   // The Ajax Object (so you could remove the listener like: e.removeListener('onRequestComplete',e.REQUEST_COMPLETE);
//  	var xml        = e.target.xml;        // The XML Object
//  	var txt        = e.target.text;       // The XML Object as String
//  	var url        = e.target.url;        // The Request URL
//  	var callFunc   = e.target.callFunc;   // The Function which called the Request
//  	var identifier = e.target.identifier; // The String to identify your Request, if callFunc doesn't work
//  	
//  	// ... Do something with the data ;-)
//  	var str = xml.getElementsByTagName('ajax').item(0).getElementsByTagName('result').item(0).firstChild.data;
//  	alert(str);
//  }
//  

function Ajax() {
	
	/* PUBLIC VARIBLES */
	/* -------------------------------------------------------------------------------------------------------------- */
	
	this.REQUEST_START    = String('START');
	this.REQUEST_COMPLETE = String('STOP');
	this.REQUEST_ERROR    = String('ERROR');
	
	
	
	/* PRIVATE VARIABLES */
	/* -------------------------------------------------------------------------------------------------------------- */
	
	var self             = this;         // Workaround fuer Private Funktionen um auf "this." zugreifen zu koennen
	var listeners        = new Object(); // Array aller Listener
	
	// Listener registrieren
	listeners.requestStart    = new Array();
	listeners.requestComplete = new Array();
	listeners.requestError    = new Array();
	
	
	
	/* PUBLIC FUNCTIONS */
	/* -------------------------------------------------------------------------------------------------------------- */
	
	// Callback Funktionen hinzufügen
	this.addListener = function(func,type) {
		switch ( type.toUpperCase() ) {
			case this.REQUEST_START:
				listeners.requestStart.push(func);
				break;
			case this.REQUEST_COMPLETE:
				listeners.requestComplete.push(func);
				break;
			case this.REQUEST_ERROR:
				listeners.requestError.push(func);
				break;
		}
	}
	
	// Callback Funktionen aus der Liste entfernen
	this.removeListener = function(func,type) {
		var newListeners = new Array();
		
		switch ( type.toUpperCase() ) {
			case this.REQUEST_START:
				for ( var i = 0; i < listeners.requestStart.length; i++ ) {
					var curListener = listeners.requestStart[i];
					if ( curListener != func ) {
						newListeners.push(func);
					}
				}
				
				listeners.requestStart = newListeners;
				
				break;
				
			case this.REQUEST_COMPLETE:
				for ( var i = 0; i < listeners.requestComplete.length; i++ ) {
					var curListener = listeners.requestComplete[i];
					
					if ( curListener != func ) {
						newListeners.push(func);
					}
				}
				
				listeners.requestComplete = newListeners;
				
				break;
				
			case this.REQUEST_ERROR:
				for ( var i = 0; i < listeners.requestError.length; i++ ) {
					var curListener = listeners.requestError[i];
					
					if ( curListener != func ) {
						newListeners.push(func);
					}
				}
				
				listeners.requestError = newListeners;
				
				break;
		}
	}
	
	// Aufruf der AJAX Anfrage je nach GET oder POST
	this.sendRequest = function(url,reqType,identifier,postData) {
		var callFunc = String(callerName(this.sendRequest.caller));

		switch ( reqType.toUpperCase() ) {
			case 'GET':
				sendGETRequest(url,callFunc,identifier);
				break;
			case 'POST':
				sendPOSTRequest(url,callFunc,identifier,postData);
				break;
		}
	}
	
	
	
	/* PRIVATE FUNCTIONS */
	/* -------------------------------------------------------------------------------------------------------------- */
	
	//Sendet eine HTTP Anfrage mittels GET, das Ergebnis wird an eine Callback Funktion übergeben
	function sendGETRequest(url,callFunc,identifier) {
		// HINWEIS: Die xmlHTTP Instanz wird erst hier deklariert anstatt gleich zuvor,
		// weil in vielen Browsern die Instanz Ihre Gültigkeit ziemlich schnell verliert
		// und es damit nur noch zum Teil funktioniert
	
		// Listener Response vorbereiten
		var response = new Object();
		response.url        = url;
		response.callFunc   = callFunc;
		response.identifier = identifier;

		// Start Request Listener Funktionen aufrufen
		dispatchEvent(self.REQUEST_START,response);
	
		//Instanz deklarieren
		var xmlHTTP = createRequestObj();

		//Request absetzen
		xmlHTTP.onreadystatechange = function() { processResponse(xmlHTTP,callFunc,identifier,url); } // Ereignis Funktion angeben
		xmlHTTP.open('GET',url,true);                                                          // Ziel öffnen
		xmlHTTP.send(null);                                                                    // Request senden
	}
	
	
	//Sendet eine HTTP Anfrage mittels POST, das Ergebnis wird an eine Callback Funktion übergeben
	function sendPOSTRequest(url,callFunc,identifier,postData) {
		// HINWEIS: Die xmlHTTP Instanz wird erst hier deklariert anstatt gleich zuvor,
		// weil in vielen Browsern die Instanz Ihre Gültigkeit ziemlich schnell verliert
		// und es damit nur noch zum Teil funktioniert

  		// Listener Response vorbereiten
		var response = new Object();
		response.url        = url;
		response.callFunc   = callFunc;
		response.identifier = identifier;

		// Start Request Listener Funktionen aufrufen
		dispatchEvent(self.REQUEST_START,response);

		//Instanz deklarieren
		var xmlHTTP = createRequestObj();
	
		//Request absetzen
		xmlHTTP.onreadystatechange = function() { processResponse(xmlHTTP,callFunc,identifier,url); } // Ereignis Funktion angeben
		xmlHTTP.open('POST',url);                                                              // Ziel öffnen
		xmlHTTP.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');         // POST Typ angeben
		xmlHTTP.send(postData);                                                                // Request senden
	}
	
	//Erstellt das HTTP Objekt
	function createRequestObj() {
		//Werte zurücksetzen
		var http_request = false;
		
		//Instanz erstellen
		if (window.XMLHttpRequest) {
			//Instanz für Firefox, Mozilla, Safari, Opera, usw.
			http_request = new XMLHttpRequest();
		
			//MIME Typ erzwingen
			if (http_request.overrideMimeType) {
				http_request.overrideMimeType('text/xml');
			}
		} else if (window.ActiveXObject) {
			//Instanz für IE (eine von 2 Möglichkeiten probieren)
			try {
				//Instanz: Möglichkeit 1
				http_request = new ActiveXObject("Msxml2.XMLHTTP");
			} catch (e) {
				try {
					//Instanz: Möglichkeit 2
					http_request = new ActiveXObject("Microsoft.XMLHTTP");
				} catch (e) {}
			}
		}
		
		//Bei fehlerhafter Instanzierung, Meldung!
		if (!http_request) {
			alert('AJAX Error!\nCannot create an XMLHTTP instance');
		} else {
			//Ergebnis liefern
			return http_request;
		}
	}
	
	//Verarbeiten der HTTP Antwort
	function processResponse(xmlHTTP,callFunc,identifier,url) {
		//Übertragung abgeschlossen?
		if (xmlHTTP.readyState == 4) {
			// Übertragung OK?
			if (xmlHTTP.status == 200) {
				// Response Objekt vorbereiten
				var response = new Object();
				
				// Response Daten speichern
				response.text       = xmlHTTP.responseText;
				response.xml        = xmlHTTP.responseXML;
				response.callFunc   = callFunc;
				response.identifier = identifier;
				response.url        = url;
				
				// Aufruf der Callback Funktionen der Listener	
				dispatchEvent(self.REQUEST_COMPLETE,response);
			} else {
				//Fehlermeldung
				dispatchEvent(self.REQUEST_ERROR,'');
			}
		}
	}
	
	// Event Auslöser
	function dispatchEvent(reqType,params) {
		switch ( reqType.toUpperCase() ) {
			case self.REQUEST_START:
				var curL = listeners.requestStart;
				break;
			case self.REQUEST_COMPLETE:
				var curL = listeners.requestComplete;
				break;
			case self.REQUEST_ERROR:
				var curL = listeners.requestError;
				break;
		}

		for ( var i = 0; i < curL.length; i++ ) {
			var callbackFuncName = curL[i];
			
			if (typeof window[callbackFuncName] == 'function') {
				var e = self;
				e.target = params;

				window[callbackFuncName](e);
			}
		}
	}
	
	// Gibt den Funktionsnamen des Funktions callers zurück
	// USAGE: callerName(myFunc.caller);
	function callerName(callerFunc) {
		if ( callerFunc == null ) { return false; }
		
		var str    = String(callerFunc);
		
		if ( str.length > 0 ) {
			var expr   = /function (.*[^ ])(.*\(.*)/;
			var result = expr.exec(str);
	
			return ( result != null ) ? result[1] : false;
		} else return false;
	}
	
}
