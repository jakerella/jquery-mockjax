// load testswarm agent
(function() {
	var url = window.location.search;
	url = decodeURIComponent( url.slice( url.indexOf("swarmURL=") + 9 ) );
	if ( !url || url.indexOf("http") !== 0 ) {
		return;
	}

	// (Temporarily) Disable Ajax tests to reduce network strain
	isLocal = QUnit.isLocal = true;

	document.write("<scr" + "ipt src='http://swarm.amplifyjs.com/js/inject.js?" + (new Date).getTime() + "'></scr" + "ipt>");
})();
