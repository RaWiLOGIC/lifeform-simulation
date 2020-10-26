/** RaWi-TS-Project: Life form simulation Version 1.0
*   TypeScript-File: ./_ts-en/lfs-en.ts
*   JavaSript-File:  ./js/lfs-en.js
*   CSS-File:        ./css/lfs.min.css
*/
/** Global Vars */
// Canvas
var canvasCenter:Point;          // Canvas-Center
var canvasWidth:number;          // Canvas-Width (is evaluated)
var canvasHeight:number;         // Canvas-Height (is evaluated)
// Life forms
var arrayLF:Array<any> = [];     // Array of life forms [objekt, centerPoint, cIndex (0 = female, 1 = male)]
var numLFs:number = 6;           // Number of life forms at the start of the simulation (Minimum 4 LFs)
var numFemale:number;            // Number of female life forms
var numMale:number;              // Number of male life forms
var lifeTime:number = 100;       // Lifetime of life forms (basic time, a random value is added)
// Color array life form: fill color, stroke color (defined by cIndex)
var arrayColors = [['255,80,210','255,80,210'],['55,176,255','55,176,255']];
// Blocks (obstacles)
var arrayBlock:Array<any>;       // Array of blocks [objekt, centerPoint]
// Foods
var arrayFood:Array<any>;        // Array of foods [objekt, centerPoint]
// Color array Foods: fill color (depending on the current growState 0 to 3)
// growState 0: inedible (dodge), growState 1: sprouts (dodge)
// growState 2: grows / matures (dodge),  growState 3: ripe (edible)
var arrayFColors = ['96,96,96','72,130,75','46,177,52','0,226,11'];
// Simulation control
var simulation:any;              // Variable of the timer (is used to stop the simulation)
var zaehler:number = 0;          // running counter (can be used for events such as growth etc.)
var activeLifeforms:number = 0;  // Number of active life forms
var tickTime:number = 50;        // Timer interval of the simulation in ms
var stopTime:number = 30;        // Time until the simulation stops (activeLifeforms <= 3 / pairing not possible)
var stopFlag:boolean;            // Flag to stop the simulation if all LFs are of the same gender
var timeIntervall:number;        // Interval for calculating the simulation duration
var sStunde:number = 0;          // Duration of the simulation hours
var sMinute:number = 0;          // Duration of the simulation minutes
var sSekunde:number = 0;         // Duration of the simulation seconds
var timeString:string;           // String time display
/** Class LF-Simulation */
class LFsimulation {
  /** Properties */
  canvasdiv:HTMLElement;
  canvas:any;
  ctx:CanvasRenderingContext2D;
  canvasdimension:number;
  canvasBackground:string;
  canvasWidth:number;
  canvasHeight:number;
  canvasCenter:Point;
  timeDisplay:HTMLElement;
  lfDisplay:HTMLElement;
  endDisplay:HTMLElement;
  /** Constructor */
  constructor( {
    canvasDiv = 'canvasdiv',
    canvas = 'cnv'
  } : {
    canvasDiv?:string;
    canvas?:string;
  }
  ) {
    // Global Element-Reference
    this.canvasdiv = document.getElementById(canvasDiv);
    // Canvas-Reference
    this.canvas = document.getElementById(canvas);
    // RenderingContext
    this.ctx = this.canvas.getContext("2d");
    // Canvas-Parameter (determine the height and width depending on canvas)
    canvasWidth = this.canvas.getBoundingClientRect().width;
    canvasHeight = this.canvas.getBoundingClientRect().height;
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;
    canvasCenter = new Point(canvasWidth / 2, canvasHeight / 2);
    // Background color Canvas
    this.canvasBackground = '#000';
    // Div time display
    this.timeDisplay = document.getElementById('timedisplay');
    // Div display number of life forms
    this.lfDisplay = document.getElementById('lfdisplay');
    // Div display for end of simulation
    this.endDisplay = document.getElementById('enddisplay');
  }
  /** Initialization Blocks */
  public initBlocks() {
    //console.log('FUNCTION initBlocks');
    // Array Blocks
    arrayBlock = [];
    // Block-Number
    var bNum:number = 0;
    // Create blocks (grid)
    for (var i = 1; i <= 4; i++) {
      for (var j = 1; j <= 4; j++) {
        //console.log('Creating Block ',bNum);
        // Calculate Center-Point of block
        var x = canvasWidth / 5 * i - canvasWidth / 2;
        var y = canvasHeight / 5 * j - canvasHeight / 2;
        var center = new Point(x,y);
        //console.log('Block-CenterPoint '+bNum+': ',center);
        var b = new Block(center, 1.4, 1.4, 0, i);
        arrayBlock[bNum] = [b, center];
        bNum += 1;
      }
    }
    /* Create blocks (random Center-Points)
    for (var i = 9; i < numBlocks; i++) {
      //console.log('Creating Block ',i);
      // Randomly set the center point of the block
      var center = getRandompoint();
      console.log('Block-CenterPoint '+i+': ',center);
      var b = new Block(center, 2, 2, 0, i);
      arrayBlock[i] = [b, center];
      //console.log('Block ',i,': ',arrayBlock[i]);
    }*/
  }
  /** Initialization Foods */
  public initFoods() {
    //console.log('FUNCTION initFoods');
    // Array Foods
    arrayFood = [];
    // Food-Number
    var fNum:number = 0;
    // Create Foods (Grid)
    for (var i = 1; i <= 5; i++) {
      for (var j = 1; j <= 5; j++) {
        //console.log('Creating Food ',fNum);
        // Calculate the center point of the food
        var x = canvasWidth / 5 * i - canvasWidth / 10 - canvasWidth / 2;
        var y = canvasHeight / 5 * j - canvasHeight / 10 - canvasHeight / 2;
        var center = new Point(x,y);
        //console.log('Food-CenterPoint '+fNum+': ',center);
        var f = new Food(center);
        arrayFood[fNum] = [f, center];
        fNum += 1;
      }
    }
  }
  /** Create a random center point of a LF */
  public createLFcenter() {
    // Generate the center point of the LF at random
    var center = getRandompoint();
    // Check whether the LF center is too close (<20) to a block -> create a new LF center
    for (var i = 0; i < arrayBlock.length; i++) {
      var d = center.distanceTo(arrayBlock[i][1]);
      if (d < 20) this.createLFcenter();
    }
    return center;   
  }
  /** Initialization of the life forms */
  public initLforms() {
    //console.log('--------------------------------');
    //console.log('FUNCTION initLforms');
    // Vars
    var center:Point;
    var cIndex:number;
    var lf:lForm;
    // Create the first four life forms (thus both sexes are present twice each)
    // LF 0
    // Generate center point of the LF
    center = this.createLFcenter();
    // Generate female LF
    lf = new lForm(center, 3.5, 7, 0, 0);
    // Include LF in array
    arrayLF[0] = [lf, center, 0];
    // LF 1
    // Generate center point of the LF
    center = this.createLFcenter();
    // Generate male LF
    lf = new lForm(center, 3.5, 7, 1, 1);
    // Set pairing counter to 0 (immediate pairing)
    lf.pCounter = 0;
    // Include LF in array
    arrayLF[1] = [lf, center, 1];
    // LF 2
    // Generate center point of the LF
    center = this.createLFcenter();
    // Generate female LF
    lf = new lForm(center, 3.5, 7, 0, 2);
    // Include LF in array
    arrayLF[2] = [lf, center, 0];
    // LF 3
    // Generate center point of the LF
    center = this.createLFcenter();
    // Generate male LF
    lf = new lForm(center, 3.5, 7, 1, 3);
    // Set pairing counter to 0 (immediate pairing)
    lf.pCounter = 0;
    // Include LF in array
    arrayLF[3] = [lf, center, 1];
    // If numLFs > 4 generate more life forms (gender randomly)
    if (numLFs > 4) {
      for (var i = 4; i < numLFs; i++) {
        //console.log('Creating LF ',i);
        // Generate center point of the LF
        center = this.createLFcenter();
        //console.log('CenterPoint: ',center);
        // Random cIndex (0: female, 1: male)
        cIndex = Math.round(Math.random());
        //console.log('cIndex: ',cIndex);
        lf = new lForm(center, 3.5, 7, cIndex, i);
        lf.pCounter = 1;
        arrayLF[i] = [lf, center, cIndex];
        //console.log('LF ',i,': ',arrayLF[i]);
      }
    }
    // Number of active life forms
    activeLifeforms = arrayLF.length;
    //console.log('arrayLF after Init: ',arrayLF);
  }
  /** Initialization of the simulation */
  public initSimulation() {
    // Interval for calculating the simulation duration
    timeIntervall = 1000 / tickTime;
    // Initialization of the objects
    this.initBlocks();
    this.initFoods();
    this.initLforms();
    // Render Canvas
    this.render(this.ctx);
    // Start the simulation
    this.startSimulation();
  }
  /** Start Simulation */
  private startSimulation() {
  	simulation = window.setInterval(this.tick, tickTime);
  }
  /** Interval procedure of the simulation (Timer) */
  private tick = () => {
    // Actions of life forms including determination of the number of active / female / male life forms
    var lfs:number = 0;
    var numF:number = 0;
    var numM:number = 0;
    for (var i = 0; i < arrayLF.length; i++) {
      //console.log('walk() für LF ',i);
      if (arrayLF[i] != undefined) { 
        arrayLF[i][0].walk();
        lfs += 1;
        if (arrayLF[i] != undefined && arrayLF[i][2] == 0) numF += 1; else numM += 1;
      }
    }
    // Update of the display
    activeLifeforms = lfs;
    numFemale = numF;
    numMale = numM;
    this.lfDisplay.innerHTML = 'Life forms: ' + activeLifeforms + ' (' + numFemale + ' Female / ' + numMale + ' Male)';
    // Actions of the food sources
    for (var i = 0; i < arrayFood.length; i++) {
      //console.log('Start grow() of the food source ',i);
      if (arrayFood[i] != undefined) { 
        arrayFood[i][0].grow();
      }
    }
    // Render Canvas
    this.render(this.ctx);
    // Increment counter
    zaehler += 1;
    // Calculate simulation time
    var sekunden = zaehler / timeIntervall;
    if (sekunden == Math.ceil(sekunden)) {
      sSekunde++;
      if (sSekunde >= 60) {
        sSekunde = 0;
        sMinute++;
        if (sMinute >= 60) {
          sMinute = 0;
          sStunde++;
        }
      }
      this.timeDisplay.innerHTML = (sStunde ? (sStunde > 9 ? sStunde : "0" + sStunde) : "00") + ":" + (sMinute ? (sMinute > 9 ? sMinute : "0" + sMinute) : "00") + ":" + (sSekunde > 9 ? sSekunde : "0" + sSekunde);
    }
    // Initiate stop of the simulation when all LFs are of the same gender (pairing is no longer possible)
    if (activeLifeforms > 1) {
      var dIndex:number;
      var cIndex:number;
      stopFlag = true;
      dIndex = getdefinedIndex();
      if (arrayLF[dIndex] != undefined) cIndex = arrayLF[dIndex][2];
      for (var i = dIndex + 1; i < arrayLF.length; i++) {
        if (arrayLF[i] != undefined && arrayLF[i][2] != cIndex) stopFlag = false;
      }
    }
    // Stop simulation when only three LFs are still active or stopFlag true (only same sexes)
    if (activeLifeforms < 4 || stopFlag === true) {
      if (stopTime > 0) {
        stopTime -= 1;
      } else {
        clearInterval(simulation);
        changeButtons();
      }
    }
  }
  /** Render */
  private render(ctx:CanvasRenderingContext2D) {
    // console.log('FUNCTION render');
    // Clear Canvas
    ctx.fillStyle = this.canvasBackground;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    // Draw Blocks
    for (var i = 0; i < arrayBlock.length; i++) {
      //console.log('Block ',i,': ',arrayBlock[i]);
      arrayBlock[i][0].draw(ctx);
    }
    // Draw Foods
    for (var i = 0; i < arrayFood.length; i++) {
      //console.log('Food ',i,': ',arrayFood[i]);
      arrayFood[i][0].draw(ctx);
    }
    // Draw LFs
    for (var i = 0; i < arrayLF.length; i++) {
      //console.log('LF ',i,': ',arrayLF[i]);
      if (arrayLF[i] != undefined) arrayLF[i][0].draw(ctx);
    }
    // End of simulation message
    if (stopTime <= 1) {
      this.endDisplay.style.display = 'block';
    }
  }
}
/** Global Functions */
// Toggle buttons (when simulation ended)
function changeButtons() {
  var b1:any = document.getElementById('b1');
  b1.disabled = false;
  var b2:any = document.getElementById('b2');
  b2.disabled = true;
}
// Transformation of the object coordinates into the system coordinates
function transformTDPoint(tdpoint:Point) {
  var x = canvasCenter.x + tdpoint.x;
  var y = canvasCenter.y + tdpoint.y;
  return new Point(x,y);
}
// Rotation of a point around the Z axis
function rotateTDPointZ(theta:number, tdpoint:Point) {
  var w = theta * Math.PI / 180;
  var sinTheta = Math.sin(w);
  var cosTheta = Math.cos(w);
  return new Point(tdpoint.x * cosTheta - tdpoint.y * sinTheta, tdpoint.y * cosTheta + tdpoint.x * sinTheta);
}
// Create Random-Point
function getRandompoint() {
  var x = Math.floor((Math.random() * (canvasWidth - 40))) - (canvasWidth / 2 - 20);
  var y = Math.floor((Math.random() * (canvasHeight - 40))) - (canvasHeight / 2 - 20);
  return new Point(x, y);
}
// Search for the first undefined array entry in arrayLF
function getundefinedIndex() {
  for (var i = 0; i < arrayLF.length; i++) {
    if (arrayLF[i] == undefined) return i;
  }
  return arrayLF.length;
}
// Search for the first defined array entry in arrayLF
function getdefinedIndex() {
  for (var i = 0; i < arrayLF.length; i++) {
    if (arrayLF[i] != undefined) return i;
  }
  return 0;
}
/** Object-Classes of the simulation
    - lForm
    - Block
    - Food
*/
/** Class lForm (life form) */
class lForm {
  /** Properties */
  public lfCenter:Point  = null;
  public lfWidth:number  = 0;
  public lfLength:number = 0;
  public cIndex:number   = 0;
  public lfNumber:number = 0;
  /** Private Vars */
  private rAngle:number;        // Rotation angle of the life form (Z-axis, function rotateNodes (rAngle))
  private origC:Point;          // Original or starting CenterPoint of the life form
  private sColor:string         // Stroke color
  private fColor:string         // Fill color
  private nodes:Array<Point>;   // Array of life form points
  private step:number;          // Step size (speed)
  private mTarget:Point;        // Main target of the life form
  private aTarget:Point;        // Avoid target of the life form (case 1)
  private kollIndex:number;     // Collision life form index
  private avoidCourse:boolean;  // Flag for evasive course (false: drive standard course, true: drive evasive course)
  private avoidMode:number;     // Dodge mode (0: LF, 1: block, 2: inedible food source)
  private kollDistance:number;  // Scan distance to avoid a collision
  private koCounter:number;     // Counter KO-Mode
  private lifeTime:number;      // Lifetime
  private hLevel:number;        // Hunger level (under this value the LF searches for food)
  private foodIndex:number;     // Food source index
  private eatFlag:boolean;      // Food intake flag (true: eat, false: continue action)
  private partnerFlag:boolean;  // Flag for target (true: partner, false: mTarget / aTarget)
  private meetDistance:number;  // Distance to initiate pairing
  /** Public Vars */
  public caseEvent:number;      // Action to be carried out (case) of the life form
  public opacity:number;        // Opacity
  public gCounter:number;       // Global counter (used for food intake / fadeOut / fadeIn / meetPartner)
  public pCounter:number;       // Counter for mating (only male LFs, when eating - = 1, <= 0 allows mating)
  public koModus:boolean;       // KO mode (false: act, true: stand still for a while and rotate)
  public eLevel:number;         // Energy-Level (0 bis 100)
  public changeFlag:boolean;    // Allow other LF to change one's own behavior (true)
  public foodFlag:boolean;      // Flag for target (true: food source, false: mTarget / aTarget)
  public delFlag:boolean;       // Delete-Flag (true shows red circle at fadeOut)
  public pLevel:number;         // Pairing level (if this value is not reached, no pairing takes place)
  public prepairFlag:boolean;   // Prepare / occupy flag for pairing (true: block pairing for other LFs)
  public pairFlag:boolean;      // Flag for pairing (true: pair, false: continue action walktoPartner)
  public partnerIndex:number;   // Array index of the partner life form
  public birthFlag:boolean;     // Birth-Flag (true shows green circle at fadeIn)
  /**
  *   Construct a life form in 2D space 
  *   @param lfCenter  Center of the life form (X, Y)
  *   @param lfWidth   Life form width (Y)
  *   @param lfLength  Life form length (X)
  *   @param cIndex    Color index (0: female, 1: male)
  *   @param lfNumber  Array index of the life form
  */
  public constructor(lfCenter:Point, lfWidth:number, lfLength:number, cIndex:number, lfNumber:number) {
    // Take over properties
  	this.lfCenter = lfCenter
    this.lfWidth  = lfWidth;
    this.lfLength = lfLength;
    this.cIndex   = cIndex;
    this.lfNumber = lfNumber;
    // Vars
    this.origC = lfCenter;
    this.nodes = [];
    // Preset event to 0 (case 0 -> activate mTarget)
    this.caseEvent = 0;
    // Scan distance for collision (varies to avoid simultaneous evasions)
    this.kollDistance = this.lfWidth + this.lfLength + Math.random() * 3;
    // Opacity
    this.opacity = 1;
    // Color strings (reflect gender, form: 'rgba (r, g, b, opacity)')
    this.fColor = 'rgba('+arrayColors[this.cIndex][0]+','+this.opacity+')';
    this.sColor = 'rgba('+arrayColors[this.cIndex][1]+','+this.opacity+')';
    // Lifetime
    this.lifeTime = lifeTime + Math.round(Math.random() * lifeTime / 2);
    // Energy level (varies to avoid eating at the same time)
    this.eLevel = 50 + Math.round(Math.random() * 50);
    // Hunger level
    this.hLevel = 50;
    // Mating level (lower limit)
    this.pLevel = 25;
    // Distance for initiating pairing or target (mTarget / aTarget) reached
    this.meetDistance = 2.5;
    // Mating counter (only applies to male LFs, when eating -= 1 -> pCounter <= 0: mating allowed)
    this.pCounter = 1;
    // Partner index
    this.partnerIndex = null;
    // KO counter
    this.koCounter = 100;
    // Global counter for eat/fadeOut/fadeIn/meetPartner
    this.gCounter = 25;
    // Calling the initialization procedures
    this.init();
  }
  /** Functions */
  // Rotation of the life form nodes in virtual space to theta degrees
  private rotateNodes(theta:number) {
    for (var n = 0; n < this.nodes.length; n++) {
      var node = this.nodes[n];
      this.nodes[n] = rotateTDPointZ(theta, node);
    }
  }
  // Rotation of the life form in virtual space to theta degrees
  private rotateMe(theta:number) {
    this.initNodes();
    this.rotateNodes(theta);
    this.rAngle = theta;
  }
  // Evaluation of the speed (step size) as a function of the goal / distance to the goal
  private calculateSpeed(distance:number) {
    var step:number;
    if (this.partnerFlag === true || this.foodFlag === true) {
      step = 0.995;
      return step;
    }
    if (distance > 200) {
      step = 0.7;
      return step;
    } else {
      if (distance > 100) {
        step = 0.65;
      } else {
        step = 0.6;
      }
      return step;
    }
  }
  // Calculate rotation angle on target
  private calcAngle(target:Point) {
    //console.log('FUNCTION calcAngle');
    var rotAngleRad = this.origC.getAngleBetween(target) + Math.PI * 2;
    //console.log('rotAngleRad: ',rotAngleRad);
    var rotAngleDeg = Math.round((180 / Math.PI * rotAngleRad) - 180);
    //console.log('rotAngleDeg: ',rotAngleDeg);
    return rotAngleDeg;
  }
  /** Initialization procedures */
  // Initialization of the nodes of the life form in the virtual space (center point = 0,0)
  private initNodes() {
    var node0 = new Point(this.lfLength / 2, 0);
    var node1 = new Point(-this.lfLength / 2, +this.lfWidth / 2);
    var node2 = new Point(-this.lfLength / 5, 0);
    var node3 = new Point(-this.lfLength / 2, -this.lfWidth / 2);
    this.nodes = [node0, node1, node2, node3];
  }
  // Initialization of the flags
  private initFlags() {
    // Go flag for evasive course
    this.avoidCourse = false;
    // Allow change flag for changes in own behavior by other LF (TRUE)
    this.changeFlag = true;
    // Delete-Flag (true shows red circle at fadeOut)
    this.delFlag = false;
    // Flag KO mode (false: act, true: stop for a while and rotate)
    this.koModus = false;
    // Flag for target = food source (true: food source, false: mTarget / aTarget)
    this.foodFlag = false;
    // Food intake flag (true: eat, false: continue action)
    this.eatFlag = false;
    // Flag for target = partner (true: partner, false: mTarget / aTarget)
    this.partnerFlag = false;
    // Prepare flag for pairing (true: don't allow pairing for other LFs)
    this.prepairFlag = false;
    // Flag for pairing (true: pair, false: continue action)
    this.pairFlag = false;
    // Birth-Flag (true shows green circle at fadeIn)
    this.birthFlag = false;
  }
  /** LF-Prozedures */
  // Determine the random goal of the life form
  private initTarget() {
    //console.log('--------------------------------');
    //console.log('FUNCTION initTarget');
    //console.log('LF-Nummer: ',this.lfNumber);
    this.mTarget = getRandompoint();
    //console.log('Target:',this.mTarget);
    // Check whether the target is too close to a block -> if so, then create a new target
    for (var i = 0; i < arrayBlock.length; i++) {
      var d = this.mTarget.distanceTo(arrayBlock[i][1]);
      if (d < this.kollDistance) this.initTarget();
    }
    var distance = this.origC.distanceTo(this.mTarget);
    //console.log('Distanz zum Target: ',distance);
    // Distance to new target too small -> set new target again
    if (distance < this.kollDistance) this.initTarget();
    this.step = this.calculateSpeed(distance);
    //console.log('Speed: ',this.step);
  }
  // Call all initialization procedures
  private init() {
    this.initNodes();
    this.initFlags();
    this.initTarget();
    this.rAngle = this.calcAngle(this.mTarget);
    this.rotateNodes(this.rAngle);
  }
  // Initialization of the birth of a life form
  private initBirth(center:Point) {
    // Vars
    var aIndex:number
    var cIndex:number;
    var lf:lForm;
    //console.log('arrayLF vor Geburt: ',arrayLF);
    // Find undefined index in arrayLF
    aIndex = getundefinedIndex();
    //console.log('Array-Index der neuen LF: ',aIndex);
    console.log('LF ',aIndex,' is born.');
    // Random color index of the LF (0: female, 1: male)
    cIndex = Math.round(Math.random());
    //console.log('ColorIndex der neuen LF: ',cIndex);
    // Create LF
    lf = new lForm(center, 3.5, 7, cIndex, aIndex);
    lf.opacity = 0;
    lf.gCounter = 0;
    lf.changeFlag = false;
    lf.birthFlag = true;
    // Call fadeIn
    lf.caseEvent = 10;
    // Include LF in the array of life forms
    arrayLF[aIndex] = [lf, center, cIndex];
    // Simulation stoppen (zu Testzwecken)
    //console.log('Simulation gestoppt.');
    //clearInterval(simulation);
  }
  /** Basic routines of the life form */
  // Collision check (generates / returns case according to the case distinction)
  private proofKollision() {
    //console.log('--------------------------------');
    //console.log('FUNCTION proofKollision');
    // Search the array of life forms and determine the distance to the respective LF
    // Case distinction: same / unequal gender (cIndex)
    // - LF has the same gender -> evade
    // - LF has the opposite sex -> evade / meet depending on eLevel
    for (var i = 0; i < arrayLF.length; i++) {
      // LF has a different array number, own changeFlag = true, own birthFlag = false
      if (i != this.lfNumber && arrayLF[i] != undefined && this.changeFlag === true && this.birthFlag === false ) {
        // Determine the distance to the other LF
        var distance = this.lfCenter.distanceTo(arrayLF[i][1]);
        //console.log('Distanz: ',distance);
        // Find out the distance smaller than kollDistance -> Determine gender and react accordingly
        if (distance < this.kollDistance) {
          // Array number of the other LF
          this.kollIndex = i;
          // Set evasive mode
          this.avoidMode = 0;
          // Find out the gender of the other life form
          var gender = arrayLF[this.kollIndex][2];
          //console.log('gender andere LF: ',gender);
          // Same / unequal gender action
          if (gender == this.cIndex) {
            // LF is of the same sex
            //console.log('LF hat gleiches gender!');
            // If distance <lfLength / 2 -> collision takes place (case 4)
            if (distance < this.lfLength / 2) {
              //console.log('Kollision findet statt!');
              //console.log('Distanz zur LF: ',distance);
              // Block changes in your own behavior by other LF (FALSE)
              this.changeFlag = false;
              return 4;
            } else {
              // Distance> lfLength / 2 -> avoid collision (case 1)
              //console.log('Kollision mit LF vermeiden!');
              //console.log('Distanz zur LF: ',distance);
              // Check for further LF in the collision area
              for (var j = 0; j < arrayLF.length; j++) {
                if (j != this.lfNumber && arrayLF[j] != undefined && j != i) {
                  // Determine the distance to the other LF
                  var distance = this.lfCenter.distanceTo(arrayLF[j][1]);
                  // Distance < kollDistance (further LF is in the collision area) -> walk back (case 8)
                  if (distance < this.kollDistance) return 8;
                }
              }
              // Check for blocks in the collision area
              for (var j = 0; j < arrayBlock.length; j++) {
                if (arrayBlock[j] != undefined) {
                  // Determine the distance to the block
                  var distance = this.lfCenter.distanceTo(arrayBlock[j][1]);
                  // Distance < kollDistance (block is in the collision area) -> walk back (case 8)
                  if (distance < this.kollDistance) return 8;
                }
              }
              // Check for immature food source in the collision area
              for (var j = 0; j < arrayFood.length; j++) {
                if (arrayFood[j] != undefined && arrayFood[j][0].growState < 3) {
                  // Determine the distance to the food source
                  var distance = this.lfCenter.distanceTo(arrayFood[j][1]);
                  // Distance < kollDistance (food source is in the collision area) -> walk back (case 8)
                  if (distance < this.kollDistance) return 8;
                }
              }
              return 1;
            }
          } else {
            // LF is of the opposite sex
            //console.log('LF hat anderes gender!');
            // Check for own gender (female: 0 / male: 1)
            if (this.cIndex == 0) {
              // Female LF -> check for occupation
              if (this.prepairFlag === true) {
                // Check for occupation by male LF in the collision area
                if (arrayLF[this.kollIndex][0].partnerIndex == this.lfNumber) {
                  // Occupied by male LF -> meet partner (case 7)
                  this.pairFlag = true;
                  return 7;
                } else {
                  // Not occupied by male LF -> collision check
                  if (distance < this.lfLength / 2) {
                    // Abstand < lfLength / 2 -> Kollision findet statt (case 4)
                    //console.log('Distanz zur LF: ',distance);
                    // Block changes in own behavior by other LF (FALSE)
                    this.changeFlag = false;
                    return 4;
                  } else {
                    // Abstand > lfLength / 2 -> Kollision vermeiden (case 1)
                    //console.log('Kollision mit LF vermeiden!');
                    //console.log('Distanz zur LF: ',distance);
                    // Check for further LF in the collision area
                    for (var j = 0; j < arrayLF.length; j++) {
                      if (j != this.lfNumber && arrayLF[j] != undefined && j != i) {
                        // Determine the distance to the other LF
                        var distance = this.lfCenter.distanceTo(arrayLF[j][1]);
                        // Distance < kollDistance (further LF is in the collision area) -> walk back (case 8)
                        if (distance < this.kollDistance) return 8;
                      }
                    }
                    // Check for blocks in the collision area
                    for (var j = 0; j < arrayBlock.length; j++) {
                      if (arrayBlock[j] != undefined) {
                        // Determine the distance to the block
                        var distance = this.lfCenter.distanceTo(arrayBlock[j][1]);
                        // Distance < kollDistance (block is in the collision area) -> walk back (case 8)
                        if (distance < this.kollDistance) return 8;
                      }
                    }
                    // Check for immature food source in the collision area
                    for (var j = 0; j < arrayFood.length; j++) {
                      if (arrayFood[j] != undefined && arrayFood[j][0].growState < 3) {
                        // Determine the distance to the food source
                        var distance = this.lfCenter.distanceTo(arrayFood[j][1]);
                        // Distance < kollDistance (food source is in the collision area) -> walk back (case 8)
                        if (distance < this.kollDistance) return 8;
                      }
                    }
                    return 1;
                  }
                }                
              } else {
                // Not occupied -> collision check
                if (distance < this.lfLength / 2) {
                  // Abstand < lfLength / 2 -> Kollision findet statt (case 4)
                  //console.log('Distanz zur LF: ',distance);
                  // Block changes to your own behavior by other LF (FALSE)
                  this.changeFlag = false;
                  return 4;
                } else {
                  // Distance > lfLength / 2 -> avoid collision (case 1)
                  //console.log('Kollision mit LF vermeiden!');
                  //console.log('Distanz zur LF: ',distance);
                  // Check for further LF in the collision area
                  for (var j = 0; j < arrayLF.length; j++) {
                    if (j != this.lfNumber && arrayLF[j] != undefined && j != i) {
                      // Determine the distance to the other LF
                      var distance = this.lfCenter.distanceTo(arrayLF[j][1]);
                      // Distance < kollDistance (further LF is in the collision area) -> walk back (case 8)
                      if (distance < this.kollDistance) return 8;
                    }
                  }
                  // Check for blocks in the collision area
                  for (var j = 0; j < arrayBlock.length; j++) {
                    if (arrayBlock[j] != undefined) {
                      // Determine the distance to the block
                      var distance = this.lfCenter.distanceTo(arrayBlock[j][1]);
                      // Distance < kollDistance (block is in the collision area) -> walk back (case 8)
                      if (distance < this.kollDistance) return 8;
                    }
                  }
                  // Check for immature food source in the collision area
                  for (var j = 0; j < arrayFood.length; j++) {
                    if (arrayFood[j] != undefined && arrayFood[j][0].growState < 3) {
                      // Determine the distance to the food source
                      var distance = this.lfCenter.distanceTo(arrayFood[j][1]);
                      // Distance < kollDistance (food source is in the collision area) -> walk back (case 8)
                      if (distance < this.kollDistance) return 8;
                    }
                  }
                  return 1;
                }
              }
            } else {
              // Male LF -> check for partner search
              //console.log('LF hat anderes gender (weiblich)!');
              // Check for partner search
              if (this.partnerFlag === true) {
                // On the way to partner LF -> Examination for partner LF
                if (this.kollIndex == this.partnerIndex) {
                  // The other LF is the partner LF -> pairing test
                  if (distance < this.meetDistance) {
                    // Distance < meetDistance -> meeting partner (case 7)
                    // Block changes to your own behavior by other LF (FALSE)
                    this.changeFlag = false;
                    this.pairFlag = true;
                    return 7;
                  } else {
                    // Distance > meetDistance -> continue walking to the partner (case 3)
                    return 3;
                  }
                } else {
                  // The other LF is another female LF -> collision check
                  if (distance < this.lfLength / 2) {
                    // Distance < lfLength / 2 -> collision takes place (case 4)
                    // Block changes to your own behavior by other LF (FALSE)
                    this.changeFlag = false;
                    return 4;
                  } else {
                    // Distance > lfLength / 2 -> avoid collision (case 1)
                    //console.log('Kollision mit LF vermeiden!');
                    //console.log('Distanz zur LF: ',distance);
                    // Check for further LF in the collision area
                    for (var j = 0; j < arrayLF.length; j++) {
                      if (j != this.lfNumber && arrayLF[j] != undefined && j != i) {
                        // Determine the distance to the other LF
                        var distance = this.lfCenter.distanceTo(arrayLF[j][1]);
                        // Distance < kollDistance (further LF is in the collision area) -> walk back (case 8)
                        if (distance < this.kollDistance) return 8;
                      }
                    }
                    // Check for blocks in the collision area
                    for (var j = 0; j < arrayBlock.length; j++) {
                      if (arrayBlock[j] != undefined) {
                        // Determine the distance to the block
                        var distance = this.lfCenter.distanceTo(arrayBlock[j][1]);
                        // Distance < kollDistance (block is in the collision area) -> walk back (case 8)
                        if (distance < this.kollDistance) return 8;
                      }
                    }
                    // Check for immature food source in the collision area
                    for (var j = 0; j < arrayFood.length; j++) {
                      if (arrayFood[j] != undefined && arrayFood[j][0].growState < 3) {
                        // Determine the distance to the food source
                        var distance = this.lfCenter.distanceTo(arrayFood[j][1]);
                        // Distance < kollDistance (food source is in the collision area) -> walk back (case 8)
                        if (distance < this.kollDistance) return 8;
                      }
                    }
                  }
                  return 1;
                }
              } else {
                // On the way to the random target/alternative target (mTarget / aTarget) -> avoid collision (case 1)
                return 1;
              }
            }
          }
        }
      }
    }
    // Search the array of blocks and determine the distance to the respective block
    for (var i = 0; i < arrayBlock.length; i++) {
      // Determine the distance to the block
      var distance = this.lfCenter.distanceTo(arrayBlock[i][1]);
      // If the distance is less than kollDistance -> evade
      if (distance < this.kollDistance) {
        // Save the array number of the block
        this.kollIndex = i;
        // Set evasive mode
        this.avoidMode = 1;
        // If distance < lfLength / 2 -> collision with block takes place (case 5)
        if (distance < this.lfLength / 2) {
          //console.log('Kollision mit Block findet statt!');
          //console.log('Distanz zum Block: ',distance);
          return 5;
        } else {
          // If distance > lfLength / 2 -> avoid collision with block (case 1)
          //console.log('Kollision mit Block vermeiden!');
          //console.log('Distanz zum Block: ',distance);
          // Check whether mTarget / aTarget is too close to the block (within the collision distance)
          if (this.avoidCourse === false) {
            distance = this.mTarget.distanceTo(arrayBlock[i][1]);
          } else {
            distance = this.aTarget.distanceTo(arrayBlock[i][1]);
          }
          // Too close?
          if (distance < this.kollDistance) {
            // mTarget / aTarget too close -> define new random target (case 0)
            this.origC = this.lfCenter;
            this.init();
            return 0;
          } else {
            // Drive evasive course (case 1)
            return 1;
          }
        }
      }
    }
    // Search the array of food sources and determine the distance to each food source
    for (var i = 0; i < arrayFood.length; i++) {
      // Determine the distance to each food source
      var distance = this.lfCenter.distanceTo(arrayFood[i][1]);
      // If the distance is less than kollDistance -> evade
      if (distance < this.kollDistance && this.foodIndex != i) {
        // Save the array number of the food source
        this.kollIndex = i;
        // Set evasive mode
        this.avoidMode = 2;
        // Determine edibility
        var eatable = arrayFood[i][0].growColor;
        //console.log('Genießbarkeit der Nahrungsquelle: ',eatable);
        // If distance < lfLength / 2 and food source is inedible -> collision takes place (case 5)
        if (distance < this.lfLength / 2 && eatable < 3) {
          //console.log('Kollision mit Nahrungsquelle findet statt!');
          //console.log('Distanz zur Nahrungsquelle: ',distance);
          return 5;
        } else {
          // Distance > lfLength / 2 -> If food source is inedible avoid collision (case 1)
          if (eatable < 3) {
            //console.log('Kollision mit ungenießbarer Nahrungsquelle vermeiden!');
            //console.log('Distanz zur Nahrungsquelle: ',distance);
            // Check whether the mTarget / aTarget is too close to the food source (within the collision distance)
            if (this.avoidCourse === false) {
              distance = this.mTarget.distanceTo(arrayFood[i][1]);
            } else {
              distance = this.aTarget.distanceTo(arrayFood[i][1]);
            }
            // Too close?
            if (distance < this.kollDistance) {
              // mTarget / aTarget too close -> set new random target (case 0)
              this.origC = this.lfCenter;
              this.init();
              return 0;
            } else {
              // Drive evasive course (case 1)
              return 1;
            }
          } else {
            // Food source is edible
            //console.log('Nahrungsquelle ist genießbar!');
            //console.log('Distanz zur Nahrungsquelle: ',distance);
            // Exception: eLevel < 75, food source free, partnerFlag = false -> control food source
            if (this.eLevel < 75 && arrayFood[i][0].occupyFlag === false && this.partnerFlag === false) {
              //console.log('LF ',this.lfNumber,' ist hungrig -> Nahrungsquelle ansteuern!');
              // Save index of food source
              this.foodIndex = i;
              // Occupy the food source (other LFs then no longer control them)
              arrayFood[i][0].occupyFlag = true;
              // Reset flags
              this.initFlags();
              // Set flag for target = food source
              this.foodFlag = true;
              // Save the center point of the food source as a target -> mTarget
              this.mTarget = arrayFood[i][1];
              // Declare current location as original
              this.origC = this.lfCenter;
              // Align the angle of the LF with food source
              this.initNodes();
              this.rAngle = this.calcAngle(this.mTarget);
              this.rotateNodes(this.rAngle);
              // Set the speed using the distance to the food source
              var distance = this.lfCenter.distanceTo(this.mTarget);
              //console.log('Distanz zur Nahrungsquelle: ',distance);
              this.step = this.calculateSpeed(distance);
              //console.log('Speed: ',this.step);
              return 0;
            } else {
              // eLevel > hLevel (LF is not hungry) or food source is not free -> avoid it
              //console.log('Kollision mit ungenießbarer Nahrungsquelle vermeiden!');
              //console.log('Distanz zur Nahrungsquelle: ',distance);
              // Check whether the mTarget / aTarget is too close to the food source (within the collision distance)
              if (this.avoidCourse === false) {
                distance = this.mTarget.distanceTo(arrayFood[i][1]);
              } else {
                distance = this.aTarget.distanceTo(arrayFood[i][1]);
              }
              if (distance < this.kollDistance) {
                // mTarget / aTarget too close -> define new random target (case 0)
                this.origC = this.lfCenter;
                this.init();
                return 0;
              } else {
                // Drive evasive course (case 1)
                return 1;
              }
            }
          }
        }
      }
    }
    // No collision -> check for own gender (male) and partnerFlag = true
    if (this.cIndex == 1 && this.partnerFlag === true) {
      // Male LF heads for partner LF (case 3)
      return 3;
    } else {
      // Standard action for female and male LFs (partnerFlag = false) (case 0)
      return 0;
    }
  }
  // Search food source (changes mTarget, sets foodFlag and generates / returns case 0)
  private searchFood() {
    //console.log('--------------------------------');
    //console.log('FUNCTION searchFood');
    var distance:number;
    var fArray:Array<any> = [];
    var aNum:number = 0;
    // Search for food sources (almost ripe, growColor = 2) -> fArray[i] = [index, distance]
    for (var i = 0; i < arrayFood.length; i++) {
      if (arrayFood[i][0].growColor > 0 && arrayFood[i][0].growColor < 3 && arrayFood[i][0].occupyFlag === false) {
        //console.log('Fast reife Nahrungsquelle gefunden.');
        distance = this.lfCenter.distanceTo(arrayFood[i][1]);
        fArray[aNum] = [i, distance];
        aNum += 1;
      }
    }
    //console.log('Array fast reife Nahrungsquellen: ',fArray);
    // When food sources are found
    if (fArray.length > 1) {
      //console.log('Fast reife Nahrungsquellen gefunden.');
      // Sort array of found food sources (by distance)
      fArray.sort((a,b) => a[1] - b[1]);
      //console.log('Array sortiert: ',fArray);
      // Index of the closest food source
      this.foodIndex = fArray[0][0];
      //console.log('foodIndex: ',this.foodIndex);
      // Save the center point of the closest food source as a target -> mTarget
      this.mTarget = arrayFood[this.foodIndex][1];
      //console.log('mTarget: ',this.mTarget);
      // Occupy the food source (other LFs then no longer control them)
      arrayFood[this.foodIndex][0].occupyFlag = true;
      // Reset flags
      this.initFlags();
      // Set flag for target = food source
      this.foodFlag = true;
      // Declare current location as original
      this.origC = this.lfCenter;
      // Align the angle of the LF with food source
      this.initNodes();
      this.rAngle = this.calcAngle(this.mTarget);
      this.rotateNodes(this.rAngle);
      // Set the speed using the distance to the food source
      var distance = this.lfCenter.distanceTo(this.mTarget);
      //console.log('Distanz zur Nahrungsquelle: ',distance);
      this.step = this.calculateSpeed(distance);
      //console.log('Speed: ',this.step);
    }
    // Simulation stoppen (zu Testzwecken)
    //console.log('Simulation gestoppt.');
    //clearInterval(simulation);
    return 0;
  }
  // Partner search, only male LFs (generates / returns case 3)
  private searchPartner() {
    //console.log('--------------------------------');
    //console.log('FUNCTION searchPartner');
    var distance:number;
    var fArray:Array<any> = [];
    var aNum: number = 0;
    // LF has the opposite sex, prepairFlag = false, foodFlag = false -> fArray[i] = [index, distance]
    for (var i = 0; i < arrayLF.length; i++) {
      if (arrayLF[i] != undefined && arrayLF[i][2] == 0 && arrayLF[i][0].partnerIndex == null && arrayLF[i][0].prepairFlag === false && arrayLF[i][0].pairFlag === false && arrayLF[i][0].foodFlag === false) {
        //console.log('Paarungsbereite LF gefunden.');
        distance = this.lfCenter.distanceTo(arrayLF[i][1]);
        fArray[aNum] = [i, distance];
        aNum += 1;
      }
    }
    //console.log('Array weibliche LFs: ',fArray);
    // When found female LFs ready to mate
    if (fArray.length > 1) {
      //console.log('Paarungsbereite weibliche LFs gefunden.');
      // Sort array of found LFs (by distance)
      fArray.sort((a,b) => a[1] - b[1]);
      //console.log('Array sortiert: ',fArray);
      // Index of the closest LF
      this.partnerIndex = fArray[0][0];
      //console.log('partnerIndex: ',this.partnerIndex);
      // Occupy female LF for mating (other LFs then no longer control them)
      arrayLF[this.partnerIndex][0].prepairFlag = true;
      // Send own array index to female LF
      arrayLF[this.partnerIndex][0].partnerIndex = this.lfNumber;
      // Save center point of the LF as target -> mTarget
      this.mTarget = arrayLF[this.partnerIndex][1];
      //console.log('mTarget: ',this.mTarget);
      // Reset flags
      this.initFlags();
      // Set own prepairFlag (search successful)
      this.prepairFlag = true;
      // Set own flag for target (LF ready for pairing)
      this.partnerFlag = true;
      // Declare current location as original
      this.origC = this.lfCenter;
      // Align the angle of the LF on the LF that is ready to be paired
      this.initNodes();
      this.rAngle = this.calcAngle(this.mTarget);
      this.rotateNodes(this.rAngle);
      // Determine the speed using the distance to the LF ready for pairing
      var distance = this.lfCenter.distanceTo(this.mTarget);
      //console.log('Distanz zur paarungsbereiten LF: ',distance);
      this.step = this.calculateSpeed(distance);
      //console.log('Speed: ',this.step);
      // Simulation stoppen (zu Testzwecken)
      //console.log('Simulation gestoppt - hier walktoPartner (case 3) durchführen!');
      //clearInterval(simulation);
      // Initiate walktoPartner
      return 3;
    } else return 0;
  }
  /** Actions of the life form */
  // Goal mTarget / aTarget (case 0)
  private movetoTarget() {
    //console.log('--------------------------------');
    //console.log('FUNCTION movetoTarget');
    //console.log('Nummer LF: ',this.lfNumber)
    // Head for random target / alternative target (mTarget / aTarget)
    if (this.avoidCourse === false) {
      // Go to random target / food source (mTarget)
      this.lfCenter = this.mTarget.projectOntoCircle(this.lfCenter, this.step);
      //console.log('lfCenter: ',this.lfCenter.x,' / ',this.lfCenter.y);
      // Write own center point in the array of life forms
      arrayLF[this.lfNumber][1] = this.lfCenter;
      // Goal achieved (approximately)?
      if (this.lfCenter.distanceTo(this.mTarget) <= this.meetDistance) {
        // Reset partner index
        if (this.caseEvent == 0) this.partnerIndex = null;
        // Is the destination a source of food?
        if (this.foodFlag === true) {
          // The goal is a food source -> food intake
          this.eatFlag = true;
          console.log('LF ',this.lfNumber,' takes in food.');
        } else {
          // The goal is not a source of food -> set a new random goal
          // Update pairing counter (only male LF's)
          if (this.cIndex == 1) {
            this.pCounter = 0;
          }
          this.origC = this.lfCenter;
          this.init();
          // Standard action (case 0)
          this.caseEvent = 0;
        }
      }
    } else {
      // Go to alternative target (aTarget)
      this.lfCenter = this.aTarget.projectOntoCircle(this.lfCenter, this.step);
      //console.log('lfCenter: ',this.lfCenter.x,' / ',this.lfCenter.y);
      // Write own center point in the array of life forms
      arrayLF[this.lfNumber][1] = this.lfCenter;
      // When the alternative target is (almost) reached, head for the original target (mTarget)
      if (this.lfCenter.distanceTo(this.aTarget) <= this.meetDistance) {
        // Reset flag driving evasive course -> FALSE
        this.avoidCourse = false;
        // Declare current location as original
        this.origC = this.lfCenter;
        // Align the angle of the LF to original target (mTarget)
        this.initNodes();
        this.rAngle = this.calcAngle(this.mTarget);
        this.rotateNodes(this.rAngle);
        // Calculate speed
        var distance = this.origC.distanceTo(this.mTarget);
        //console.log('Distanz: ',distance);
        this.step = this.calculateSpeed(distance);
        //console.log('Speed: ',this.step);
        // An LF was avoided -> set the LF's changeFlag to true
        if (this.avoidMode == 0 && arrayLF[this.kollIndex] != undefined) arrayLF[this.kollIndex][0].changeFlag = true;
        // Check partnerFlag
        if (this.partnerFlag === true) {
          // Go to partner LF (case 3)
          this.caseEvent = 3;
        } else {
          // Standard action (case 0)
          this.caseEvent = 0;
        }
      }
    }
  }
  // Avoid collision -> evade (case 1)
  private avoidKollision() {
    //console.log('--------------------------------');
    //console.log('FUNCTION avoidKollision');
    // Avoidance process (default flag for driving evasive course: avoidCourse = FALSE)
    if (this.avoidCourse === false) {
      //console.log('Berechnung Ausweichziel');
      // Calculate alternative target -> Point aTarget
      // Create view points (eyes) to determine the evasive direction (right / left)
      // Distance view points
      var vpdistance = this.lfWidth;
      // Angle of the view points (Rad)
      var radvp1 = (this.rAngle - 50) * Math.PI / 180;
      //console.log('View-Point1-WinkelRad: ',radvp1);
      var radvp2 = (this.rAngle + 50) * Math.PI / 180;
      //console.log('View-Point2-WinkelRad: ',radvp2);
      // Vars for calculating the view points
      var vp1:Point; var vp2:Point; var newX:number; var newY:number; var d1:number; var d2:number; var aAngle:number;
      // View-Point 1
      newX = this.lfCenter.x + Math.cos(radvp1) * vpdistance;
      newY = this.lfCenter.y + Math.sin(radvp1) * vpdistance;
      vp1 = new Point(newX, newY);
      // View-Point 2
      newX = this.lfCenter.x + Math.cos(radvp2) * vpdistance;
      newY = this.lfCenter.y + Math.sin(radvp2) * vpdistance;
      vp2 = new Point(newX, newY);
      // Calculate the distances between the other LF / the block / the food source to the two view points
      switch(this.avoidMode) {
        case 0:
          // Distance to LF (if this still exists)
          if (arrayLF[this.kollIndex] != undefined) {
            d1 = vp1.distanceTo(arrayLF[this.kollIndex][1]);
            d2 = vp2.distanceTo(arrayLF[this.kollIndex][1]);
          } else {
            d1 = Math.random();
            d2 = Math.random();
          }
          break;
        case 1:
          // Distance to the block
          d1 = vp1.distanceTo(arrayBlock[this.kollIndex][1]);
          d2 = vp2.distanceTo(arrayBlock[this.kollIndex][1]);
          break;
        case 2:
          // Distance to the inedible source of food
          d1 = vp1.distanceTo(arrayFood[this.kollIndex][1]);
          d2 = vp2.distanceTo(arrayFood[this.kollIndex][1]);
          break;
      }
      //console.log('Distanz View-Point 1: ',d1);
      //console.log('Distanz View-Point 2: ',d2);
      // Calculate the angle to the avoidance point (depending on the VP distances)
      if (d1 < d2) {
        aAngle = (this.rAngle + 65);
      } else {
        aAngle = (this.rAngle - 65);
      }
      //console.log('Ausweich-Winkel: ',aAngle);
      // Avoidance angle in Rad
      var avoidangleRad = (aAngle) * Math.PI / 180;
      //console.log('avoidangleRad: ',avoidangleRad);
      // Distance to the avoidance point (lfLength * 2 + little random value)
      var distance = this.lfLength * 2 + Math.floor(Math.random() * 3);
      //console.log('Ausweich-Distanz: ',distance);
      // Calculate the coordinates of the alternative target (aTarget: Point)
      var newX = this.lfCenter.x + Math.cos(avoidangleRad) * distance;
      var newY = this.lfCenter.y + Math.sin(avoidangleRad) * distance;
      this.aTarget = new Point(newX, newY);      
      // Declare current location as original
      this.origC = this.lfCenter;
      // Align the angle of the LF on alternative target
      this.initNodes();
      this.rAngle = this.calcAngle(this.aTarget);
      this.rotateNodes(this.rAngle);
      // Set the speed using the distance to the evasive target
      var distance = this.lfCenter.distanceTo(this.aTarget);
      //console.log('Distanz: ',distance);
      this.step = this.calculateSpeed(distance);
      //console.log('Speed: ',this.step);
      // Set the flag taking the evasive course -> TRUE
      this.avoidCourse = true;
    }
    // Go to target / alternative destination
    this.movetoTarget();
  }
  // Food intake (case 2)
  private eat() {
    //console.log('--------------------------------');
    //console.log('FUNCTION eat');
    // Only take in food when the food source is ripe (takes 25 ticks)
    if (arrayFood[this.foodIndex][0].growColor == 3) {
      if (this.gCounter > 0) {
        this.gCounter -= 1;
        //console.log('gCounter: ',this.gCounter);
      } else {
        //console.log('LF mit dem Index ',this.lfNumber,' nimmt Nahrung auf.');
        // Set energy level to the maximum value
        this.eLevel = 100;
        // Set default value of the global counter
        this.gCounter = 25;
        // Initialize food source (release, must grow again)
        arrayFood[this.foodIndex][0].init();
        // Reset foodIndex
        this.foodIndex = -1;
        // Reset partnerIndex
        this.partnerIndex = null;
        // Update pairing counter (only male LF's)
        if (this.cIndex == 1) {
          this.pCounter = 0;
        }
        // Set standard event and set a new random target
        this.caseEvent = 0;
        this.origC = this.lfCenter;
        this.init();
      }
    }
  }
  // Go to the partner (case 3)
  private walktoPartner() {
    //console.log('--------------------------------');
    //console.log('FUNCTION walktoPartner');
    // General check: partner existing and partner and is not en route to a source of food?
    if (arrayLF[this.partnerIndex] != undefined && arrayLF[this.partnerIndex][0].foodFlag === false) {
      // Partner exists and is not en route to a source of food
      //console.log('this.partnerIndex: ',this.partnerIndex);
      // If partner has not yet been reached -> go on to partner
      if (this.lfCenter.distanceTo(this.mTarget) > this.meetDistance) {
        // Find out the current position of the partner LF
        this.mTarget = arrayLF[this.partnerIndex][1];
        // Declare current location as original
        this.origC = this.lfCenter;
        // Align the angle of the LF with partner LF
        this.initNodes();
        this.rAngle = this.calcAngle(this.mTarget);
        this.rotateNodes(this.rAngle);
        // Determine the speed
        var distance = this.lfCenter.distanceTo(this.mTarget);
        //console.log('Distanz zur Partner-LF: ',distance);
        this.step = this.calculateSpeed(distance);
        // Go to the partner LF
        this.lfCenter = this.mTarget.projectOntoCircle(this.lfCenter, this.step);
        //console.log('lfCenter: ',this.lfCenter.x,' / ',this.lfCenter.y);
        // Write own center point in the array of life forms
        arrayLF[this.lfNumber][1] = this.lfCenter;
      } else {
        // Partner reached
        // Set own pairing flag
        this.pairFlag = true;
        // Set the pairing flag of the other LF
        arrayLF[this.partnerIndex][0].pairFlag = true;
      }
    } else {
      // Partner no longer exists or goes to a source of food -> standard action
      this.partnerIndex = null;
      this.origC = this.lfCenter;
      this.init();
      this.caseEvent = 0;
    }
  }
  // Carry out a collision with LF (case 4)
  private accidentKollision() {
    //console.log('--------------------------------');
    //console.log('FUNCTION accidentKollision');
    // Case distinction with existing LF: same / different sex (cIndex)
    // - LF has the same gender -> put other LF into KO mode (case 4)
    // - LF has the opposite sex -> check willingness to mate
    //console.log('Nummer der anderen LF: ',this.kollIndex);
    // LF exists -> collision
    if (arrayLF[this.kollIndex] != undefined) {
      // Find out the gender of the other LF
      var cindex = arrayLF[this.kollIndex][0].cIndex;
      //console.log('gender der anderen LF: ',cindex);
      // Check for gender
      if (cindex == this.cIndex) {
        // Same sex -> put other LF into KO mode (taking into account some flags of the LF)
        //console.log('Kollision mit gleichem gender');
        if (arrayLF[this.kollIndex][0].changeFlag === true && arrayLF[this.kollIndex][0].birthFlag === false && arrayLF[this.kollIndex][0].delFlag === false && arrayLF[this.kollIndex][0].pairFlag === false) {
          // Put other LF into KO mode
          arrayLF[this.kollIndex][0].koModus = true;
        }
        // Set standard event
        this.caseEvent = 0;
      } else {
        // Unequal sex -> check for mating
        //console.log('Kollision mit ungleichem gender!');
        if (this.kollIndex == this.partnerIndex) {
          // Pairing has started -> run to partner (case 3)
          this.caseEvent = 3;
        } else {
          // No pairing -> put other LF into KO mode (taking into account some flags of the LF)
          if (arrayLF[this.kollIndex][0].changeFlag === true && arrayLF[this.kollIndex][0].birthFlag === false && arrayLF[this.kollIndex][0].delFlag === false && arrayLF[this.kollIndex][0].pairFlag === false) {
            arrayLF[this.kollIndex][0].koModus = true;
          }
          // Set standard event
          this.caseEvent = 0;
        }
      }
    } else {
      // Set standard event
      this.caseEvent = 0;
    }
  }
  // Perform collision with block / inedible food source -> walk back (case 5)
  private accidentBFKollision() {
    //console.log('--------------------------------');
    //console.log('FUNCTION accidentBFKollision');
    // Reset (default flag for driving reset course: avoidCourse = FALSE)
    // Distance to the reset point (lfLength * 2 + random value)
    var distance = this.lfLength * 2 + Math.floor(Math.random() * 3);
    //console.log('Rücksetz-Distanz: ',distance);
    // Angle to reset point (180 degrees)
    var aAngle = (this.rAngle - 180);
    //console.log('Rücksetz-Winkel: ',aAngle);
    var avoidangleRad = aAngle * Math.PI / 180;
    //console.log('avoidangleRad: ',avoidangleRad);
    // Calculate the coordinates of the reset point (aTarget: Point)
    var newX = this.lfCenter.x + Math.cos(avoidangleRad) * distance;
    var newY = this.lfCenter.y + Math.sin(avoidangleRad) * distance;
    this.aTarget = new Point(newX, newY);      
    // Declare current location as original
    this.origC = this.lfCenter;
    // Align nodes
    this.initNodes();
    //console.log('avoidMode: ',this.avoidMode);
    // Align the angle of the LF
    if (this.avoidMode == 1) {
      this.rAngle = this.calcAngle(arrayBlock[this.kollIndex][1]);
      //console.log('Zurücksetzen (Block), LF ',this.lfNumber);
    } else {
      this.rAngle = this.calcAngle(arrayFood[this.kollIndex][1]);
      //console.log('Zurücksetzen (Food), LF ',this.lfNumber);
    }
    this.rotateNodes(this.rAngle);
    // Set the speed using the distance to the reset point
    var distance = this.lfCenter.distanceTo(this.aTarget);
    //console.log('Distanz: ',distance);
    this.step = this.calculateSpeed(distance);
    // Set the flag for taking an evasive course -> TRUE
    this.avoidCourse = true;
    // Reset event
    this.caseEvent = 0; 
    // Walk to the reset point (aTarget) backwards
    this.movetoTarget();
  }
  // KO mode (case 6)
  private execKOmodus() {
    //console.log('--------------------------------');
    //console.log('FUNCTION execKOmodus');
    if (this.koCounter > 0) {
      this.koCounter -= 1;
      // Rotate LF around its own axis two times in 100 ticks (one time is 3.6 degrees)
      this.rotateMe(this.rAngle + 7.2);
    } else {
      // Cancel KO mode
      this.koModus = false;
      this.koCounter = 100;
      this.caseEvent = 0;
    }
  }
  // Meeting partner / pairing (case 7)
  private meetPartner() {
    //console.log('--------------------------------');
    //console.log('FUNCTION meetPartner');
    // Case distinction:
    // - own gender female -> mating, then generate new LF and initiate birth, then move back
    // - own gender male -> mating, then move back
    // Meet if partner LF still exists
    if (arrayLF[this.partnerIndex] != undefined) {
      // Check for gender
      if (this.cIndex == 0) {
        // Female LF
        if (this.gCounter > 0) {
          // gCounter = 25 -> Align LF to partner LF / set changeFlag and koModus to false
          if (this.gCounter == 25) {
            // Find out the current position of the partner LF
            this.mTarget = arrayLF[this.partnerIndex][1];
            // Declare current location as original
            this.origC = this.lfCenter;
            // Align the angle of the LF with partner LF
            this.initNodes();
            this.rAngle = this.calcAngle(this.mTarget);
            this.rotateNodes(this.rAngle);
            // Reset flags
            this.changeFlag = false;
            this.koModus = false;
          }
          this.gCounter -= 1.5;
          //console.log('gCounter: ',this.gCounter);
        } else {
          // Initiate the birth procedure
          //console.log('Paarung (weibliche LF) - Geburts-Prozedur wird eingeleitet!');
          this.initBirth(this.lfCenter);
          // Reset global counter
          this.gCounter = 25;
          // Reset partner index
          this.partnerIndex = null;
          // Move back (case 8)
          this.initFlags();
          this.caseEvent = 8;
          // Define a new random target (so that the pairing LFs don't run into each other)
          this.mTarget = getRandompoint();
        }
      } else {
        // Male LF
        if (this.gCounter > 0) {
          // gCounter = 25 -> Align LF to partner LF / set changeFlag and koModus to false
          if (this.gCounter == 25) {
            // Find out the current position of the partner LF
            this.mTarget = arrayLF[this.partnerIndex][1];
            // Declare current location as original
            this.origC = this.lfCenter;
            // Align the angle of the LF with partner LF
            this.initNodes();
            this.rAngle = this.calcAngle(this.mTarget);
            this.rotateNodes(this.rAngle);
            // Reset flags
            this.changeFlag = false;
            this.koModus = false;
          }
          this.gCounter -= 1.5;
          //console.log('gCounter: ',this.gCounter);
        } else {
          // Pairing ended
          //console.log('Paarung (männliche LF) -> Zurückfahren!');
          // Set pairing counter pCounter to standard value
          this.pCounter -= 1;
          if (this.pCounter < 0) this.pCounter = 1;
          // Reset global counter
          this.gCounter = 25;
          // Reset partner index
          this.partnerIndex = null;
          // Move back (case 8)
          this.initFlags();
          this.caseEvent = 8;
          // Define a new random target (so that the pairing LFs don't run into each other)
          this.mTarget = getRandompoint();
        }
      }
    } else {
      // Partner no longer exists -> set a new target
      this.partnerIndex = null;
      this.origC = this.lfCenter;
      this.init();
      this.caseEvent = 0; 
      this.movetoTarget();
    }
  }
  // Move back (case 8)
  private walkBack() {
    //console.log('--------------------------------');
    //console.log('FUNCTION walkBack');
    // Distance to the reset point (lfLength * 2.25 + little random value)
    var distance = this.lfLength * 2.25 + Math.floor(Math.random() * 3);
    //console.log('Rücksetz-Distanz: ',distance);
    // Angle
    var aAngle = (this.rAngle + 180);
    //console.log('Rücksetz-Winkel: ',aAngle);
    var avoidangleRad = aAngle * Math.PI / 180;
    //console.log('Rücksetz-Winkel Rad: ',avoidangleRad);
    // Calculate the coordinates of the reset point (aTarget)
    var newX = this.lfCenter.x + Math.cos(avoidangleRad) * distance;
    var newY = this.lfCenter.y + Math.sin(avoidangleRad) * distance;
    this.aTarget = new Point(newX, newY);      
    // Declare current location as original
    this.origC = this.lfCenter;
    // Set the speed using the distance to the reset point
    var distance = this.lfCenter.distanceTo(this.aTarget);
    //console.log('Distanz: ',distance);
    // Drive back at a slightly reduced speed
    this.step = this.calculateSpeed(distance) * 0.75;
    // Set the flag taking the evasive course -> TRUE
    this.avoidCourse = true;
    // Set standard event
    this.caseEvent = 0; 
    // Head to the point aTarget
    this.movetoTarget();
  }
  // FadeOut/Delete (case 9)
  private fadeOut() {
    //console.log('--------------------------------');
    //console.log('FUNCTION fadeOut');
    if (this.gCounter > 0) {
      // FadeOut
      this.gCounter -= 2;
      this.opacity = this.gCounter / 100;
      this.fColor = 'rgba('+arrayColors[this.cIndex][0]+','+this.opacity+')';
      this.sColor = 'rgba('+arrayColors[this.cIndex][1]+','+this.opacity+')';
    } else {
      // Remove life form from the array of LFs -> Result: arrayLF[lfNumber] => undefined
      //console.log('Delete von LF ',this.lfNumber,' wird durchgeführt!');
      delete arrayLF[this.lfNumber];
      // Simulation stoppen (zu Testzwecken)
      //console.log('Simulation gestoppt.');
      //clearInterval(simulation);
    }
  }
  // FadeIn/Birth (case 10)
  public fadeIn() {
    //console.log('--------------------------------');
    //console.log('FUNCTION fadeIn');
    if (this.gCounter < 100) {
      // FadeIn
      this.gCounter += 2;
      //console.log('gCounter: ',this.gCounter);
      this.opacity = this.gCounter / 100;
      this.fColor = 'rgba('+arrayColors[this.cIndex][0]+','+this.opacity+')';
      this.sColor = 'rgba('+arrayColors[this.cIndex][1]+','+this.opacity+')';
    } else {
      // Standard value of global counter
      this.gCounter = 25;
      // Set opacity to 1 (to be on the safe side)
      this.opacity = 1;
      // Reset birthFlag
      this.birthFlag = false;
      // LF begins to move -> generate a random target (case 0)
      this.origC = this.lfCenter;
      this.init();
      this.caseEvent = 0;
      this.movetoTarget();
    }
  }
  /* Life form acts (carries out an appropriate action due to certain events) */
  public walk() {
    //console.log('--------------------------------');
    //console.log('FUNCTION walk');
    // Case evaluation (caseEvent-Detection, default: case 0 = head on mTarget)
    // Check Pairing/KO mode
    if (this.pairFlag === true) {
      // Pairing -> meetPartner() -> case 7
      this.caseEvent = 7;
    } else {
      if (this.koModus === true) {
        // KO mode -> case 6
        this.caseEvent = 6;
      }
    }
    // Examination of food intake -> eat() -> case 2
    if (this.caseEvent == 0 && this.eatFlag === true) {
      this.caseEvent = 2;
    }
    // Collision check -> may results avoidKollision() -> case 1
    if (this.caseEvent == 0 || this.caseEvent == 3) {
      this.caseEvent = this.proofKollision();
    }
    // Emergency procedure for male LF's to preserve the species
    if (this.cIndex == 1 && numMale == 1) {
      if (this.prepairFlag === false && this.delFlag === false && this.eatFlag === false && this.pCounter != 0) {
        this.pCounter = 0;
        this.partnerIndex = null;
        this.partnerFlag = false;
        this.foodFlag = false;
        console.log('Species conservation procedure for male LF ',this.lfNumber,' was called.');
        //console.log('prepairFlag: ',this.prepairFlag);
        //console.log('pairFlag: ',this.pairFlag);
        //console.log('partnerIndex: ',this.partnerIndex);
        //console.log('foodFlag: ',this.foodFlag);
        //console.log('eLevel: ',this.eLevel);
        //console.log('pCounter: ',this.pCounter);
        this.caseEvent = 0;
        this.caseEvent = this.searchPartner();
      }
    }
    // Searching for a partner (only male LFs, cIndex = 1) -> successful search generates case 3
    if (this.cIndex == 1 && this.caseEvent == 0 && /*this.avoidCourse === false &&*/ this.eLevel > this.pLevel && this.foodFlag === false && this.prepairFlag === false && this.pCounter <= 0) {
      this.caseEvent = this.searchPartner();
    }
    // Examination goal = partner -> walktoPartner () -> case 3
    if (this.caseEvent == 0 && this.partnerFlag === true && this.prepairFlag === true) {
      this.caseEvent = 3;
    }
    // Search for food -> sets foodFlag and generates case 0, when the goal is reached, foodFlag generates case 2
    if (this.caseEvent == 0 && this.eLevel < this.hLevel && this.foodFlag === false && this.prepairFlag === false) {
      this.caseEvent = this.searchFood();
    }
    //console.log('walk -> caseEvent =',this.caseEvent);
    // Carry out an action according to the evaluated event
    switch (this.caseEvent) {
      case 0:
        // Go to target / alternative destination
        this.movetoTarget();
        break;
      case 1:
        // Avoid collision
        this.avoidKollision();
        break;
      case 2:
        // Ingestion
        this.eat();
        break;
      case 3:
        // Go to the partner
        this.walktoPartner();
        break;
      case 4:
        // LF collision
        this.accidentKollision();
        break;
      case 5:
        // Block / food source collision
        this.accidentBFKollision();
        break;
      case 6:
        // KO mode
        this.execKOmodus();
        break;
      case 7:
        // Meeting partner / pairing
        this.meetPartner();
        break;
      case 8:
        // Move back
        this.walkBack();
        break;
      case 9:
        // FadeOut/Delete
        this.fadeOut();
        break;
      case 10:
        // FadeIn/Birth
        this.fadeIn();
        break;
      default:
        // Just to be on the safe side: head for the target
        this.movetoTarget();
    }
    // Calculate the lifetime of the life form
    if (zaehler / timeIntervall == Math.abs(zaehler / timeIntervall)) this.lifeTime -= 0.05;
    //console.log('lifeTime: ',this.lifeTime);
    // Decrement energy level
    this.eLevel -= 0.05;
    //console.log('eLevel: ',this.eLevel);
    // Check lifetime / energy level expired (lifeTime / eLevel < 0)
    if (this.caseEvent != 9 && this.delFlag === false && this.koModus === false && this.birthFlag === false) {
      if (this.lifeTime < 0) {
        console.log('Lifetime of LF ',this.lfNumber,' has expired.');
        //console.log('Lebenszeit: ',this.lifeTime);
        // Start fadeOut/Delete (case 9)
        this.changeFlag = false;
        this.delFlag = true;
        this.gCounter = 100;
        this.caseEvent = 9;
        this.fadeOut();
      } else {
        if (this.eLevel < 0 && this.eatFlag === false) {
          console.log('Energy-Level of LF ',this.lfNumber,' has expired.');
          //console.log('Energie-Level: ',this.eLevel);
          // Start fadeOut/Delete (case 9)
          this.changeFlag = false;
          this.delFlag = true;
          this.gCounter = 100;
          this.caseEvent = 9;
          this.fadeOut();
        }
      }
    }
    // Set opacity to 1 (to be on the safe side)
    if (this.birthFlag === false && this.delFlag === false) this.opacity = 1;
    // Simulation stoppen (zu Testzwecken)
    //console.log('Simulation gestoppt.');
    //clearInterval(simulation);
  }
  /**
  *   Drawing the life form
  *   @param ctx - rendering context
  */
  public draw(ctx:CanvasRenderingContext2D):void {
    // Circle (green) at fadeIn
    if (this.birthFlag === true) {
      var kcenter = transformTDPoint(this.lfCenter);
      var radius = this.lfLength / 2 + 1;
      var k = new Kreis(kcenter, radius, 0, Math.PI * 2, '', '0,255,0', this.opacity, 1, 'stroke');
      k.draw(ctx);
    }
    // Circle (red) at fadeOut
    if (this.delFlag === true) {
      var kcenter = transformTDPoint(this.lfCenter);
      var radius = this.lfLength / 2 + 1;
      var k = new Kreis(kcenter, radius, 0, Math.PI * 2, '', '255,0,0', this.opacity, 1, 'stroke');
      k.draw(ctx);
    }
    // Set opacity to 1 (to be on the safe side)
    if (this.birthFlag === false && this.delFlag === false) this.opacity = 1;
    // Creating the array of points of the life form (system coordinates) for drawing as a veForm
    var aPoints:Array<Point> = [];
    for (var n = 0; n < this.nodes.length; n++) {
      var x = this.nodes[n].x + this.lfCenter.x;
      var y = this.nodes[n].y + this.lfCenter.y;
      aPoints[n] = transformTDPoint(new Point(x, y));
    }
    // Draw the life form as a veForm (any shape with four corner points)
    var lf = new veForm(aPoints, this.fColor, this.sColor, 1, 'fillstroke');
    lf.draw(ctx);
  }
}
/** Class Block (obstacle) */
class Block {
  /** Properties */
  public bCenter:Point  = null;
  public bWidth:number  = 0;
  public bLength:number = 0;
  public rAngle:number  = 0;
  public bnumber:number = 0;
  /** Vars */
  private nodes:Array<Point>;   // Array of the block points
  private sColor:string         // Stroke color
  private fColor:string         // Fill color
  /**
  *   Constructs a block in 2D space 
  *   @param bCenter  Center of the block (X,Y)
  *   @param bfWidth  Width of the block (Y)
  *   @param bLength  Length of the block (X)
  *   @param rAngle   Rotation angle of the block (Z-axis, function rotateNodes (rAngle))
  *   @param bnumber  Array number (index) of the block
  */
  public constructor(bCenter:Point, bWidth:number, bLength:number, rAngle:number, bnumber:number) {
    // Take over properties
  	this.bCenter = bCenter
    this.bWidth  = bWidth;
    this.bLength = bLength;
    this.rAngle  = rAngle;
    this.bnumber = bnumber;
    // Vars
    this.nodes = [];
    this.fColor = '#aaa';
    this.sColor = '#aaa';
    // Call initialization procedures
    this.init();
  }
  /** Functions */
  // Rotation of the block nodes in virtual space to theta degrees
  private rotateNodes(theta:number) {
    for (var n = 0; n < this.nodes.length; n++) {
      var node = this.nodes[n];
      this.nodes[n] = rotateTDPointZ(theta, node);
    }
  }
  // Rotate the block in virtual space to theta degrees (not used here)
  private rotateMe(theta:number) {
    this.initNodes();
    this.rotateNodes(theta);
    this.rAngle = theta;
  }
  /** Initialization procedures */
  // Initialization of the nodes of the block in the virtual space (center point = 0,0)
  private initNodes() {
    var node0 = new Point(0 - this.bLength/2, 0 + this.bWidth/2);
    var node1 = new Point(0 + this.bLength/2, 0 + this.bWidth/2);
    var node2 = new Point(0 + this.bLength/2, 0 - this.bWidth/2);
    var node3 = new Point(0 - this.bLength/2, 0 - this.bWidth/2);
    this.nodes = [node0, node1, node2, node3];
  }
  // Initialization procedure
  private init() {
    this.initNodes();
    this.rotateNodes(this.rAngle);
  }
  /**
  *   Draw the block
  *   @param ctx - rendering context
  */
  public draw(ctx:CanvasRenderingContext2D):void {
    // Create the array of points of the block for drawing as a veForm
    var aPoints:Array<Point> = [];
    for (var n = 0; n < this.nodes.length; n++) {
      var x = this.nodes[n].x + this.bCenter.x;
      var y = this.nodes[n].y + this.bCenter.y;
      aPoints[n] = transformTDPoint(new Point(x, y));
    }
    // Draw the block as a veForm (any shape with four corner points)
    var b = new veForm(aPoints, this.fColor, this.sColor, 1, 'fillstroke');
    b.draw(ctx);
  }
}
/** Class Food (Food source) */
class Food {
  /** Properties */
  public cCenter:Point = null;
  /** Vars */
  private growState:number;   // Growth status (growColor: <25 = 0, 25 - <50 = 1, 50 - <75 = 2, 75 - 100 = 3)
  private growSpeed:number;   // Growth speed
  public growColor:number;    // Growth color, at the same time edible (0 - 2: inedible, 3 = edible)
  public occupyFlag:boolean;  // Occupation flag (false: no, true: yes)
  /**
  *   Construct a food source in 2D space
  *   @param cCenter  X-, Y-Koordinate des Nahrungsquellen-Zentrums
  */
  public constructor(cCenter:Point) {
    // Take over property
    this.cCenter = cCenter;
    // Initialization
    this.init();
  }
  /** Initialization */
  private init() {
    // Vars for growth
    this.growState = 0;
    this.growSpeed = 0.07 + ((Math.random() + 0.01) / 10);
    this.growColor = 0;
    // Occupation flag
    this.occupyFlag = false;
  }
  /** Growth function */
  public grow() {
    this.growState += this.growSpeed;
    //console.log('growState: ',this.growState);
    if (this.growState > 100) {
      this.growColor = 0;
      this.growState = 0;
    } else {
      // Calculate growColor according to the growState
      this.growColor = Math.ceil(this.growState / 25) - 1;
      //console.log('growColor: ',this.growColor);
    }
  }
  /**
  *   Draw the food source in 2D space
  *   @param ctx - rendering context
  */
  public draw(ctx:CanvasRenderingContext2D):void {
    // Conversion of the virtual center point into the system coordinates
    var cCenter = transformTDPoint(this.cCenter);
    // Draw the food source as a circle (class Kreis)
    var k = new Kreis(cCenter, 1.5 , 0, Math.PI * 2, arrayFColors[this.growColor], '', 1, 1, 'fill');
    k.draw(ctx);
  }
}
/** Additional classes
    - Point
    - veForm
    - Kreis
*/
/** Class Point */
class Point {
  x: number;
  y: number;
  constructor(x:number, y:number) {
    this.x = x;
    this.y = y;
  }
  add(p:Point) {
    return new Point(
      this.x + p.x,
      this.y + p.y
    );
  }
  subtract(p:Point) {
    return new Point(
      this.x - p.x,
      this.y - p.y
    );
  }
  copy() {
    return this.add(new Point(0, 0));
  }
  distanceTo(p:Point) {
    let dx = p.x - this.x;
    let dy = p.y - this.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  projectOntoCircle(point:Point, radius:number) {
    let angle = this.getAngleBetween(point);
    let newX = point.x + Math.cos(angle) * radius;
    let newY = point.y + Math.sin(angle) * radius;
    return new Point(newX, newY);
  }
  getAngleBetween(point:Point) {
    let delta = this.subtract(point);
    let angle = Math.atan2(delta.y, delta.x);
    return angle;
  }
}
/** Class veForm (any 2D shape with four corner points) - used by lForm and Block
    Uses        moveTo() und lineTo()
    JS-Syntax   context.moveTo(xStart,yStart);
                context.lineTo(xEnd,yEnd);
*/
class veForm {
  public points:Array<Point> = [];
  public fcolor:string = '';
  public scolor:string = '';
  public lwidth:number = 0;
  public dflag:string  = '';
  /**
  *   Constructs a veForm in 2D space
  *   @param points  Array of the X and Y coordinates of the four veForm points
  *   @param fcolor  Fill color
  *   @param scolor  Stroke color
  *   @param lwidth  Line width
  *   @param dflag   Draw-Flag: fill, stroke or fillstroke
  */
  public constructor(points:Array<Point>, fcolor:string, scolor:string, lwidth:number, dflag:string) {
  	this.points = points;
    this.fcolor = fcolor;
    this.scolor = scolor;
    this.lwidth = lwidth;
    this.dflag  = dflag;
  }
  /**
  *   Subroutine for drawing the veForm
  *   @param ctx - rendering context
  */
  private drawveForm(ctx:CanvasRenderingContext2D):void {
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    ctx.lineTo(this.points[1].x, this.points[1].y);
    ctx.lineTo(this.points[2].x, this.points[2].y);
    ctx.lineTo(this.points[3].x, this.points[3].y);
    ctx.closePath();
  }
  /**
  *   Draws a veForm in 2D space
  *   @param ctx - rendering context
  */
  public draw(ctx:CanvasRenderingContext2D):void {
    switch(this.dflag) {
      case 'fill': 
        ctx.fillStyle = this.fcolor;
        this.drawveForm(ctx);
        ctx.fill();
        break;
      case 'stroke':
        ctx.strokeStyle = this.scolor;
        ctx.lineWidth = this.lwidth;
        this.drawveForm(ctx);
        ctx.stroke();
        break;
      case 'fillstroke':
        ctx.fillStyle = this.fcolor;
        ctx.strokeStyle = this.scolor;
        ctx.lineWidth = this.lwidth;
        this.drawveForm(ctx);
        ctx.stroke();
        ctx.fill();
    }
  }
}
/** Class Kreis (Circle) - used by food
    Used        arc()
    JS-Syntax   context.arc(x,y,r,sAngle,eAngle[,counterclockwise]);
*/
class Kreis {
  public cCenter:Point  = null;
  public radius:number  = 0;
  public sAngle:number  = 0;
  public eAngle:number  = 0;
  public fcolor:string  = '';
  public scolor:string  = '';
  public opacity:number = 1;
  public lwidth:number  = 0;
  public dflag:string   = '';
  /**
  *   Constructs a circle in 2D space
  *   @param cCenter  X-, Y-coordinate of the circle center
  *   @param radius   Radius of the circle
  *   @param sAngle   Starting angle, in rad
  *   @param eAngle   End angle, in rad
  *   @param fcolor   Fill color
  *   @param scolor   Stroke color
  *   @param opacity  Opacity
  *   @param lwidth   Line width
  *   @param dflag    Draw-Flag: fill, stroke or fillstroke
  */
  public constructor(cCenter:Point, radius:number, sAngle:number, eAngle:number, fcolor:string, scolor:string, opacity:number, lwidth:number, dflag:string) {
  	this.cCenter = cCenter;
    this.radius  = radius;
    this.sAngle  = sAngle;
    this.eAngle  = eAngle;
    this.fcolor  = fcolor;
    this.scolor  = scolor;
    this.opacity = opacity;
    this.lwidth  = lwidth;
    this.dflag   = dflag;
    // Create color strings (form: 'rgba(r, g, b, o)'
    this.fcolor = 'rgba('+this.fcolor+','+this.opacity+')';
    this.scolor = 'rgba('+this.scolor+','+this.opacity+')';
  }
  /**
  *   Draws a circle in 2D space
  *   @param ctx - rendering context
  */
  public draw(ctx:CanvasRenderingContext2D):void {
    ctx.beginPath();
    ctx.arc(this.cCenter.x, this.cCenter.y, this.radius, this.sAngle, this.eAngle);
    switch(this.dflag) {
      case 'fill': 
        ctx.fillStyle = this.fcolor;
        ctx.fill();
        break;
      case 'stroke':
        ctx.strokeStyle = this.scolor;
        ctx.lineWidth = this.lwidth;
        ctx.stroke();
        break;
      case 'fillstroke':
        ctx.fillStyle = this.fcolor;
        ctx.fill();
        ctx.strokeStyle = this.scolor;
        ctx.lineWidth = this.lwidth;
        ctx.stroke();
    }
  }
}