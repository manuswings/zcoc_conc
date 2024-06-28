/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"lamzcoc_conc/zcoc_conc/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
