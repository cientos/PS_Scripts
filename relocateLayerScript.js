
//RELOCATE LAYER
//------------------------------------------------------------------------------------------------------------------------------
function main(){
    var isDone, s2t, waitForRedraw, win, windowResource;
    var curDoc = app.activeDocument;
    var curLayer = app.activeDocument.activeLayer;

    var padre;
    var sourceTree = [];
    var targetTree = [];

    var layerOrigInfo = [];
    var layerTargetInfo = [];

    var sourceStored = false
    var targetStored = false

    var placeOnTop = true;

    var dupLayer = 0;


    //curDoc.suspendHistory("move layer to target", main());

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



    //----------------function for storage of current layer info

    function sourceLayerInfo(layer){
      if (sourceStored == false){
        var origName = layer.name;
        var originalID = layer.id;
        //var randomName = Math.random();
        //layer.name = randomName;

        padre = layer.parent;

        do {
          sourceTree.push(padre);
          padre = padre.parent;
          sourceTree.push(padre);
        }while(padre.typename === "LayerSet");

        sourceTree.reverse();

        layerOrigInfo = [origName,originalID]

        return layerOrigInfo;
        return sourceTree;
      }else{return;}
    }

    //----------------function for storage of current layer info

    function getTargetLayer(layer){
      if(targetStored == false){
        var targetName = layer.name;
        var originalTargetID = layer.id;
        //var randomTargetName = Math.random();
        //layer.name = randomTargetName;
        padre = layer.parent;

        do {
          targetTree.push(padre);
          padre = padre.parent;
          targetTree.push(padre);
        }while(padre.typename === "LayerSet");

        targetTree.reverse();

        layerTargetInfo = [targetName,originalTargetID,targetTree]
        return layerTargetInfo;
        return targetTree;
      }else{return;}
    }


    //----------------function for deciding wether to move the layer, on top or under
    function topOrUnder(result){
      result = result.toString();
      var whereToPlace = result.substr(6,6)
      if(whereToPlace === "ON TOP"){
       // alert(whereToPlace)
        placeOnTop = true;
      }else if (whereToPlace === "UNDER "){
        //alert(whereToPlace)
        placeOnTop = false;
      }
      return placeOnTop;
    };


    //----------------function for moving layer to target layer

    function moveSourceLayer(sourceName,sourceId,sourceTree,targetName,targetId,targetTree,duplication){
      var sourceLength = sourceTree.length -1;
      var sourcePath = sourceTree[sourceLength]

      var targetLength = targetTree.length -1;
      var targetPath = targetTree[targetLength]

      var sourceLayer = sourcePath.layers.getByName(sourceName);
      //alert(sourceLayer)
      var targetLayer = targetPath.layers.getByName(targetName);

      if(duplication == 1){//--------------------------------------------------------------------------------------------------------CHECKS IF THE DUPLICATE BOX IS CHECKED, AND DUPLICATES THE SOURCE LAYER
        var layerDup = sourceLayer.duplicate(sourceLayer,ElementPlacement.PLACEAFTER);
        layerDup.name = sourceLayer.name;
        if(sourceLayer.id === sourceId && targetLayer.id === targetId){
          if(placeOnTop === true){
            sourceLayer.move(targetLayer,ElementPlacement.PLACEBEFORE);
            sourceLayer.name = sourceLayer.name + " duplicate";
          }else if (placeOnTop == false){
            sourceLayer.move(targetLayer,ElementPlacement.PLACEAFTER);
            sourceLayer.name = sourceLayer.name + " duplicate";
          }
        }else{(alert("error. discrepancies getting the layers"))}
      }else{ //--------------------------------------------------------------------------------------------------------IF THE DUPLICATE BOX IS NOT CHECKED, JUST MOVES THE SOURCE LAYER
        if(sourceLayer.id === sourceId && targetLayer.id === targetId){
          if(placeOnTop === true){
            sourceLayer.move(targetLayer,ElementPlacement.PLACEBEFORE);
          }else if (placeOnTop == false){
             sourceLayer.move(targetLayer,ElementPlacement.PLACEAFTER);
          }
        }else{(alert("error. discrepancies getting the layers"))}}


       /* var sourceLayer = curDoc.layer.getByName(layerOrigInfo[0]);
        if(sourceLayer.id === layerOrigInfo[1]){
            if(placeOnTop === true){
                sourceLayer.move(target,ElementPlacement.PLACEBEFORE);
            }else{
                sourceLayer.move(target,ElementPlacement.PLACEAFTER);
            };

        }else{alert("error!")}*/

      return isDone = true;
    };


    windowResource = "palette {  orientation: 'column', alignChildren: ['fill', 'center'], preferredSize:[100, 10], text: 'RELOCATE LAYER', margins:15, "+
          "sourcePanel: Panel { orientation: 'column', alignChildren: 'left', margins:15, text: ' Select layer to move ',"+
            "l1: Button { text: 'store selected layer', properties:{name:'store'}, size: [120,24], alignment:['left', 'center'] },"+
            "cb: Checkbox { text:'duplicate and move', value: false }"+
          "}"+

        "targetPanel: Panel { orientation: 'column', alignChildren: 'left', margins:15, text: ' Select target layer ', "+
            "layertarget: Button { text: 'store target layer', properties:{name:'target'}, size: [120,24], alignment:['left', 'center'] }, "+
            "rb1: RadioButton { text:'place ON TOP of target', value: true }, "+
            "rb2: RadioButton { text:'place UNDER target', value: false }"+
        ",}"+


        "middleGroup: Group{ orientation: 'row', alignChildren: 'fill', text: ' options ', "+
             "clearButton: Button { text: 'clear fields', properties:{name:'clear'}, alignment:['left', 'fill'], value: false },"+
             "infoButton: Button { text: 'info', properties:{name:'info'}, size:[35,24], alignment:['right', 'fill']},"+
        "} "+

        " bottomGroup: Group{"+
              "cancelButton: Button { text: 'Close', properties:{name:'cancel'}, size: [120,24], alignment:['left', 'center'] },"+
              "applyButton: Button { text: 'Apply', properties:{name:'ok'}, size: [120,24], alignment:['left', 'center'] }, "+
        "}"+   
    "}";

    win = new Window(windowResource);


    // Button listeners. 
    //-----------------------------------------------------------------------SOURCE PANEL
    win.sourcePanel.l1.onClick = function() {//-----SOURCE LAYER BUTTON
      if(sourceStored === false){
        sourceLayerInfo(app.activeDocument.activeLayer)
        return sourceStored = true;
      }else{
        alert("error! source layer is already stored!")
        return
      }
    };
    win.sourcePanel.cb.onClick = function(){//-----DUPLICATE SOURCE LAYER
      if(win.sourcePanel.cb.value === true){
        dupLayer = 1;
        //alert(dupLayer)
      }else{dupLayer = 0};
      return dupLayer;
    };

    win.middleGroup.clearButton.onClick = function(){//-----CLEAR LAYER STORAGE
      targetStored = false;
      sourceStored = false;
      return targetStored;
      return sourceStored;
    };

    win.middleGroup.infoButton.onClick = function(){
        alert("RELOCATE LAYER SCRIPT. By Juan Gargallo \r\r"+
          " This script allows you to move a layer from one position to another within your document layer stack.\r\r"+
          " - It is specially useful whan working with layer-heavy and multiple nested-folder files.\r\r "+
          " - The checkbox 'duplicate and lets you keep the original layer and make a copy wherever you want within your stack'.\r\r"+
          " - HOW TO USE IT:\r\r"+
          " - STEP 1: select the layer you want to move and press 'Grab source layer'\r\r"+
          " - STEP 2: select the layer adjacent to where you want your source to be. You can choose wether you want it placed on top of it, or below.\r\r"+
          " - STEP 3: press 'Apply'\r\r"+
          " - Additionaly, you can choose to duplicate the layer instead of moving it, and clear the fields, if you have made a mistake in selecting either the source or the destination")
    };
    //------------------------------------------------------------------------TARGET PANEL
    win.targetPanel.layertarget.onClick = function() {//-----TARGET STORE BUTTON
      var curId = app.activeDocument.activeLayer.id;
        if(curId === layerOrigInfo[1]){
          alert("Source and target layers cannot be the same")
          return;
        }else if (curId !== layerOrigInfo[1]){
         if(targetStored === false){
            getTargetLayer(app.activeDocument.activeLayer);
            //alert(win.targetPanel.layertarget.type)
            return targetStored = true;
          }else{
            alert("error! target layer is already stored!")
            return;
          }
        }else{alert("something's broke. Fix it madafaca")}
    };
    /*
    win.targetPanel.rb1.onClick = function(){
      for(i=0; i<win.targetPanel.)
    };*/

    // returns the option for placement selected, wether is on top or under 
    win.targetPanel.addEventListener('click', function(event) {
        for (var i = 0; i < win.targetPanel.children.length; i++) {
          if (win.targetPanel.children[i].value == true) {
            var rbText = win.targetPanel.children[i].text;
            /*
            rbText = rbText.substr(6,6);
            alert(rbText)
            if (rbText === "ON TOP"){
              placeOnTop = true;
            }else if (rbtext === "UNDER "){
              placeOnTop = false;
            }else{return -1}*/
          topOrUnder(rbText)
          }
          //return placeOnTop;
        }
    });




    //------------------------------------------------------------------------BOTTOM GROUP

    win.bottomGroup.cancelButton.onClick = function() {//-----CANCEL BUTTON
      //alert("target name is " + layerTargetInfo[0])
      return isDone = true;
    };
    win.bottomGroup.applyButton.onClick = function() {//-----APPLY BUTTON
      //alert("source name is " + layerOrigInfo[0]);
      if(sourceStored == true && targetStored == true){
        moveSourceLayer(layerOrigInfo[0],layerOrigInfo[1],sourceTree,layerTargetInfo[0],layerTargetInfo[1],targetTree,dupLayer);
        return isDone = true;
      }else if(sourceStored == false && targetStored == true){
        alert("please define a source layer to move")
        return;
      }else if(sourceStored == true && targetStored == false){
        alert("please define a target layer")
        return;
      }else if(sourceStored == false && targetStored == false){
        alert("please select source and target layers");
        return;
      }
    };

    // don't forget this one!
    win.onClose = function() {
      return isDone = true;
    };

    win.show();

    while (isDone === false) {
      app.refresh(); // or, alternatively, waitForRedraw();
    }
};

app.activeDocument.suspendHistory("RELOCATE LAYER", "main()");