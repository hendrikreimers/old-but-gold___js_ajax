
// Variablen (Global)
var url   = 'http://localhost/'; // URL
var color = '#FFFFFF';                // Farbe
var ajax  = new Ajax();               // AJAX Instanz



// Listener hinzufügen
ajax.addListener('onRequestComplete',ajax.REQUEST_COMPLETE);



// Ergebnis schreiben in <div id="result"></div>
function writeResult(str) {
	// Instanzen
	var div = document.getElementById('result'); // Result DIV
	var date = new Date();                       // Zeitstempel

	// Neue HTML Elemente erstellen
	var ts   = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds(); // String: Zeitstempel
	var el   = document.createElement('div');                                       // Neues DIV für Inhalte
	var txt  = document.createTextNode(ts + ' :: ' + str);                          // Text in Div

	// Neue HTML Elemente zusammenführen
	el.style.backgroundColor = color;
	el.appendChild(txt);                           // Text neuen DIV zuweisen
	
	// Ergebnis zu Result DIV hinzufügen
	div.appendChild(el);
}



// Aktion für Link A
function actionA() {
	// AJAX Anfrage senden
	ajax.sendRequest(url + 'xml1.xml','POST','ident_A');
}

// Aktion für Link B
function actionB() {
	// AJAX Anfrage senden
	ajax.sendRequest(url + 'xml2.xml','GET');
}



// Event Listener
function onRequestComplete(e) {
	// XML Objekt definieren (e = AJAX Instanz, e.target = Result Objekt)
	var xml = e.target.xml;

	// Farbe festlegen
	color = ( (e.target.callFunc == 'actionA') || (e.target.identifier == 'ident_A') ) ? '#FFFFFF' : '#CCCCCC';

	// Daten aus XML auslesen
	var str = xml.getElementsByTagName('ajax').item(0).getElementsByTagName('result').item(0).firstChild.data;

	// Ergebnis hinzufügen
	writeResult(str);
}
