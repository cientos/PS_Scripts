//---BATCH RENAMER---
//OBJETIVOS: RENOMBRAS CAPAS, DE UN DOCUMENTO O DE UN GRUPO, CON UN PREFIJO, UN NÚMERO DE INICIO, UN SUFIJO, Y UN NÚMERO DE PADDING
function main(){

	//main variables
	var isDone, s2t, waitForRedraw, win, windowResource;
	var curDoc = app.activeDocument;
	var curLayer = curDoc.activeLayer
	var grabParent;

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

	windowResource= "palette{orientation: 'column', alignChildren: ['fill', 'top'],  preferredSize:[100, 10], text: 'BATCH RENAMER V0.5', margins:15, "+

				           "mainPanel: Panel { orientation: 'column', alignChildren: 'fill', margins:15, text: ' MAIN OPTIONS ',"+
									"mainOptions: Group {orientation: 'row',  alignChildren: 'fill', margins:5, text: ' group options ',"+
										"grab1: Button { text: 'use group name', properties:{name:'store'}, size: [120,24], alignment:['left', 'center'] },"+
										"count_up_RB: RadioButton { text:'count up', value: true, enabled: true }, "+
										"count_down_RB: RadioButton { text:'count down', value: false, enabled: true }, "+
									"}, "+

									"groupOptions: Group {orientation: 'row',  alignChildren: 'center', margins:5, text: ' group options ',"+

															"ignoreSubs_CB: Checkbox { text:'ignore subfolders', value: true, enabled: false },"+
															"allGroup_CB: Checkbox { text:'process all layers in group', value: true, enabled: false }, "+
									"}, "+

									"clippedPanel: Panel {orientation: 'row', alignChildren: 'left', margins:10, text: ' masked layers ',"+
										"clippedCB: Checkbox { text:'rename also masked layers', value: false }, "+
										"clipped_input: EditText{ text: 'clipped', enabled: false} } "+
									" },"+

									"prefixPanel: Panel {orientation: 'row', alignChildren: ['left','center'], margins:10, text: ' Prefix ', "+
										" prefixCB: Checkbox { text:'', value: false }, "+
										"prefix_input: EditText { text: '', enabled: false, properties:{name:'prefix'}, size: [120,24], alignment:['left', 'center'] }, "+
										"separator_tag: StaticText{text:'separator'}, separator_prefix: EditText { text:'_', enabled: false, }, "+
									"} "+

									"numPanel: Panel {orientation: 'row', alignChildren: ['left', 'center'], margins:10, text: ' numbering ', "+
										"numCB: Checkbox { text:'', value: true }, "+
										"num_tag: StaticText{ text: 'starting number'}, "+
										"num_input: EditText { text: '1', enabled: true, properties:{name:'prefix'}, size: [35,24], alignment:['left','bottom'] }, "+
										"padding_tag: StaticText{text:'padding'}, "+
										"padding_input: DropDownList { text:'padding value', enabled: true, size: [65,24], properties: {items:[1,2,3,4,5], value: '2'} }, "+
									"} "+

									"suffixPanel: Panel {orientation: 'row', alignChildren: ['left', 'center'] margins:10, text: ' Suffix ',"+
										"suffixCB: Checkbox { text:'', value: false }, "+
										"suffix_input: EditText { text: '', enabled: false, properties:{name:'suffix'}, size: [120,24], alignment:['left', 'center'] },"+
										"separator_tag: StaticText{text:'separator'}, "+
										"separator_suffix: EditText { text:'_', enabled: false },"+
									"} "+

									"middleGroup: Group{ "+
										"clearButton: Button { text: 'clear fields', properties:{name:'clear'}, alignment:['left', 'fill'], value: false }, "+
									"} "+

									"bottomGroup: Group{ "+
										"cancelButton: Button { text: 'Close', properties:{name:'cancel'}, size: [120,24], alignment:['left', 'center'] },"+
										"applyButton: Button { text: 'Apply', properties:{name:'ok'}, size: [120,24], alignment:['left', 'center'] }, "+
										"info1: Button { text: 'info', size: [24,24], alignment:['right', 'center'] },"+

							"} "+
			         "} ";



	win = new Window(windowResource);




	//Defaults

	win.prefixPanel.prefix_input.enabled = false
	win.suffixPanel.suffix_input.enabled = false
	win.mainPanel.clippedPanel.clipped_input.text = "clipped"
	win.numPanel.padding_input.selection = 1;
	
    // function definitions


	/*
	selectLayerById(98); //select this layer only  
	selectLayerById(80,true); //select this layer along with other selected layers  

	function selectLayerById(id,add, curLayer){   
    	var ref = new ActionReference();  
    	ref.putIdentifier(charIDToTypeID('Lyr '), id);  
    	var desc = new ActionDescriptor();  
    	desc.putReference(charIDToTypeID("null"), ref );  
    	if(add) desc.putEnumerated( stringIDToTypeID( "selectionModifier" ), stringIDToTypeID( "selectionModifierType" ), stringIDToTypeID( "addToSelection" ) );   
    	desc.putBoolean( charIDToTypeID( "MkVs" ), false );   
    	try{  
    	executeAction(charIDToTypeID("slct"), desc, DialogModes.NO );  
    	}catch(e){}  
    	curLayer = curDoc.activeLayer
    	return curLayer
	};*/



	function grabFolderInfo(){// toma el nombre del grupo para el prefijo. Si lo seleccionado es una capa, toma el nombre dle grupo padre. Si no están dentro de un grupo, devuelve undefined
		var curLayer = app.activeDocument.activeLayer;
		if(curLayer.typename == "LayerSet"){
			grabParent = {"nombre": curLayer.name, "identif": curLayer.id};

		}else if (curLayer.typename == "ArtLayer" && curLayer.parent.typename == "LayerSet"){
			grabParent = {"nombre": curLayer.parent.name, "identif": curLayer.parent.id};
		}else if (curLayer.typename == "ArtLayer" && curLayer.parent.typename == "Document"){
			//grabParent = {"nombre": undefined, "identif": undefined};
			alert("error! the layers to process must be contained in a folder.")
			return isDone = true
		}else{grabParent = {"nombre": undefined, "identif": undefined}}

		//selectLayerById(grabParent.identif,0,curLayer)

		return curLayer, grabParent;
	};






	function rename_batch(curLayer, closeWindow){//------------AQUI SE EJECUTA EL SCRIPT PRINCIPAL, AL HACER CLICK EN APPLY. SI TODO ESTÁ EN ORDEN LLAMA A LA FUNCIÓN renaming_loop

		var padding_result = "";

		var prefix = {"check" : win.prefixPanel.prefix_input.enabled, "text" : win.prefixPanel.prefix_input.text, "separator" : win.prefixPanel.separator_prefix.text}//comprueba si prefix está activo y sus inputs

		var clipped = {"check": win.mainPanel.clippedPanel.clipped_input.enabled, "text" : win.mainPanel.clippedPanel.clipped_input.text, "separator": win.prefixPanel.separator_prefix.text}

		var suffix = {"check" : win.suffixPanel.suffix_input.enabled, "text" : win.suffixPanel.suffix_input.text, "separator" : win.suffixPanel.separator_suffix.text}//comprueba si suffix está activo y sus inputs
		
		var count = {"init" : win.numPanel.num_input.text, "pad" : win.numPanel.padding_input.selection}//comprueba los valores de numeracion y padding

		function renaming_loop(curLayer, prefix, suffix, clipped, count){ //loop que ejecuta el renombrado de las capas

			for (i=0; i<curLayer.layers.length; ++i){

					if(curLayer.layers[i].grouped){
						curLayer.layers[i].name = prefix.text + prefix.separator + clipped.text + clipped.separator + padding_result + count.init + suffix.separator + suffix.text
					}
					else{
						curLayer.layers[i].name = prefix.text + prefix.separator + padding_result + count.init + suffix.separator + suffix.text
						if(win.mainPanel.mainOptions.count_up_RB.value == true){
							count.init++;}
						else { count.init--}
					}
				}
				return;
		};

		if(prefix.text == undefined || suffix.text == undefined || padding_result == undefined){
			alert("error: please check your input fields")
			return
		}
		if (prefix.check == false){
			prefix.text = ''
			prefix.separator = ''
		}
		if (suffix.check == false){
			suffix.text = ''
			suffix.separator = ''
		}
		if (clipped.check == false){
			clipped.text = ''
			clipped.separator = ''
		}

		for(j = 0;j<=count.pad;++j){// establece el padding correcto
			padding_result = padding_result + "0"
		}

		if(curLayer.typename == "LayerSet"){
			renaming_loop(curLayer, prefix, suffix, clipped, count)
			closeWindow = true
		}
		else if(curLayer.typename =="ArtLayer"){
			if(curLayer.parent.typename == "Document"){
				alert("the layers to process must be contained in a folder")
				closeWindow = false;
			return;
			};
			else if(curLayer.parent.typename == "LayerSet"){
				curLayer = curLayer.parent;

				renaming_loop(curLayer, prefix, suffix, clipped, count)
				closeWindow = true
			};
		};
		return closeWindow;
	};




	// Button listeners. 
	//--------------------------------------------------------------------------------main options

	win.mainPanel.mainOptions.grab1.onClick = function() {//-----tomar el prefix de la carpeta contenedora
		grabFolderInfo()
		win.prefixPanel.prefix_input.enabled = true;
		win.prefixPanel.prefixCB.value = true;

		win.prefixPanel.separator_prefix.enabled = true;
		win.prefixPanel.prefix_input.text = grabParent.nombre;
	};
	win.bottomGroup.info1.onClick = function() {//-----tomar el prefix de la carpeta contenedora
			alert("WELCOME TO THE BATCH RENAMER TOOL V0.5!\r\r For it to work properly, you have to get the layers you want to rename inside a folder.\r\r "+
				"· If no folder is present, it will show you an error.\r\r"+
				"· Count up and down specifies if your consecutive layers will be adding or substracting from your initial input number. \r"+
				"· 'Mask layers' are the ones that are afecting only a layer below them (marked with a corner arrow)."+
				"You can set a specific name for those. They will be numbered as the parent layer ")
		};

	win.mainPanel.clippedPanel.clippedCB.onClick = function(){
		win.mainPanel.clippedPanel.clipped_input.enabled = win.mainPanel.clippedPanel.clippedCB.value;
	};

	//--------------------------------------------------------------------------------input panel
	win.prefixPanel.prefixCB.onClick = function() {//-----prefix
		win.prefixPanel.prefix_input.enabled = win.prefixPanel.prefixCB.value 
		win.prefixPanel.separator_prefix.enabled = win.prefixPanel.prefixCB.value 
	};

	win.suffixPanel.suffixCB.onClick = function() {//-----suffix
		win.suffixPanel.suffix_input.enabled = win.suffixPanel.suffixCB.value 
		win.suffixPanel.separator_suffix.enabled = win.suffixPanel.suffixCB.value 
	};

	win.numPanel.padding_input.onClick = function() {//-----numbering
		var myList = [1,2,3,4,5]
		win.numPanel.padding_input.items = myList;
	};
	//---------------------------------------------------------------------------------middle group

	win.middleGroup.clearButton.onClick = function(){//-----CLEAR fields
	  	grabParent = undefined;

	  	win.prefixPanel.prefix_input.text = '';
	  	win.suffixPanel.suffix_input.text = '';
		win.prefixPanel.separator_prefix.text = '';
	  	win.suffixPanel.separator_suffix.text = '';
	  	win.numPanel.num_input.text = '';
	};


	//BOTTOM GROUP

	win.bottomGroup.cancelButton.onClick = function() {//-----CANCEL BUTTON
	  return isDone = true;
	};
	win.bottomGroup.applyButton.onClick = function() {//-----APPLY BUTTON		
		rename_batch(curLayer, isDone);
  		return isDone = true;

	};

	win.onDeactivate = function(){
		return isDone = true
	}


	//-----------------------------------------------------------------------WINDOW CLOSING
	// don't forget this one!
	win.onClose = function() {
	  return isDone = true;
	};

	win.show();

	while (isDone === false) {
	  app.refresh(); // or, alternatively, waitForRedraw();
	}
};

app.activeDocument.suspendHistory("batch renamer", "main()");

