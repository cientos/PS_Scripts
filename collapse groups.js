

function main(curDoc,curLayer){
	
	var isDone, s2t, waitForRedraw, win, windowResource;
	var curDoc = app.activeDocument;
	var curLayer = curDoc.activeLayer
	//var grabParent;

	// Shortcut function
	s2t = function(stringID) {
	  return app.stringIDToTypeID(stringID);
	};

	waitForRedraw = function() {
	  var d;
	  d = new ActionDescriptor();
	  d.putEnumerated(s2t('state'), s2t('state'), s2t('redrawComplete'));
	  return executeAction(s2t('wait'), d, DialogModes.NO);
	};

	//sentinel variable
	isDone = false;

    //window drawing

	windowResource= "palette{orientation: 'column', alignChildren: ['fill', 'top'],  preferredSize:[100, 10], text: 'BATCH RENAMER', margins:15, "+



	"} ";




	for(i=0; i<curLayer.layers.length; ++i){
		if(curLayer.layers[i].typename == "LayerSet"){
			curLayer.layers[i].merge()
		}else{
			0
		}
	}






	// don't forget this one!
	win.onClose = function() {
	  return isDone = true;
	};

	win.show();

	while (isDone === false) {
	  app.refresh(); // or, alternatively, waitForRedraw();
	}

};

app.activeDocument.suspendHistory("collapse groups", "main()");