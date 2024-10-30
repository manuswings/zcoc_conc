/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"lamzcoc/zcoc/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
