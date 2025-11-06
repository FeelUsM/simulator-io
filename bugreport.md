This bugreport was sent to `bug@simulator.io`,  but I haven't get any response.

steps to reproduce:

1) create anonimus board
1) draw 1 wire line
1) click link
1) update web page
1) continue that wire line
1) try  to select end point of this line

result: will be selected only half of that wire
expected result: will be selected whole wire
 
Also I have suggestion to fix this bug:
in `editorcontroller.js` replace
```
		logicApp.system.board.storage.importAll(result.data);
```
with
```
        logicApp.system.board.storage.importAll(result.data,isSnapshot);
```
 
and in `boardstorage.js` replace `importAll` function wurh:
```
	this.importAll = function(obj, isSnapshot)
    {
        if(obj.s == false) // not initialized yet, this must be an empty board
        {
            if(system) // client only
            {
                system.transaction.reset(); // delete all old things
            }
 
            return;
        }
 
        if(    this.elementsGlo.length != 0 ||
            this.wiresGlo.length != 0 ||
            this.diodesGlo.length != 0 ||
            this.textsGlo.length != 0)
        {
            console.error("ERROR\tBoard is not empty");
            return;
        }
 
        if(system) // client only
        {
            system.transaction.start(0, 0, true);
        }
        
        // add wires
        for(var i = 0; i < obj.w.length; i++)
        {
            this.pushWire( this.importWire(obj.w[i], isSnapshot) );
        }
        
        // all diodes
        for(var i = 0; i < obj.d.length; i++)
        {
            this.pushDiode( this.importDiode(obj.d[i], isSnapshot) );
        }
        
        // all element
        for(var i = 0; i < obj.e.length; i++)
        {
            this.pushElement( this.importElement(obj.e[i], isSnapshot) );
        }
 
        // all text nodes
        for(var i = 0; i < obj.t.length; i++)
        {
            this.pushText( this.importText(obj.t[i], isSnapshot) );
        }
        
        if(system) // client only
        {
            system.transaction.commit();
            system.transaction.reset(); // delete all old things (undo/redo stack)
        }
    }
```
