/** RaWi-TS-Projekt: Lebensform-Simulation Version 1.0
*   TypeScript-File: ./_ts-de/lfs-de.ts
*   JavaSript-File:  ./js/lfs-de.js
*   CSS-File:        ./css/lfs.min.css
*/
/** Globale Variablen */
// Canvas
var canvasCenter:Point;          // Canvas-Zentrum
var canvasWidth:number;          // Canvas-Breite (wird evaluiert)
var canvasHeight:number;         // Canvas-Höhe (wird evaluiert)
// Lebensformen
var arrayLF:Array<any> = [];     // Array der Lebensformen [objekt, centerPoint, cIndex (0 = weiblich, 1 = männlich)]
var numLFs:number = 6;           // Anzahl der Lebensformen beim Start der Simulation (Minimum 4 LF's)
var numFemale:number;            // Anzahl der weiblichen Lebensformen
var numMale:number;              // Anzahl der männlichen Lebensformen
var lifeTime:number = 100;       // Lebenszeit der Lebensformen (Grundzeit, es wird noch ein Zufallswert addiert)
// Farben-Array Lebensform: fill color, stroke color (definiert durch cIndex)
var arrayColors = [['255,80,210','255,80,210'],['55,176,255','55,176,255']];
// Blocks (Hindernisse)
var arrayBlock:Array<any>;       // Array der Blocks [objekt, centerPoint]
// Foods (Nahrungsquellen)
var arrayFood:Array<any>;        // Array der Foods [objekt, centerPoint]
// Farben-Array Foods: fill color (abhängig vom aktuellen growState 0 bis 3)
// growState 0: ungenießbar (ausweichen), growState 1: sprießt (ausweichen)
// growState 2: wächst/reift heran (ausweichen),  growState 3: reif (genießbar)
var arrayFColors = ['96,96,96','72,130,75','46,177,52','0,226,11'];
// Simulationssteuerung
var simulation:any;              // Variable des Timers (kann für Simulations-Stopp genutzt werden)
var zaehler:number = 0;          // laufender Zähler (kann für Events wie z.B. Wachstum etc. verwendet werden)
var activeLifeforms:number = 0;  // Anzahl der aktiven Lebensformen
var tickTime:number = 50;        // Timer-Intervall der Simulation in ms
var stopTime:number = 30;        // Zeit bis zum Stopp der Simulation (activeLifeforms <= 1 / Paarung nicht möglich)
var stopFlag:boolean;            // Flag zum stoppen der Simulation wenn alle LF's das gleiche Geschlecht besitzen
var timeIntervall:number;        // Intervall für Berechnung der Simulationsdauer
var sStunde:number = 0;          // Dauer der Simulation Stunden
var sMinute:number = 0;          // Dauer der Simulation Minuten
var sSekunde:number = 0;         // Dauer der Simulation Sekunden
var timeString:string;           // String Zeitanzeige
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
    // Globale Element-Referenz
    this.canvasdiv = document.getElementById(canvasDiv);
    // Canvas-Referenz
    this.canvas = document.getElementById(canvas);
    // RenderingContext
    this.ctx = this.canvas.getContext("2d");
    // Canvas-Parameter (ermitteln von Höhe und Breite in Abhängigkeit der Canvas)
    canvasWidth = this.canvas.getBoundingClientRect().width;
    canvasHeight = this.canvas.getBoundingClientRect().height;
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;
    canvasCenter = new Point(canvasWidth / 2, canvasHeight / 2);
    // Hintergrund-Farbe Canvas
    this.canvasBackground = '#000';
    // Div Zeitanzeige
    this.timeDisplay = document.getElementById('timedisplay');
    // Div Anzeige der Anzahl der Lebensformen
    this.lfDisplay = document.getElementById('lfdisplay');
    // Div Anzeige für Simulationsende
    this.endDisplay = document.getElementById('enddisplay');
  }
  /** Initialisierung der Blocks */
  public initBlocks() {
    //console.log('FUNCTION initBlocks');
    // Array der Blocks
    arrayBlock = [];
    // Block-Nummer
    var bNum:number = 0;
    // Blocks erzeugen (Raster) V1
    for (var i = 1; i <= 4; i++) {
      for (var j = 1; j <= 4; j++) {
        //console.log('Creating Block ',bNum);
        // Center-Point des Blocks berechnen
        var x = canvasWidth / 5 * i - canvasWidth / 2;
        var y = canvasHeight / 5 * j - canvasHeight / 2;
        var center = new Point(x,y);
        //console.log('Block-CenterPoint '+bNum+': ',center);
        var b = new Block(center, 1.4, 1.4, 0, i);
        arrayBlock[bNum] = [b, center];
        bNum += 1;
      }
    }
    /* Blocks erzeugen (Raster) V2
    for (var i = 1; i <= 5; i++) {
      for (var j = 1; j <= 5; j++) {
        //console.log('Creating Block ',bNum);
        // Center-Point des Blocks berechnen
        var x = canvasWidth / 5 * i - canvasWidth / 10 - canvasWidth / 2;
        var y = canvasHeight / 5 * j - canvasHeight / 10 - canvasHeight / 2;
        var center = new Point(x,y);
        //console.log('Block-CenterPoint '+bNum+': ',center);
        var b = new Block(center, 1.4, 1.4, 0, i);
        arrayBlock[bNum] = [b, center];
        bNum += 1;
      }
    }*/
  }
  /** Initialisierung der Foods */
  public initFoods() {
    //console.log('FUNCTION initFoods');
    // Array der Foods
    arrayFood = [];
    // Food-Nummer
    var fNum:number = 0;
    // Foods erzeugen (Raster) V1
    for (var i = 1; i <= 5; i++) {
      for (var j = 1; j <= 5; j++) {
        //console.log('Creating Food ',fNum);
        // Center-Point des Foods berechnen
        var x = canvasWidth / 5 * i - canvasWidth / 10 - canvasWidth / 2;
        var y = canvasHeight / 5 * j - canvasHeight / 10 - canvasHeight / 2;
        var center = new Point(x,y);
        //console.log('Food-CenterPoint '+fNum+': ',center);
        var f = new Food(center);
        arrayFood[fNum] = [f, center];
        fNum += 1;
      }
    }
    /* Foods erzeugen (Raster) V2
    for (var i = 1; i <= 4; i++) {
      for (var j = 1; j <= 4; j++) {
        //console.log('Creating Food ',fNum);
        // Center-Point des Foods berechnen
        var x = canvasWidth / 5 * i - canvasWidth / 2;
        var y = canvasHeight / 5 * j - canvasHeight / 2;
        var center = new Point(x,y);
        //console.log('Food-CenterPoint '+fNum+': ',center);
        var f = new Food(center);
        arrayFood[fNum] = [f, center];
        fNum += 1;
      }
    }*/
  }
  /** Zufälligen Center-Point einer LF erstellen */
  public createLFcenter() {
    // Center-Point der LF per Zufall generierenen
    var center = getRandompoint();
    // Prüfen ob das LF-Center zu nah (< 20) an einem Block liegt -> neues LF-Center erstellen
    for (var i = 0; i < arrayBlock.length; i++) {
      var d = center.distanceTo(arrayBlock[i][1]);
      if (d < 20) this.createLFcenter();
    }
    return center;   
  }
  /** Initialisierung der Lebensformen */
  public initLforms() {
    //console.log('--------------------------------');
    //console.log('FUNCTION initLforms');
    // Vars
    var center:Point;
    var cIndex:number;
    var lf:lForm;
    // Die ersten vier Lebensformen erzeugen (somit sind beide Geschlechter jeweils zwei Mal vorhanden)
    // LF 0
    // Center-Point der LF generierenen
    center = this.createLFcenter();
    // Weibliche LF erzeugen
    lf = new lForm(center, 3.5, 7, 0, 0);
    // LF in Array aufnehmen
    arrayLF[0] = [lf, center, 0];
    // LF 1
    // Center-Point der LF generierenen
    center = this.createLFcenter();
    // Männliche LF erzeugen
    lf = new lForm(center, 3.5, 7, 1, 1);
    // Paarungszähler auf 0 setzen (sofortige Paarung)
    lf.pCounter = 0;
    // LF in Array aufnehmen
    arrayLF[1] = [lf, center, 1];
    // LF 2
    // Center-Point der LF generierenen
    center = this.createLFcenter();
    // Weibliche LF erzeugen
    lf = new lForm(center, 3.5, 7, 0, 2);
    // LF in Array aufnehmen
    arrayLF[2] = [lf, center, 0];
    // LF 3
    // Center-Point der LF generierenen
    center = this.createLFcenter();
    // Männliche LF erzeugen
    lf = new lForm(center, 3.5, 7, 1, 3);
    // Paarungszähler auf 0 setzen (sofortige Paarung)
    lf.pCounter = 0;
    // LF in Array aufnehmen
    arrayLF[3] = [lf, center, 1];
    // Wenn numLFs > 2 weitere Lebensformen (Geschlecht zufällig) erzeugen
    if (numLFs > 4) {
      for (var i = 4; i < numLFs; i++) {
        //console.log('Creating LF ',i);
        // Center-Point der LF generierenen
        center = this.createLFcenter();
        //console.log('CenterPoint: ',center);
        // Random cIndex der LF (0: weiblich, 1: männlich)
        cIndex = Math.round(Math.random());
        //console.log('cIndex: ',cIndex);
        lf = new lForm(center, 3.5, 7, cIndex, i);
        lf.pCounter = 1;
        arrayLF[i] = [lf, center, cIndex];
        //console.log('Lebensform ',i,': ',arrayLF[i]);
      }
    }
    // Anzahl der aktiven Lebensformen
    activeLifeforms = arrayLF.length;
    //console.log('arrayLF nach Init: ',arrayLF);
  }
  /** Intialisierungs-Prozeduren */
  public initSimulation() {
    // Intervall für Berechnung der Simulationsdauer
    timeIntervall = 1000 / tickTime;
    // Intialisierung der Blocks (Hindernisse)
    this.initBlocks();
    // Initialisierung der Foods (Nahrungsquellen)
    this.initFoods();
    // Intialisierung der Lebensformen
    this.initLforms();
    // Canvas rendern
    this.render(this.ctx);
    // Simulation starten
    this.startSimulation();
  }
  /** Start der Simulation bzw. des Timers */
  private startSimulation() {
  	simulation = window.setInterval(this.tick, tickTime);
  }
  /** Intervall-Prozedur der Simulation (Timer) */
  private tick = () => {
    // Aktionen der Lebensformen inkl. Eruierung der Anzahl der aktiven/weiblichen/männlichen Lebensformen
    var lfs:number = 0;
    var numF:number = 0;
    var numM:number = 0;
    for (var i = 0; i < arrayLF.length; i++) {
      //console.log('Aufruf walk() für LF ',i);
      if (arrayLF[i] != undefined) { 
        arrayLF[i][0].walk();
        lfs += 1;
        if (arrayLF[i] != undefined && arrayLF[i][2] == 0) numF += 1; else numM += 1;
      }
    }
    // Aktualisierung der Anzeige
    activeLifeforms = lfs;
    numFemale = numF;
    numMale = numM;
    this.lfDisplay.innerHTML = 'Lebensformen: ' + activeLifeforms + ' (' + numFemale + ' weiblich / ' + numMale + ' männlich)';
    // Aktionen der Nahrungsquellen
    for (var i = 0; i < arrayFood.length; i++) {
      //console.log('Aufruf grow() für Nahrungsquelle ',i);
      if (arrayFood[i] != undefined) { 
        arrayFood[i][0].grow();
      }
    }
    // Canvas rendern
    this.render(this.ctx);
    // Zähler inkrementieren
    zaehler += 1;
    // Simulationszeit berechnen
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
    // Stopp der Simulation einleiten wenn alle LF's das gleiche Geschlecht besitzen (keine Paarung mehr möglich)
    if (activeLifeforms > 1) {
      var dIndex:number;
      var cIndex:number;
      stopFlag = true;
      dIndex = getdefinedIndex();
      //if (dIndex < 0) dIndex = 0;
      if (arrayLF[dIndex] != undefined) cIndex = arrayLF[dIndex][2];
      for (var i = dIndex + 1; i < arrayLF.length; i++) {
        if (arrayLF[i] != undefined && arrayLF[i][2] != cIndex) stopFlag = false;
      }
    }
    // Simulation stoppen wenn nur noch eine LF aktiv ist oder stopFlag = true (nur noch gleiche Geschlechter)
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
    // Clear Canvas (mit Background-Farbe)
    ctx.fillStyle = this.canvasBackground;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    // Blocks zeichnen
    for (var i = 0; i < arrayBlock.length; i++) {
      //console.log('Block ',i,': ',arrayBlock[i]);
      arrayBlock[i][0].draw(ctx);
    }
    // Foods zeichnen
    for (var i = 0; i < arrayFood.length; i++) {
      //console.log('Food ',i,': ',arrayFood[i]);
      arrayFood[i][0].draw(ctx);
    }
    // Lebensformen zeichnen
    for (var i = 0; i < arrayLF.length; i++) {
      //console.log('LF ',i,': ',arrayLF[i]);
      if (arrayLF[i] != undefined) arrayLF[i][0].draw(ctx);
    }
    // Meldung Ende der Simulation
    if ( stopTime <= 1) {
      this.endDisplay.style.display = 'block';
    }
  }
}
/** Globale Funktionen */
// Buttons umschalten (wenn Simulation beendet)
function changeButtons() {
  var b1:any = document.getElementById('b1');
  b1.disabled = false;
  var b2:any = document.getElementById('b2');
  b2.disabled = true;
}
// Transformormation der Objekt-Koordinaten in die System-Koordinaten
function transformTDPoint(tdpoint:Point) {
  var x = canvasCenter.x + tdpoint.x;
  var y = canvasCenter.y + tdpoint.y;
  return new Point(x,y);
}
// Rotation eines Points um die Z-Achse
function rotateTDPointZ(theta:number, tdpoint:Point) {
  var w = theta * Math.PI / 180;
  var sinTheta = Math.sin(w);
  var cosTheta = Math.cos(w);
  return new Point(tdpoint.x * cosTheta - tdpoint.y * sinTheta, tdpoint.y * cosTheta + tdpoint.x * sinTheta);
}
// Random-Point erstellen
function getRandompoint() {
  var x = Math.floor((Math.random() * (canvasWidth - 40))) - (canvasWidth / 2 - 20);
  var y = Math.floor((Math.random() * (canvasHeight - 40))) - (canvasHeight / 2 - 20);
  return new Point(x, y);
}
// Suche nach dem ersten undefinierten Array-Eintrag in arrayLF
function getundefinedIndex() {
  for (var i = 0; i < arrayLF.length; i++) {
    if (arrayLF[i] == undefined) return i;
  }
  return arrayLF.length;
}
// Suche nach dem ersten definierten Array-Eintrag in arrayLF
function getdefinedIndex() {
  for (var i = 0; i < arrayLF.length; i++) {
    if (arrayLF[i] != undefined) return i;
  }
  return 0;
}
/** Objekt-Klassen der Simulation
    - lForm
    - Block
    - Food 
*/
/** Class lForm (Lebensform) */
class lForm {
  /** Properties */
  public lfCenter:Point  = null;
  public lfWidth:number  = 0;
  public lfLength:number = 0;
  public cIndex:number   = 0;
  public lfNumber:number = 0;
  /** Private Vars */
  private rAngle:number;        // Rotationswinkel der Lebensform (Z-Achse, Funktion rotateNodes(rAngle))
  private origC:Point;          // Original- bzw. Ausgangs-CenterPoint der Lebensform
  private sColor:string         // Stroke color
  private fColor:string         // Fill color
  private nodes:Array<Point>;   // Array der Lebensform-Punkte
  private step:number;          // Schrittweite (Geschwindigkeit)
  private mTarget:Point;        // Haupt-Ziel (mainTarget) der Lebensform
  private aTarget:Point;        // Ausweich-Ziel (avoidTarget) der Lebensform (case 1)
  private kollIndex:number;     // Index der Kollisions-Lebensform
  private avoidCourse:boolean;  // Flag für Ausweichkurs (false: Standardkurs fahren, true: Ausweichkurs fahren)
  private avoidMode:number;     // Ausweich-Modus (0: LF, 1: Block, 2: ungenießbare Nahrungsquelle)
  private kollDistance:number;  // Scan-Distanz zur Vermeidung einer Kollision (random von 7 bis 10)
  private koCounter:number;     // Zähler KO-Modus
  private lifeTime:number;      // Lebenszeit
  private hLevel:number;        // Hunger-Level (wird dieser Wert unterschritten sucht die LF nach Nahrung)
  private foodIndex:number;     // Index der Nahrungsquelle
  private eatFlag:boolean;      // Flag für Nahrungsaufnahme (true: essen, false: Aktion weiterführen)
  private partnerFlag:boolean;  // Flag für Ziel (true: Partner, false: mTarget/aTarget)
  private meetDistance:number;  // Distanz für Einleitung der Paarung
  /** Public Vars */
  public caseEvent:number;      // Auszuführende Aktion (case) der Lebensform
  public opacity:number;        // Opazität
  public gCounter:number;       // Globaler Zähler (Nahrungsaufnahme/fadeOut/fadeIn/meetPartner)
  public pCounter:number;       // Paarungs-Zähler (nur männliche LFs, bei Nahrungsaufnahme -=1, <= 0 erlaubt Paarung)
  public koModus:boolean;       // KO-Modus (false: agieren, true: für eine Weile stehen bleiben und dabei rotieren)
  public eLevel:number;         // Energie-Level (0 bis 100)
  public changeFlag:boolean;    // Änderungen der eigenen Verhaltensweise durch andere LF zulassen (true)
  public foodFlag:boolean;      // Flag für Ziel (true: Nahrungsquelle, false: mTarget/aTarget)
  public delFlag:boolean;       // Delete-Flag (true blendet roten Kreis bei fadeOut ein)
  public pLevel:number;         // Paarungs-Level (wird dieser Wert unterschritten findet keine Paarung statt)
  public prepairFlag:boolean;   // Flag für Paarung vorbereiten/okkupieren (true: Paarung für andere LFs sperren)
  public pairFlag:boolean;      // Flag für Paarung (true: paaren, false: Aktion walktoPartner weiterführen)
  public partnerIndex:number;   // Array-Index der Partner-Lebensform
  public birthFlag:boolean;     // Birth-Flag (true blendet grünen Kreis bei fadeIn ein)
  /**
  *   Konstruiert eine Lebensform im 2D-Raum 
  *   @param lfCenter  Zentrum der Lebensform (X,Y)
  *   @param lfWidth   Breite der Lebensform (Y)
  *   @param lfLength  Länge der Lebensform (X)
  *   @param cIndex    Color index (0: weiblich, 1: männlich)
  *   @param lfNumber  Array-Index der Lebensform
  */
  public constructor(lfCenter:Point, lfWidth:number, lfLength:number, cIndex:number, lfNumber:number) {
    // Properties übernehmen
  	this.lfCenter = lfCenter
    this.lfWidth  = lfWidth;
    this.lfLength = lfLength;
    this.cIndex   = cIndex;
    this.lfNumber = lfNumber;
    // Vars
    this.origC = lfCenter;
    this.nodes = [];
    // Event auf 0 voreinstellen (case 0 -> mTarget ansteuern)
    this.caseEvent = 0;
    // Scan-Distanz für Kollision (variiert, um zeitgleiches Ausweichen zu vermeiden)
    this.kollDistance = this.lfWidth + this.lfLength + Math.random() * 3;
    // Opazität
    this.opacity = 1;
    // Farben-Strings (spiegeln das Geschlecht wider, Form: 'rgba(r,g,b,opacity)')
    this.fColor = 'rgba('+arrayColors[this.cIndex][0]+','+this.opacity+')';
    this.sColor = 'rgba('+arrayColors[this.cIndex][1]+','+this.opacity+')';
    // Lebenszeit
    this.lifeTime = lifeTime + Math.round(Math.random() * lifeTime / 2);
    // Energie-Level (variiert, um zeitgleiche Nahrungsaufnahme zu vermeiden)
    this.eLevel = 50 + Math.round(Math.random() * 50);
    // Hunger-Level
    this.hLevel = 50;
    // Paarungs-Level (Untergrenze)
    this.pLevel = 25;
    // Distanz für Einleitung der Paarung bzw. Ziel (mTarget/aTarget) erreicht
    this.meetDistance = 2.5;
    // Paarungs-Zähler (gilt nur für männliche LFs, bei Nahrungsaufnahme -= 1 -> pCounter <= 0: Paarung erlaubt)
    this.pCounter = 1;
    // Partner-Index
    this.partnerIndex = null;
    // KO-Zähler
    this.koCounter = 100;
    // Globaler Zähler für eat/fadeOut/fadeIn/meetPartner
    this.gCounter = 25;
    // Initalisierungs-Prozeduren
    this.init();
  }
  /** Funktionen */
  // Rotieren der Lebensform-Nodes im virtuellen Raum auf theta Grad
  private rotateNodes(theta:number) {
    for (var n = 0; n < this.nodes.length; n++) {
      var node = this.nodes[n];
      this.nodes[n] = rotateTDPointZ(theta, node);
    }
  }
  // Rotieren der Lebensform im virtuellen Raum auf theta Grad
  private rotateMe(theta:number) {
    this.initNodes();
    this.rotateNodes(theta);
    this.rAngle = theta;
  }
  // Berechnung der Geschwindigkeit (Schrittweite in Abhängikeit der Distanz zum Target)
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
  // Rotationswinkel auf Ziel berechnen
  private calcAngle(target:Point) {
    //console.log('FUNCTION calcAngle');
    var rotAngleRad = this.origC.getAngleBetween(target) + Math.PI * 2;
    //console.log('rotAngleRad: ',rotAngleRad);
    var rotAngleDeg = Math.round((180 / Math.PI * rotAngleRad) - 180);
    //console.log('rotAngleDeg: ',rotAngleDeg);
    return rotAngleDeg;
  }
  /** Initalisierungs-Prozeduren */
  // Initalisierung der Nodes der Lebensform im virtuellen Raum (Centerpoint = 0,0)
  private initNodes() {
    var node0 = new Point(this.lfLength / 2, 0);
    var node1 = new Point(-this.lfLength / 2, +this.lfWidth / 2);
    var node2 = new Point(-this.lfLength / 5, 0);
    var node3 = new Point(-this.lfLength / 2, -this.lfWidth / 2);
    this.nodes = [node0, node1, node2, node3];
  }
  // Initalisierung der Flags
  private initFlags() {
    // Flag für Ausweichkurs fahren
    this.avoidCourse = false;
    // Change-Flag für Änderungen der eigenen Verhaltensweise durch andere LF zulassen (TRUE)
    this.changeFlag = true;
    // Delete-Flag (true blendet roten Kreis bei fadeOut ein)
    this.delFlag = false;
    // Flag KO-Modus (false: agieren, true: für eine Weile stehen bleiben und sich dabei drehen)
    this.koModus = false;
    // Flag für Ziel = Nahrungsquelle (true: Nahrungsquelle, false: mTarget/aTarget)
    this.foodFlag = false;
    // Flag für Nahrungsaufnahme (true: essen, false: Aktion weiterführen)
    this.eatFlag = false;
    // Flag für Ziel = Partner (true: Partner, false: mTarget/aTarget)
    this.partnerFlag = false;
    // Flag für Paarung vorbereiten (true: Paarung für andere LFs sperren)
    this.prepairFlag = false;
    // Flag für Paarung (true: paaren, false: Aktion weiterführen)
    this.pairFlag = false;
    // Birth-Flag (true blendet grünen Kreis bei fadeIn ein)
    this.birthFlag = false;
  }
  /** LF-Prozeduren */
  // Zufallsziel der Lebensform festlegen
  private initTarget() {
    //console.log('--------------------------------');
    //console.log('FUNCTION initTarget');
    //console.log('LF-Nummer: ',this.lfNumber);
    this.mTarget = getRandompoint();
    //console.log('Target:',this.mTarget);
    // Prüfen ob das Target zu nah an einem Block liegt -> wenn ja, dann neues Target erstellen
    for (var i = 0; i < arrayBlock.length; i++) {
      var d = this.mTarget.distanceTo(arrayBlock[i][1]);
      if (d < this.kollDistance) this.initTarget();
    }
    var distance = this.origC.distanceTo(this.mTarget);
    //console.log('Distanz zum Target: ',distance);
    // Distanz zum neuen Ziel zu klein -> erneut neues Ziel festlegen
    if (distance < this.kollDistance) this.initTarget();
    this.step = this.calculateSpeed(distance);
    //console.log('Speed: ',this.step);
  }
  // Initalisierungs-Prozeduren aufrufen
  private init() {
    this.initNodes();
    this.initFlags();
    this.initTarget();
    this.rAngle = this.calcAngle(this.mTarget);
    this.rotateNodes(this.rAngle);
  }
  // Initialisierung der Geburt einer Lebensform
  private initBirth(center:Point) {
    // Vars
    var aIndex:number
    var cIndex:number;
    var lf:lForm;
    //console.log('arrayLF vor Geburt: ',arrayLF);
    // Undefinierten Index in arrayLF suchen
    aIndex = getundefinedIndex();
    //console.log('Array-Index der neuen LF: ',aIndex);
    console.log('LF ',aIndex,' ist geboren.');
    // Random-Color-Index der LF (0: weiblich, 1: männlich)
    cIndex = Math.round(Math.random());
    //console.log('ColorIndex der neuen LF: ',cIndex);
    // LF erzeugen
    lf = new lForm(center, 3.5, 7, cIndex, aIndex);
    // Opazität der LF auf 0 setzen
    lf.opacity = 0;
    // Globaler Zähler auf 0 setzen
    lf.gCounter = 0;
    // Änderungen der eigenen Verhaltensweise durch andere LF sperren (false)
    lf.changeFlag = false;
    // Geburts-Flag setzen
    lf.birthFlag = true;
    // CaseEvent setzen (fadeIn)
    lf.caseEvent = 10;
    // LF in das Array der Lebensformen aufnehmen
    arrayLF[aIndex] = [lf, center, cIndex];
    // Simulation stoppen (zu Testzwecken)
    //console.log('Simulation gestoppt.');
    //clearInterval(simulation);
  }
  /** Basis-Routinen der Lebensform */
  // Kollisionsprüfung (erzeugt/returns case entsprechend der Fallunterscheidung)
  private proofKollision() {
    //console.log('--------------------------------');
    //console.log('FUNCTION proofKollision');
    // Array der Lebensformen durchsuchen und Distanz zur jeweiligen LF ermitteln
    // Fallunterscheidung: gleiches/ungleiches Geschlecht (cIndex)
    // - LF hat gleiches Geschlecht -> ausweichen
    // - LF hat anderes Geschlecht  -> ausweichen/treffen in Abhängigkeit von eLevel
    for (var i = 0; i < arrayLF.length; i++) {
      // LF hat andere Array-Nummer, eigenes changeFlag = true, koModus = false
      if (i != this.lfNumber && arrayLF[i] != undefined && this.changeFlag === true && this.birthFlag === false ) {
        // Abstand zur anderen LF eruieren
        var distance = this.lfCenter.distanceTo(arrayLF[i][1]);
        //console.log('Distanz: ',distance);
        // Abstand kleiner als kollDistance -> Geschlecht eruieren und entsprechend reagieren
        if (distance < this.kollDistance) {
          // Array-Nummer der anderen LF
          this.kollIndex = i;
          // Ausweich-Modus setzen
          this.avoidMode = 0;
          // Geschlecht der anderen Lebensform eruieren
          var geschlecht = arrayLF[this.kollIndex][2];
          //console.log('Geschlecht andere LF: ',geschlecht);
          // Aktion gleiches/ungleiches Geschlecht
          if (geschlecht == this.cIndex) {
            // LF hat gleiches Geschlecht
            //console.log('LF hat gleiches Geschlecht!');
            // Wenn Abstand < lfLength / 2 -> Kollision findet statt (case 4)
            if (distance < this.lfLength / 2) {
              //console.log('Kollision findet statt!');
              //console.log('Distanz zur LF: ',distance);
              // Änderungen der eigenen Verhaltensweise durch andere LF sperren (FALSE)
              this.changeFlag = false;
              return 4;
            } else {
              // Abstand > lfLength / 2 -> Kollision vermeiden (case 1)
              //console.log('Kollision mit LF vermeiden!');
              //console.log('Distanz zur LF: ',distance);
              // Prüfung auf weitere LF im Kollisions-Umfeld
              for (var j = 0; j < arrayLF.length; j++) {
                if (j != this.lfNumber && arrayLF[j] != undefined && j != i) {
                  // Abstand zur anderen LF eruieren
                  var distance = this.lfCenter.distanceTo(arrayLF[j][1]);
                  // Abstand < kollDistance (weitere LF ist im Kollisions-Umfeld) -> zurücksetzen (case 8)
                  if (distance < this.kollDistance) return 8;
                }
              }
              // Prüfung auf Block im Kollisions-Umfeld
              for (var j = 0; j < arrayBlock.length; j++) {
                if (arrayBlock[j] != undefined) {
                  // Abstand zum Block eruieren
                  var distance = this.lfCenter.distanceTo(arrayBlock[j][1]);
                  // Abstand < kollDistance (Block ist im Kollisions-Umfeld) -> zurücksetzen (case 8)
                  if (distance < this.kollDistance) return 8;
                }
              }
              // Prüfung auf unreife Nahrungsquelle im Kollisions-Umfeld
              for (var j = 0; j < arrayFood.length; j++) {
                if (arrayFood[j] != undefined && arrayFood[j][0].growState < 3) {
                  // Abstand zur Nahrungsquelle eruieren
                  var distance = this.lfCenter.distanceTo(arrayFood[j][1]);
                  // Abstand < kollDistance (Nahrungsquelle ist im Kollisions-Umfeld) -> zurücksetzen (case 8)
                  if (distance < this.kollDistance) return 8;
                }
              }
              return 1;
            }
          } else {
            // LF hat anderes Geschlecht
            //console.log('LF hat anderes Geschlecht!');
            // Prüfung auf Geschlecht (männlich/weiblich)
            if (this.cIndex == 0) {
              // Weibliche LF -> Prüfung auf Okkupation
              if (this.prepairFlag === true) {
                // Prüfung auf Okkupation durch männliche LF im Kollisionsumfeld
                if (arrayLF[this.kollIndex][0].partnerIndex == this.lfNumber) {
                  // Von männlicher LF okkupiert -> Partner treffen (case 7)
                  this.pairFlag = true;
                  return 7;
                } else {
                  // Nicht von männlicher LF okkupiert (andere männliche LF) -> Kollisionsprüfung
                  if (distance < this.lfLength / 2) {
                    // Abstand < lfLength / 2 -> Kollision findet statt (case 4)
                    //console.log('Distanz zur LF: ',distance);
                    // Änderungen der eigenen Verhaltensweise durch andere LF sperren (FALSE)
                    this.changeFlag = false;
                    return 4;
                  } else {
                    // Abstand > lfLength / 2 -> Kollision vermeiden (case 1)
                    //console.log('Kollision mit LF vermeiden!');
                    //console.log('Distanz zur LF: ',distance);
                    // Prüfung auf weitere LF im Kollisions-Umfeld
                    for (var j = 0; j < arrayLF.length; j++) {
                      if (j != this.lfNumber && arrayLF[j] != undefined && j != i) {
                        // Abstand zur anderen LF eruieren
                        var distance = this.lfCenter.distanceTo(arrayLF[j][1]);
                        // Abstand < kollDistance (weitere LF ist im Kollisions-Umfeld) -> zurücksetzen (case 8)
                        if (distance < this.kollDistance) return 8;
                      }
                    }
                    // Prüfung auf Block im Kollisions-Umfeld
                    for (var j = 0; j < arrayBlock.length; j++) {
                      if (arrayBlock[j] != undefined) {
                        // Abstand zum Block eruieren
                        var distance = this.lfCenter.distanceTo(arrayBlock[j][1]);
                        // Abstand < kollDistance (Block ist im Kollisions-Umfeld) -> zurücksetzen (case 8)
                        if (distance < this.kollDistance) return 8;
                      }
                    }
                    // Prüfung auf unreife Nahrungsquelle im Kollisions-Umfeld
                    for (var j = 0; j < arrayFood.length; j++) {
                      if (arrayFood[j] != undefined && arrayFood[j][0].growState < 3) {
                        // Abstand zur Nahrungsquelle eruieren
                        var distance = this.lfCenter.distanceTo(arrayFood[j][1]);
                        // Abstand < kollDistance (Nahrungsquelle ist im Kollisions-Umfeld) -> zurücksetzen (case 8)
                        if (distance < this.kollDistance) return 8;
                      }
                    }
                    return 1;
                  }
                }                
              } else {
                // Nicht okkupiert -> Kollisionsprüfung
                if (distance < this.lfLength / 2) {
                  // Abstand < lfLength / 2 -> Kollision findet statt (case 4)
                  //console.log('Distanz zur LF: ',distance);
                  // Änderungen der eigenen Verhaltensweise durch andere LF sperren (FALSE)
                  this.changeFlag = false;
                  return 4;
                } else {
                  // Abstand > lfLength / 2 -> Kollision vermeiden (case 1)
                  //console.log('Kollision mit LF vermeiden!');
                  //console.log('Distanz zur LF: ',distance);
                  // Prüfung auf weitere LF im Kollisions-Umfeld
                  for (var j = 0; j < arrayLF.length; j++) {
                    if (j != this.lfNumber && arrayLF[j] != undefined && j != i) {
                      // Abstand zur anderen LF eruieren
                      var distance = this.lfCenter.distanceTo(arrayLF[j][1]);
                      // Abstand < kollDistance (weitere LF ist im Kollisions-Umfeld) -> zurücksetzen (case 8)
                      if (distance < this.kollDistance) return 8;
                    }
                  }
                  // Prüfung auf Block im Kollisions-Umfeld
                  for (var j = 0; j < arrayBlock.length; j++) {
                    if (arrayBlock[j] != undefined) {
                      // Abstand zum Block eruieren
                      var distance = this.lfCenter.distanceTo(arrayBlock[j][1]);
                      // Abstand < kollDistance (Block ist im Kollisions-Umfeld) -> zurücksetzen (case 8)
                      if (distance < this.kollDistance) return 8;
                    }
                  }
                  // Prüfung auf unreife Nahrungsquelle im Kollisions-Umfeld
                  for (var j = 0; j < arrayFood.length; j++) {
                    if (arrayFood[j] != undefined && arrayFood[j][0].growState < 3) {
                      // Abstand zur Nahrungsquelle eruieren
                      var distance = this.lfCenter.distanceTo(arrayFood[j][1]);
                      // Abstand < kollDistance (Nahrungsquelle ist im Kollisions-Umfeld) -> zurücksetzen (case 8)
                      if (distance < this.kollDistance) return 8;
                    }
                  }
                  return 1;
                }
              }
            } else {
              // Männliche LF -> Prüfung auf Partnersuche
              //console.log('LF hat anderes Geschlecht (weiblich)!');
              // Prüfung auf Partnersuche
              if (this.partnerFlag === true) {
                // Auf dem Weg zur Partner-LF -> Prüfung auf Partner-LF
                if (this.kollIndex == this.partnerIndex) {
                  // Die andere LF ist die Partner-LF -> Paarungsprüfung
                  if (distance < this.meetDistance) {
                    // Abstand < meetDistance -> Partner treffen (case 7)
                    // Änderungen der eigenen Verhaltensweise durch andere LF sperren (FALSE)
                    this.changeFlag = false;
                    this.pairFlag = true;
                    return 7;
                  } else {
                    // Abstand > meetDistance -> weiter zum Partner laufen (case 3)
                    return 3;
                  }
                } else {
                  // Die andere LF ist eine andere weibliche LF -> Kollisionsprüfung
                  if (distance < this.lfLength / 2) {
                    // Abstand < lfLength / 2 -> Kollision findet statt (case 4)
                    // Änderungen der eigenen Verhaltensweise durch andere LF sperren (FALSE)
                    this.changeFlag = false;
                    return 4;
                  } else {
                    // Abstand > lfLength / 2 -> Kollision vermeiden (case 1)
                    //console.log('Kollision mit LF vermeiden!');
                    //console.log('Distanz zur LF: ',distance);
                    // Prüfung auf weitere LF im Kollisions-Umfeld
                    for (var j = 0; j < arrayLF.length; j++) {
                      if (j != this.lfNumber && arrayLF[j] != undefined && j != i) {
                        // Abstand zur anderen LF eruieren
                        var distance = this.lfCenter.distanceTo(arrayLF[j][1]);
                        // Abstand < kollDistance (weitere LF ist im Kollisions-Umfeld) -> zurücksetzen (case 8)
                        if (distance < this.kollDistance) return 8;
                      }
                    }
                    // Prüfung auf Block im Kollisions-Umfeld
                    for (var j = 0; j < arrayBlock.length; j++) {
                      if (arrayBlock[j] != undefined) {
                        // Abstand zum Block eruieren
                        var distance = this.lfCenter.distanceTo(arrayBlock[j][1]);
                        // Abstand < kollDistance (Block ist im Kollisions-Umfeld) -> zurücksetzen (case 8)
                        if (distance < this.kollDistance) return 8;
                      }
                    }
                    // Prüfung auf unreife Nahrungsquelle im Kollisions-Umfeld
                    for (var j = 0; j < arrayFood.length; j++) {
                      if (arrayFood[j] != undefined && arrayFood[j][0].growState < 3) {
                        // Abstand zur Nahrungsquelle eruieren
                        var distance = this.lfCenter.distanceTo(arrayFood[j][1]);
                        // Abstand < kollDistance (Nahrungsquelle ist im Kollisions-Umfeld) -> zurücksetzen (case 8)
                        if (distance < this.kollDistance) return 8;
                      }
                    }
                  }
                  return 1;
                }
              } else {
                // Auf dem Weg zum Zufallsziel/Ausweichziel (mTarget/aTarget) -> Kollision vermeiden (case 1)
                return 1;
              }
            }
          }
        }
      }
    }
    // Array der Blocks durchsuchen und Distanz zum jeweiligen Block ermitteln
    for (var i = 0; i < arrayBlock.length; i++) {
      // Abstand zum Block eruieren
      var distance = this.lfCenter.distanceTo(arrayBlock[i][1]);
      // Wenn Abstand kleiner als kollDistance -> ausweichen
      if (distance < this.kollDistance) {
        // Array-Nummer des Blocks speichern
        this.kollIndex = i;
        // Ausweich-Modus setzen
        this.avoidMode = 1;
        // Wenn Abstand < lfLength / 2 -> Kollision mit Block findet statt (case 5)
        if (distance < this.lfLength / 2) {
          //console.log('Kollision mit Block findet statt!');
          //console.log('Distanz zum Block: ',distance);
          return 5;
        } else {
          // Wenn Abstand > lfLength / 2 -> Kollision mit Block vermeiden (case 1)
          //console.log('Kollision mit Block vermeiden!');
          //console.log('Distanz zum Block: ',distance);
          // Prüfen ob mTarget/aTarget zu nah am Block liegt (innerhalb der Kollisions-Distanz)
          if (this.avoidCourse === false) {
            distance = this.mTarget.distanceTo(arrayBlock[i][1]);
          } else {
            distance = this.aTarget.distanceTo(arrayBlock[i][1]);
          }
          // Zu nah?
          if (distance < this.kollDistance) {
            // mTarget/aTarget zu nah -> neues Zufallsziel festlegen (case 0)
            this.origC = this.lfCenter;
            this.init();
            return 0;
          } else {
            // Ausweichkurs fahren (case 1)
            return 1;
          }
        }
      }
    }
    // Array der Nahrungsquellen durchsuchen und Distanz zur jeweiligen Nahrungsquelle ermitteln
    for (var i = 0; i < arrayFood.length; i++) {
      // Abstand zur Nahrungsquelle eruieren
      var distance = this.lfCenter.distanceTo(arrayFood[i][1]);
      // Wenn Abstand kleiner als kollDistance -> ausweichen
      if (distance < this.kollDistance && this.foodIndex != i) {
        // Array-Nummer der Nahrungsquelle speichern
        this.kollIndex = i;
        // Ausweich-Modus setzen
        this.avoidMode = 2;
        // Genießbarkeit eruieren
        var eatable = arrayFood[i][0].growColor;
        //console.log('Genießbarkeit der Nahrungsquelle: ',eatable);
        // Wenn Abstand < lfLength / 2 und Nahrungsquelle ungenießbar -> Kollision findet statt (case 5)
        if (distance < this.lfLength / 2 && eatable < 3) {
          //console.log('Kollision mit Nahrungsquelle findet statt!');
          //console.log('Distanz zur Nahrungsquelle: ',distance);
          return 5;
        } else {
          // Abstand > lfLength / 2 -> Wenn Nahrungsquelle ungenießbar Kollision vermeiden (case 1)
          if (eatable < 3) {
            //console.log('Kollision mit ungenießbarer Nahrungsquelle vermeiden!');
            //console.log('Distanz zur Nahrungsquelle: ',distance);
            // Prüfen ob mTarget/aTarget zu nah an der Nahrungsquelle liegt (innerhalb der Kollisions-Distanz)
            if (this.avoidCourse === false) {
              distance = this.mTarget.distanceTo(arrayFood[i][1]);
            } else {
              distance = this.aTarget.distanceTo(arrayFood[i][1]);
            }
            // Zu nah?
            if (distance < this.kollDistance) {
              // mTarget/aTarget zu nah -> neues Zufallsziel festlegen (case 0)
              this.origC = this.lfCenter;
              this.init();
              return 0;
            } else {
              // Ausweichkurs fahren (case 1)
              return 1;
            }
          } else {
            // Nahrungsquelle ist genießbar
            //console.log('Nahrungsquelle ist genießbar!');
            //console.log('Distanz zur Nahrungsquelle: ',distance);
            // Ausnahme: eLevel < 75, Nahrungsquelle frei, partnerFlag = false -> Nahrungsquelle ansteuern
            if (this.eLevel < 75 && arrayFood[i][0].occupyFlag === false && this.partnerFlag === false) {
              //console.log('LF ',this.lfNumber,' ist hungrig -> Nahrungsquelle ansteuern!');
              // Index der Nahrungsquelle speichern
              this.foodIndex = i;
              // Nahrungsquelle okkupieren (andere LFs steuern sie dann nicht mehr an)
              arrayFood[i][0].occupyFlag = true;
              // Flags zurücksetzen
              this.initFlags();
              // Flag für Ziel = Nahrungsquelle setzen
              this.foodFlag = true;
              // Center-Point der Nahrungsquelle als Ziel speichern -> mTarget
              this.mTarget = arrayFood[i][1];
              // Momentanen Standort als original deklarieren
              this.origC = this.lfCenter;
              // LF auf Nahrungsquelle ausrichten
              this.initNodes();
              this.rAngle = this.calcAngle(this.mTarget);
              this.rotateNodes(this.rAngle);
              // Geschwindigkeit mit Hilfe der Distanz zur Nahrungsquelle berechnen
              var distance = this.lfCenter.distanceTo(this.mTarget);
              //console.log('Distanz zur Nahrungsquelle: ',distance);
              this.step = this.calculateSpeed(distance);
              //console.log('Speed: ',this.step);
              return 0;
            } else {
              // eLevel > hLevel (LF ist nicht hungrig) oder Nahrungsquelle nicht frei -> ausweichen
              //console.log('Kollision mit ungenießbarer Nahrungsquelle vermeiden!');
              //console.log('Distanz zur Nahrungsquelle: ',distance);
              // Prüfen ob mTarget/aTarget zu nah an der Nahrungsquelle liegt (innerhalb der Kollisions-Distanz)
              if (this.avoidCourse === false) {
                distance = this.mTarget.distanceTo(arrayFood[i][1]);
              } else {
                distance = this.aTarget.distanceTo(arrayFood[i][1]);
              }
              if (distance < this.kollDistance) {
                // mTarget/aTarget zu nah -> neues Zufallsziel festlegen (case 0)
                this.origC = this.lfCenter;
                this.init();
                return 0;
              } else {
                // Ausweichkurs fahren (case 1)
                return 1;
              }
            }
          }
        }
      }
    }
    // Keine Kollision -> Prüfung auf Geschlecht (männlich) und partnerFlag = true
    if (this.cIndex == 1 && this.partnerFlag === true) {
      // Männliche LF steuert Partner-LF an (case 3)
      return 3;
    } else {
      // Standard-Aktion für weibliche und männliche LFs (partnerFlag = false) (case 0)
      return 0;
    }
  }
  // Nahrungsquelle suchen (ändert mTarget, setzt foodFlag und erzeugt/returns case 0)
  private searchFood() {
    //console.log('--------------------------------');
    //console.log('FUNCTION searchFood');
    var distance:number;
    var fArray:Array<any> = [];
    var aNum:number = 0;
    // Nahrungsquellen (fast reif, growColor = 2) suchen -> fArray[i]=[Index, Distanz]
    for (var i = 0; i < arrayFood.length; i++) {
      if (arrayFood[i][0].growColor > 0 && arrayFood[i][0].growColor < 3 && arrayFood[i][0].occupyFlag === false) {
        //console.log('Fast reife Nahrungsquelle gefunden.');
        distance = this.lfCenter.distanceTo(arrayFood[i][1]);
        fArray[aNum] = [i, distance];
        aNum += 1;
      }
    }
    //console.log('Array fast reife Nahrungsquellen: ',fArray);
    // Wenn Nahrungsquellen gefunden
    if (fArray.length > 1) {
      //console.log('Fast reife Nahrungsquellen gefunden.');
      // Array der gefundenen Nahrungsquellen sortiern (nach Distanz)
      fArray.sort((a,b) => a[1] - b[1]);
      //console.log('Array sortiert: ',fArray);
      // Index der am nächst gelegenen Nahrungsquelle
      this.foodIndex = fArray[0][0];
      //console.log('foodIndex: ',this.foodIndex);
      // Center-Point der nächsten Nahrungsquelle als Ziel speichern -> mTarget
      this.mTarget = arrayFood[this.foodIndex][1];
      //console.log('mTarget: ',this.mTarget);
      // Nahrungsquelle okkupieren (andere LFs steuern sie dann nicht mehr an)
      arrayFood[this.foodIndex][0].occupyFlag = true;
      // Flags zurücksetzen
      this.initFlags();
      // Flag für Ziel = Nahrungsquelle setzen
      this.foodFlag = true;
      // Momentanen Standort als original deklarieren
      this.origC = this.lfCenter;
      // LF auf Nahrungsquelle ausrichten
      this.initNodes();
      this.rAngle = this.calcAngle(this.mTarget);
      this.rotateNodes(this.rAngle);
      // Geschwindigkeit mit Hilfe der Distanz zur Nahrungsquelle berechnen
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
  // Partnersuche, nur männliche LFs (erzeugt/returns case 3)
  private searchPartner() {
    //console.log('--------------------------------');
    //console.log('FUNCTION searchPartner');
    var distance:number;
    var fArray:Array<any> = [];
    var aNum:number = 0;
    // Lebensform (anderes Geschlecht, prepairFlag = false, foodFlag = false) suchen -> fArray[i]=[Index, Distanz]
    for (var i = 0; i < arrayLF.length; i++) {
      if (arrayLF[i] != undefined && arrayLF[i][2] == 0 && arrayLF[i][0].partnerIndex == null && arrayLF[i][0].prepairFlag === false && arrayLF[i][0].pairFlag === false && arrayLF[i][0].foodFlag === false) {
        //console.log('Paarungsbereite LF gefunden.');
        distance = this.lfCenter.distanceTo(arrayLF[i][1]);
        fArray[aNum] = [i, distance];
        aNum += 1;
      }
    }
    //console.log('Array weibliche LFs: ',fArray);
    // Wenn paarungsbereite weibliche LFs gefunden
    if (fArray.length > 1) {
      //console.log('Paarungsbereite weibliche LFs gefunden.');
      // Array der gefundenen LFs sortiern (nach Distanz)
      fArray.sort((a,b) => a[1] - b[1]);
      //console.log('Array sortiert: ',fArray);
      // Index der am nächst gelegenen LF
      this.partnerIndex = fArray[0][0];
      //console.log('partnerIndex: ',this.partnerIndex);
      // Weibliche LF für Paarung vorbereiten/okkupieren (andere LFs steuern sie dann nicht mehr an)
      arrayLF[this.partnerIndex][0].prepairFlag = true;
      // Eigenen Array-Index an weibliche LF übermitteln
      arrayLF[this.partnerIndex][0].partnerIndex = this.lfNumber;
      // Center-Point der LF als Ziel speichern -> mTarget
      this.mTarget = arrayLF[this.partnerIndex][1];
      //console.log('mTarget: ',this.mTarget);
      // Flags zurücksetzen
      this.initFlags();
      // Eigenes prepairFlag setzen (Suche erfolgreich)
      this.prepairFlag = true;
      // Eigenes Flag für Ziel (paarungsbereite LF) setzen
      this.partnerFlag = true;
      // Momentanen Standort als original deklarieren
      this.origC = this.lfCenter;
      // LF auf paarungsbereite LF ausrichten
      this.initNodes();
      this.rAngle = this.calcAngle(this.mTarget);
      this.rotateNodes(this.rAngle);
      // Geschwindigkeit mit Hilfe der Distanz zur paarungsbereiten LF berechnen
      var distance = this.lfCenter.distanceTo(this.mTarget);
      //console.log('Distanz zur paarungsbereiten LF: ',distance);
      this.step = this.calculateSpeed(distance);
      //console.log('Speed: ',this.step);
      // Simulation stoppen (zu Testzwecken)
      //console.log('Simulation gestoppt - hier walktoPartner (case 3) durchführen!');
      //clearInterval(simulation);
      // walktoPartner initiieren
      return 3;
    } else return 0;
  }
  /** Aktionen der Lebensform */
  // Ziel (mTarget/aTarget) ansteuern (case 0)
  private movetoTarget() {
    //console.log('--------------------------------');
    //console.log('FUNCTION movetoTarget');
    //console.log('Nummer LF: ',this.lfNumber)
    // Zufallsziel/Ausweichziel (mTarget/aTarget) ansteuern
    if (this.avoidCourse === false) {
      // Zufallsziel/Nahrungsquelle (mTarget) ansteuern
      this.lfCenter = this.mTarget.projectOntoCircle(this.lfCenter, this.step);
      //console.log('lfCenter: ',this.lfCenter.x,' / ',this.lfCenter.y);
      // Center-Point in das Array der Lebensformen schreiben
      arrayLF[this.lfNumber][1] = this.lfCenter;
      // Ziel (annähernd) erreicht?
      if (this.lfCenter.distanceTo(this.mTarget) <= this.meetDistance) {
        // Partner-Index zurücksetzen
        if (this.caseEvent == 0) this.partnerIndex = null;
        // Ziel eine Nahrungsquelle?
        if (this.foodFlag === true) {
          // Ziel ist eine Nahrungsquelle -> Nahrungsaufnahme
          this.eatFlag = true;
          console.log('LF ',this.lfNumber,' nimmt Nahrung auf.');
        } else {
          // Ziel ist keine Nahrungsquelle -> neues Zufalls-Ziel festlegen
          // Paarungs-Zähler aktualisieren (nur männliche LF's)
          if (this.cIndex == 1) {
            this.pCounter = 0;
          }
          this.origC = this.lfCenter;
          this.init();
          // Standard-Aktion (case 0)
          this.caseEvent = 0;
        }
      }
    } else {
      // Ausweichziel (aTarget) ansteuern
      this.lfCenter = this.aTarget.projectOntoCircle(this.lfCenter, this.step);
      //console.log('lfCenter: ',this.lfCenter.x,' / ',this.lfCenter.y);
      // Center-Point in das Array der Lebensformen schreiben
      arrayLF[this.lfNumber][1] = this.lfCenter;
      // Wenn Ausweichziel (annähernd) erreicht ist ursprüngliches Ziel (mTarget) ansteuern
      if (this.lfCenter.distanceTo(this.aTarget) <= this.meetDistance) {
        // Flag Ausweichkurs fahren zurücksetzen -> FALSE
        this.avoidCourse = false;
        // Momentanen Standort als original deklarieren
        this.origC = this.lfCenter;
        // LF auf ursprüngliches Ziel (mTarget) ausrichten
        this.initNodes();
        this.rAngle = this.calcAngle(this.mTarget);
        this.rotateNodes(this.rAngle);
        // Geschwindigkeit berechnen
        var distance = this.origC.distanceTo(this.mTarget);
        //console.log('Distanz: ',distance);
        this.step = this.calculateSpeed(distance);
        //console.log('Speed: ',this.step);
        // Es wurde einer LF ausgewichen -> changeFlag der LF auf true setzen
        if (this.avoidMode == 0 && arrayLF[this.kollIndex] != undefined) arrayLF[this.kollIndex][0].changeFlag = true;
        // Prüfung partnerFlag
        if (this.partnerFlag === true) {
          // Partner-LF ansteuern (case 3)
          this.caseEvent = 3;
        } else {
          // Standard-Aktion (case 0)
          this.caseEvent = 0;
        }
      }
    }
  }
  // Kollision vermeiden -> Ausweichen (case 1)
  private avoidKollision() {
    //console.log('--------------------------------');
    //console.log('FUNCTION avoidKollision');
    // Ausweichvorgang (Voreinstellung Flag für Ausweichkurs fahren: avoidCourse = FALSE)
    if (this.avoidCourse === false) {
      // Ausweich-Ziel berechnen -> Point aTarget
      //console.log('Berechnung Ausweichziel');
      // View-Points (Augen) erstellen (für Ausweichrichtung (rechts/links))
      // Distanz der View-Points
      var vpdistance = this.lfWidth;
      // Winkel der View-Points
      var radvp1 = (this.rAngle - 50) * Math.PI / 180;
      //console.log('View-Point1-WinkelRad: ',radvp1);
      var radvp2 = (this.rAngle + 50) * Math.PI / 180;
      //console.log('View-Point2-WinkelRad: ',radvp2);
      // Vars für Berechnung der View-Points
      var vp1:Point; var vp2:Point; var newX:number; var newY:number; var d1:number; var d2:number; var aAngle:number;
      // View-Point 1
      newX = this.lfCenter.x + Math.cos(radvp1) * vpdistance;
      newY = this.lfCenter.y + Math.sin(radvp1) * vpdistance;
      vp1 = new Point(newX, newY);
      // View-Point 2
      newX = this.lfCenter.x + Math.cos(radvp2) * vpdistance;
      newY = this.lfCenter.y + Math.sin(radvp2) * vpdistance;
      vp2 = new Point(newX, newY);
      // Distanz zwischen der anderen LF bzw. dem Block bzw. der Nahrungsquelle zu den beiden View-Points berechnen
      switch(this.avoidMode) {
        case 0:
          // Distanz zur LF (wenn diese noch existiert)
          if (arrayLF[this.kollIndex] != undefined) {
            d1 = vp1.distanceTo(arrayLF[this.kollIndex][1]);
            d2 = vp2.distanceTo(arrayLF[this.kollIndex][1]);
          } else {
            d1 = Math.random();
            d2 = Math.random();
          }
          break;
        case 1:
          // Distanz zum Block
          d1 = vp1.distanceTo(arrayBlock[this.kollIndex][1]);
          d2 = vp2.distanceTo(arrayBlock[this.kollIndex][1]);
          break;
        case 2:
          // Distanz zur ungenießbaren Nahrungsquelle
          d1 = vp1.distanceTo(arrayFood[this.kollIndex][1]);
          d2 = vp2.distanceTo(arrayFood[this.kollIndex][1]);
          break;
      }
      //console.log('Distanz View-Point 1: ',d1);
      //console.log('Distanz View-Point 2: ',d2);
      // Winkel zum Ausweich-Point berechnen (in Abhängigkeit der VP-Distanzen)
      if (d1 < d2) {
        aAngle = (this.rAngle + 65);
      } else {
        aAngle = (this.rAngle - 65);
      }
      //console.log('Ausweich-Winkel: ',aAngle);
      // Ausweichwinkel in Rad
      var avoidangleRad = (aAngle) * Math.PI / 180;
      //console.log('avoidangleRad: ',avoidangleRad);
      // Distanz zum Ausweich-Point (lfLength * 2 + Zufallswert)
      var distance = this.lfLength * 2 + Math.floor(Math.random() * 3);
      //console.log('Ausweich-Distanz: ',distance);
      // Koordinaten des Ausweich-Ziels (aTarget:Point) berechnen
      var newX = this.lfCenter.x + Math.cos(avoidangleRad) * distance;
      var newY = this.lfCenter.y + Math.sin(avoidangleRad) * distance;
      this.aTarget = new Point(newX, newY);      
      // Momentanen Standort als original deklarieren
      this.origC = this.lfCenter;
      // LF auf Ausweichziel ausrichten
      this.initNodes();
      this.rAngle = this.calcAngle(this.aTarget);
      this.rotateNodes(this.rAngle);
      // Geschwindigkeit mit Hilfe der Distanz zum Ausweich-Ziel berechnen
      var distance = this.lfCenter.distanceTo(this.aTarget);
      //console.log('Distanz: ',distance);
      this.step = this.calculateSpeed(distance);
      //console.log('Speed: ',this.step);
      // Flag Ausweichkurs fahren setzen -> TRUE
      this.avoidCourse = true;
    }
    // Target/Ausweichziel ansteuern
    this.movetoTarget();
  }
  // Nahrungsaufname (case 2)
  private eat() {
    //console.log('--------------------------------');
    //console.log('FUNCTION eat');
    // Erst Nahrung aufnehmen wenn reif
    if (arrayFood[this.foodIndex][0].growColor == 3) {
      if (this.gCounter > 0) {
        this.gCounter -= 1;
        //console.log('gCounter: ',this.gCounter);
      } else {
        //console.log('LF mit dem Index ',this.lfNumber,' nimmt Nahrung auf.');
        // Energie-Level erhöhen
        this.eLevel = 100;
        // Standard-Wert globaler Zähler
        this.gCounter = 25;
        // Nahrungsquelle initialisieren (freigeben, muss wieder wachsen)
        arrayFood[this.foodIndex][0].init();
        // foodIndex zurücksetzen
        this.foodIndex = -1;
        // partnerIndex zurücksetzen
        this.partnerIndex = null;
        // Paarungs-Zähler aktualisieren (nur männliche LF's)
        if (this.cIndex == 1) {
          this.pCounter = 0;
        }
        // Standard-Event setzen und neues Zufallsziel festlegen
        this.caseEvent = 0;
        this.origC = this.lfCenter;
        this.init();
      }
    }
  }
  // Zum Partner gehen (case 3)
  private walktoPartner() {
    //console.log('--------------------------------');
    //console.log('FUNCTION walktoPartner');
    // Generelle Prüfung Partner existent
    if (arrayLF[this.partnerIndex] != undefined && arrayLF[this.partnerIndex][0].foodFlag === false) {
      // Partner existiert und ist nicht auf dem Weg zu einer Nahrungsquelle
      //console.log('this.partnerIndex: ',this.partnerIndex);
      // Wenn Partner nicht erreicht -> zum Partner gehen
      if (this.lfCenter.distanceTo(this.mTarget) > this.meetDistance) {
        // Aktuelle Position der Partner-LF eruieren
        this.mTarget = arrayLF[this.partnerIndex][1];
        // Momentanen Standort als original deklarieren
        this.origC = this.lfCenter;
        // LF auf Partner-LF ausrichten
        this.initNodes();
        this.rAngle = this.calcAngle(this.mTarget);
        this.rotateNodes(this.rAngle);
        // Geschwindigkeit mit Hilfe der Distanz zur Partner-LF berechnen
        var distance = this.lfCenter.distanceTo(this.mTarget);
        //console.log('Distanz zur Partner-LF: ',distance);
        this.step = this.calculateSpeed(distance);
        // Zur Partner-LF gehen
        this.lfCenter = this.mTarget.projectOntoCircle(this.lfCenter, this.step);
        //console.log('lfCenter: ',this.lfCenter.x,' / ',this.lfCenter.y);
        // Eigenen Center-Point in das Array der Lebensformen schreiben
        arrayLF[this.lfNumber][1] = this.lfCenter;
      } else {
        // Partner erreicht -> Paarungs-Flags setzen
        // Eigenes Paarungs-Flag setzen
        this.pairFlag = true;
        // Paarungs-Flag der anderen LF setzen
        arrayLF[this.partnerIndex][0].pairFlag = true;
      }
    } else {
      // Partner existiert nicht mehr oder geht zu einer Nahrungsquelle -> Standard-Aktion
      this.partnerIndex = null;
      this.origC = this.lfCenter;
      this.init();
      this.caseEvent = 0;
    }
  }
  // Kollision mit LF ausführen (case 4)
  private accidentKollision() {
    //console.log('--------------------------------');
    //console.log('FUNCTION accidentKollision');
    //console.log('Nummer der anderen LF: ',this.kollIndex);
    // Fallunterscheidung bei existenter LF: gleiches/ungleiches Geschlecht (cIndex)
    // - LF hat gleiches Geschlecht   -> andere LF in den KO-Modus versetzen (case 4)
    // - LF hat ungleiches Geschlecht -> Paarungsbereitschaft prüfen
    // LF existiert -> Kollision
    if (arrayLF[this.kollIndex] != undefined) {
      // Geschlecht der anderen LF eruieren
      var cindex = arrayLF[this.kollIndex][0].cIndex;
      //console.log('Geschlecht der anderen LF: ',cindex);
      // Prüfung auf Geschlecht
      if (cindex == this.cIndex) {
        // Gleiches Geschlecht -> andere LF in den KO-Modus versetzen (wenn LF nicht geboren wird / stirbt / sich paart)
        //console.log('Kollision mit gleichem Geschlecht');
        if (arrayLF[this.kollIndex][0].changeFlag === true && arrayLF[this.kollIndex][0].birthFlag === false && arrayLF[this.kollIndex][0].delFlag === false && arrayLF[this.kollIndex][0].pairFlag === false) {
          arrayLF[this.kollIndex][0].koModus = true;
        }
        // Standard-Event einstellen
        this.caseEvent = 0;
      } else {
        // Ungleiches Geschlecht -> Prüfung auf Paarung
        //console.log('Kollision mit ungleichem Geschlecht!');
        if (this.kollIndex == this.partnerIndex) {
          // Paarung -> zum Partner laufen (case 3)
          this.caseEvent = 3;
          // Programm zu diesem Event stoppen (zu Testzwecken)
          //console.log('Simulation gestoppt);
          //clearInterval(simulation);
        } else {
          // Keine Paarung -> andere LF in den KO-Modus versetzen (wenn LF nicht gerade geboren wird / stirbt / sich paart)
          if (arrayLF[this.kollIndex][0].changeFlag === true && arrayLF[this.kollIndex][0].birthFlag === false && arrayLF[this.kollIndex][0].delFlag === false && arrayLF[this.kollIndex][0].pairFlag === false) {
            arrayLF[this.kollIndex][0].koModus = true;
          }
          // Standard-Event einstellen
          this.caseEvent = 0;
        }
      }
    } else {
      // Standard-Event einstellen
      this.caseEvent = 0;
    }
  }
  // Kollision mit Block/ungenießbarer Nahrungsquelle ausführen -> Zurücksetzen (case 5)
  private accidentBFKollision() {
    //console.log('--------------------------------');
    //console.log('FUNCTION accidentBFKollision');
    // Zurücksetzen (Voreinstellungs Flag für Rücksetz-Kurs fahren: avoidCourse = FALSE)
    // Distanz zum Rücksetz-Point (lfLength * 2 + Zufallswert)
    var distance = this.lfLength * 2 + Math.floor(Math.random() * 3);
    //console.log('Rücksetz-Distanz: ',distance);
    // Winkel zum Rücksetz-Point (walkBack 180 Grad)
    var aAngle = (this.rAngle - 180);
    //console.log('Rücksetz-Winkel: ',aAngle);
    var avoidangleRad = aAngle * Math.PI / 180;
    //console.log('avoidangleRad: ',avoidangleRad);
    // Koordinaten des Rücksetz-Points (aTarget:Point) berechnen
    var newX = this.lfCenter.x + Math.cos(avoidangleRad) * distance;
    var newY = this.lfCenter.y + Math.sin(avoidangleRad) * distance;
    this.aTarget = new Point(newX, newY);      
    // Momentanen Standort als original deklarieren
    this.origC = this.lfCenter;
    // LF auf Block/ungenießbare Nahrungsquelle ausrichten
    this.initNodes();
    //console.log('avoidMode: ',this.avoidMode);
    if (this.avoidMode == 1) {
      this.rAngle = this.calcAngle(arrayBlock[this.kollIndex][1]);
      //console.log('Zurücksetzen (Block), LF ',this.lfNumber);
    } else {
      this.rAngle = this.calcAngle(arrayFood[this.kollIndex][1]);
      //console.log('Zurücksetzen (Food), LF ',this.lfNumber);
    }
    this.rotateNodes(this.rAngle);
    // Geschwindigkeit mit Hilfe der Distanz zum Rücksetz-Point berechnen
    var distance = this.lfCenter.distanceTo(this.aTarget);
    //console.log('Distanz: ',distance);
    this.step = this.calculateSpeed(distance);
    // Flag Ausweichkurs fahren -> TRUE
    this.avoidCourse = true;
    // Event zurücksetzen
    this.caseEvent = 0; 
    // Rücksetz-Point aTarget rückwärts ansteuern
    this.movetoTarget();
  }
  // KO-Modus (case 6)
  private execKOmodus() {
    //console.log('--------------------------------');
    //console.log('FUNCTION execKOmodus');
    if (this.koCounter > 0) {
      this.koCounter -= 1;
      // LF um die eigene Achse rotieren
      this.rotateMe(this.rAngle + 7.2);
    } else {
      // KO-Modus aufheben
      this.koModus = false;
      this.koCounter = 100;
      this.caseEvent = 0;
    }
  }
  // Partner treffen/Paarung (case 7)
  private meetPartner() {
    //console.log('--------------------------------');
    //console.log('FUNCTION meetPartner');
    // Fallunterscheidung:
    // - eigenes Geschlecht weiblich -> Paarung, dann neue LF erzeugen und Geburt initiieren, dann zurückfahren
    // - eigenes Geschlecht männlich -> Paarung, dann zurückfahren
    // Treffen wenn Partner-LF noch existiert
    if (arrayLF[this.partnerIndex] != undefined) {
      // Prüfung auf Geschlecht
      if (this.cIndex == 0) {
        // Weibliche LF -> Paarung
        if (this.gCounter > 0) {
          // gCounter = 25 -> LF auf Partner-LF ausrichten / changeFlag/koModus auf false setzen
          if (this.gCounter == 25) {
            // Aktuelle Position der Partner-LF eruieren
            this.mTarget = arrayLF[this.partnerIndex][1];
            // Momentanen Standort als original deklarieren
            this.origC = this.lfCenter;
            // LF auf Partner-LF ausrichten
            this.initNodes();
            this.rAngle = this.calcAngle(this.mTarget);
            this.rotateNodes(this.rAngle);
            // Flags zurücksetzen -> FALSE
            this.changeFlag = false;
            this.koModus = false;
          }
          this.gCounter -= 1.5;
          //console.log('gCounter: ',this.gCounter);
        } else {
          // Geburts-Prozedur einleiten
          //console.log('Paarung (weibliche LF) - Geburts-Prozedur wird eingeleitet!');
          this.initBirth(this.lfCenter);
          // Standard-Wert globaler Zähler
          this.gCounter = 25;
          // Partner-Index zurücksetzen
          this.partnerIndex = null;
          // Zurückfahren (case 8)
          this.initFlags();
          this.caseEvent = 8;
          // Neues Zufalls-Ziel festlegen (damit die Paarungs-LF's nicht aufeinander zu fahren)
          this.mTarget = getRandompoint();
        }
      } else {
        // Männliche LF -> Paarung (kurz warten)
        if (this.gCounter > 0) {
          // gCounter = 25 -> LF auf Partner-LF ausrichten / changeFlag/koModus auf false setzen
          if (this.gCounter == 25) {
            // Aktuelle Position der Partner-LF eruieren
            this.mTarget = arrayLF[this.partnerIndex][1];
            // Momentanen Standort als original deklarieren
            this.origC = this.lfCenter;
            // LF auf Partner-LF ausrichten
            this.initNodes();
            this.rAngle = this.calcAngle(this.mTarget);
            this.rotateNodes(this.rAngle);
            // Flags zurücksetzen -> FALSE
            this.changeFlag = false;
            this.koModus = false;
          }
          this.gCounter -= 1.5;
          //console.log('gCounter: ',this.gCounter);
        } else {
          // Paarung beendet
          //console.log('Paarung (männliche LF) -> Zurückfahren!');
          // Paarungs-Zähler pCounter auf Standard-Wert setzen
          this.pCounter -= 1;
          if (this.pCounter < 0) this.pCounter = 1;
          // Standard-Wert globaler Zähler
          this.gCounter = 25;
          // Partner-Index zurücksetzen
          this.partnerIndex = null;
          // Zurückfahren (case 8)
          this.initFlags();
          this.caseEvent = 8;
          // Neues Zufalls-Ziel festlegen (damit die Paarungs-LF's nicht aufeinander zu fahren)
          this.mTarget = getRandompoint();
        }
      }
    } else {
      // Partner existiert nicht mehr -> neues Ziel festlegen
      this.partnerIndex = null;
      this.origC = this.lfCenter;
      this.init();
      this.caseEvent = 0; 
      this.movetoTarget();
    }
  }
  // Zurückfahren (case 8)
  private walkBack() {
    //console.log('--------------------------------');
    //console.log('FUNCTION walkBack');
    // Distanz zum Rücksetz-Point (lfLength * 2.5 + Zufallswert)
    var distance = this.lfLength * 2.25 + Math.floor(Math.random() * 3);
    //console.log('Rücksetz-Distanz: ',distance);
    // Winkel zum Rücksetz-Point berechnen
    var aAngle = (this.rAngle + 180);
    //console.log('Rücksetz-Winkel: ',aAngle);
    var avoidangleRad = aAngle * Math.PI / 180;
    //console.log('Rücksetz-Winkel Rad: ',avoidangleRad);
    // Koordinaten des Rücksetz-Points (aTarget) berechnen
    var newX = this.lfCenter.x + Math.cos(avoidangleRad) * distance;
    var newY = this.lfCenter.y + Math.sin(avoidangleRad) * distance;
    this.aTarget = new Point(newX, newY);      
    // Momentanen Standort als original deklarieren
    this.origC = this.lfCenter;
    // Geschwindigkeit mit Hilfe der Distanz zum Rücksetz-Point berechnen
    var distance = this.lfCenter.distanceTo(this.aTarget);
    //console.log('Distanz: ',distance);
    // Mit etwas verringerter Geschwindigkeit zurückfahren
    this.step = this.calculateSpeed(distance) * 0.75;
    // Flag Ausweichkurs fahren setzen -> TRUE
    this.avoidCourse = true;
    // Standard-Event setzen
    this.caseEvent = 0; 
    // Rücksetz-Point aTarget ansteuern
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
      // Lebensform aus dem Array der LFs entfernen -> arrayLF[lfNumber] => undefined
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
      // Standard-Wert globaler Zähler
      this.gCounter = 25;
      // Opazität auf 1 setzen (sicherheitshalber)
      this.opacity = 1;
      // birthFlag zurücksetzen
      this.birthFlag = false;
      // Lebensform läuft los -> Zufallsziel generieren und ansteuern (case 0)
      this.origC = this.lfCenter;
      this.init();
      this.caseEvent = 0;
      this.movetoTarget();
    }
  }
  /* Lebensform agiert (führt aufgrund bestimmter Events eine entsprechende Aktion durch) */
  public walk() {
    //console.log('--------------------------------');
    //console.log('FUNCTION walk');
    // Fall-Evaluierung (caseEvent-Detection, default: case 0 = mTarget ansteuern)
    // Prüfung Paarung/KO-Modus
    if (this.pairFlag === true) {
      // Paarung -> meetPartner() -> case 7
      this.caseEvent = 7;
    } else {
      if (this.koModus === true) {
        // KO-Modus -> case 6
        this.caseEvent = 6;
      }
    }
    // Prüfung Nahrungsaufnahme -> eat() -> case 2
    if (this.caseEvent == 0 && this.eatFlag === true) {
      this.caseEvent = 2;
    }
    // Kollisionsprüfung -> avoidKollision() -> case 1
    if (this.caseEvent == 0 || this.caseEvent == 3) {
      this.caseEvent = this.proofKollision();
    }
    // Notfall-Prozedur für männliche LF's zur Erhaltung der Art
    if (this.cIndex == 1 && numMale == 1) {
      if (this.prepairFlag === false && this.delFlag === false && this.eatFlag === false && this.pCounter != 0) {
        this.pCounter = 0;
        this.partnerIndex = null;
        this.partnerFlag = false;
        this.foodFlag = false;
        console.log('Prozedur zur Arterhaltung für männliche LF ',this.lfNumber,' wurde aufgerufen.');
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
    // Partnersuche (nur männliche LFs, cIndex = 1) -> erfolgreiche Suche erzeugt case 3
    if (this.cIndex == 1 && this.caseEvent == 0 && this.eLevel > this.pLevel && this.foodFlag === false && this.prepairFlag === false && this.pCounter <= 0) {
      // Suche Partner
      this.caseEvent = this.searchPartner();
    }
    // Prüfung Ziel = Partner -> walktoPartner() -> case 3
    if (this.caseEvent == 0 && this.partnerFlag === true && this.prepairFlag === true) {
      this.caseEvent = 3;
    }
    // Nahrungssuche -> setzt foodFlag und erzeugt case 0, bei erreichtem Ziel erzeugt foodFlag case 2
    if (this.caseEvent == 0 && this.eLevel < this.hLevel && this.foodFlag === false && this.prepairFlag === false) {
      this.caseEvent = this.searchFood();
    }
    //console.log('walk -> caseEvent =',this.caseEvent);
    // Aktion entsprechend des evaluierten Events durchführen
    switch (this.caseEvent) {
      case 0:
        // Target/Ausweichziel ansteuern
        this.movetoTarget();
        break;
      case 1:
        // Kollision vermeiden
        this.avoidKollision();
        break;
      case 2:
        // Nahrungsaufnahme
        this.eat();
        break;
      case 3:
        // Zum Partner gehen
        this.walktoPartner();
        break;
      case 4:
        // LF-Kollision
        this.accidentKollision();
        break;
      case 5:
        // Block/Nahrungsquellen-Kollision
        this.accidentBFKollision();
        break;
      case 6:
        // KO-Modus
        this.execKOmodus();
        break;
      case 7:
        // Partner treffen/Paarung
        this.meetPartner();
        break;
      case 8:
        // Zurückfahren
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
        // Nur zur Sicherheit: Target ansteuern
        this.movetoTarget();
    }
    // Lebenszeit der Lebensform berechnen
    if (zaehler / timeIntervall == Math.abs(zaehler / timeIntervall)) this.lifeTime -= 0.05;
    //console.log('lifeTime: ',this.lifeTime);
    // Energie-Level berechnen
    this.eLevel -= 0.05;
    //console.log('eLevel: ',this.eLevel);
    // Prüfung Lebenszeit/Energie-Level abgelaufen (lifeTime/eLevel < 0)
    if (this.caseEvent != 9 && this.delFlag === false && this.koModus === false && this.birthFlag === false) {
      if (this.lifeTime < 0) {
        console.log('Lebenszeit von LF ',this.lfNumber,' ist abgelaufen.');
        //console.log('Lebenszeit: ',this.lifeTime);
        // fadeOut/Delete starten (case 9)
        this.changeFlag = false;
        this.delFlag = true;
        this.gCounter = 100;
        this.caseEvent = 9;
        this.fadeOut();
      } else {
        if (this.eLevel < 0 && this.eatFlag === false) {
          console.log('Energie-Level von LF ',this.lfNumber,' ist abgelaufen.');
          //console.log('Energie-Level: ',this.eLevel);
          // fadeOut/Delete starten (case 9)
          this.changeFlag = false;
          this.delFlag = true;
          this.gCounter = 100;
          this.caseEvent = 9;
          this.fadeOut();
        }
      }
    }
    // Opazität auf 1 setzen (sicherheitshalber)
    if (this.birthFlag === false && this.delFlag === false) this.opacity = 1;
    // Simulation stoppen (zu Testzwecken)
    //console.log('Simulation gestoppt.');
    //clearInterval(simulation);
  }
  /**
  *   Zeichnen der Lebensform
  *   @param ctx - rendering context
  */
  public draw(ctx:CanvasRenderingContext2D):void {
    // Kreis (grün) bei fadeIn
    if (this.birthFlag === true) {
      var kcenter = transformTDPoint(this.lfCenter);
      var radius = this.lfLength / 2 + 1;
      var k = new Kreis(kcenter, radius, 0, Math.PI * 2, '', '0,255,0', this.opacity, 1, 'stroke');
      k.draw(ctx);
    }
    // Kreis (rot) bei fadeOut
    if (this.delFlag === true) {
      var kcenter = transformTDPoint(this.lfCenter);
      var radius = this.lfLength / 2 + 1;
      var k = new Kreis(kcenter, radius, 0, Math.PI * 2, '', '255,0,0', this.opacity, 1, 'stroke');
      k.draw(ctx);
    }
    // Opazität auf 1 setzen (sicherheitshalber)
    if (this.birthFlag === false && this.delFlag === false) this.opacity = 1;
    // Erstellen des Arrays der Punkte der Lebensform (Systemkoordinaten) für das Zeichnen als eine veForm
    var aPoints:Array<Point> = [];
    for (var n = 0; n < this.nodes.length; n++) {
      var x = this.nodes[n].x + this.lfCenter.x;
      var y = this.nodes[n].y + this.lfCenter.y;
      aPoints[n] = transformTDPoint(new Point(x, y));
    }
    // Zeichne die Lebensform als veForm (beliebige Form mit vier Eckpunkten)
    var lf = new veForm(aPoints, this.fColor, this.sColor, 1, 'fillstroke');
    lf.draw(ctx);
  }
}
/** Class Block (Hindernis) */
class Block {
  /** Properties */
  public bCenter:Point  = null;
  public bWidth:number  = 0;
  public bLength:number = 0;
  public rAngle:number  = 0;
  public bnumber:number = 0;
  /** Vars */
  private nodes:Array<Point>;   // Array der Block-Punkte
  private sColor:string         // Stroke color
  private fColor:string         // Fill color
  /**
  *   Konstruiert einen Block im 2D-Raum 
  *   @param bCenter  Zentrum des Blocks (X,Y)
  *   @param bfWidth  Breite des Blocks (Y)
  *   @param bLength  Länge des Blocks (X)
  *   @param rAngle   Rotationswinkel des Blocks (Z-Achse, Funktion rotateNodes(rAngle))
  *   @param bnumber  Array-Nummer des Blocks
  */
  public constructor(bCenter:Point, bWidth:number, bLength:number, rAngle:number, bnumber:number) {
    // Properties übernehmen
  	this.bCenter = bCenter
    this.bWidth  = bWidth;
    this.bLength = bLength;
    this.rAngle  = rAngle;
    this.bnumber = bnumber;
    // Vars
    this.nodes = [];
    this.fColor = '#aaa';
    this.sColor = '#aaa';
    // Initalisierungs-Prozeduren
    this.init();
  }
  /** Funktionen */
  // Rotieren der Block-Nodes im virtuellen Raum auf theta Grad
  private rotateNodes(theta:number) {
    for (var n = 0; n < this.nodes.length; n++) {
      var node = this.nodes[n];
      this.nodes[n] = rotateTDPointZ(theta, node);
    }
  }
  // Rotieren des Blocks im virtuellen Raum auf theta Grad
  private rotateMe(theta:number) {
    this.initNodes();
    this.rotateNodes(theta);
    this.rAngle = theta;
  }
  /** Initalisierungs-Prozeduren */
  // Initalisierung der Nodes des Blocks im virtuellen Raum (Centerpoint = 0,0)
  private initNodes() {
    var node0 = new Point(0 - this.bLength/2, 0 + this.bWidth/2);
    var node1 = new Point(0 + this.bLength/2, 0 + this.bWidth/2);
    var node2 = new Point(0 + this.bLength/2, 0 - this.bWidth/2);
    var node3 = new Point(0 - this.bLength/2, 0 - this.bWidth/2);
    this.nodes = [node0, node1, node2, node3];
  }
  // Initalisierungs-Prozedur
  private init() {
    this.initNodes();
    this.rotateNodes(this.rAngle);
  }
  /**
  *   Zeichnen des Blocks
  *   @param ctx - rendering context
  */
  public draw(ctx:CanvasRenderingContext2D):void {
    // Erstellen des Arrays der Punkte des Blocks für das Zeichnen als eine veForm
    var aPoints:Array<Point> = [];
    for (var n = 0; n < this.nodes.length; n++) {
      var x = this.nodes[n].x + this.bCenter.x;
      var y = this.nodes[n].y + this.bCenter.y;
      aPoints[n] = transformTDPoint(new Point(x, y));
    }
    // Zeichne den Block als veForm (beliebige Form mit vier Eckpunkten)
    var b = new veForm(aPoints, this.fColor, this.sColor, 1, 'fillstroke');
    b.draw(ctx);
  }
}
/** Class Food (Nahrungsquelle) */
class Food {
  /** Properties */
  public cCenter:Point = null;
  /** Vars */
  private growState:number;   // Wachstums-Status (growColor: <25 = 0, 25 - <50 = 1, 50 - <75 = 2, 75 - 100 = 3)
  private growSpeed:number;   // Wachstums-Geschwindigkeit
  public growColor:number;    // Wachstums-Farbe, gleichzeitig Genießbarkeit (0 - 2: ungenießbar, 3 = genießbar)
  public occupyFlag:boolean;  // Besetzt-Flag (false: nein, true: ja)
  /**
  *   Konstruiert eine Nahrungsquelle im 2D-Raum
  *   @param cCenter  X-, Y-Koordinate des Nahrungsquellen-Zentrums
  */
  public constructor(cCenter:Point) {
    // Property übernehmen
    this.cCenter = cCenter;
    // Initialisierung
    this.init();
  }
  /** Initialisierung */
  private init() {
    // Vars für Wachstum
    this.growState = 0;
    this.growSpeed = 0.07 + ((Math.random() + 0.01) / 10);
    this.growColor = 0;
    // Besetzt-Flag
    this.occupyFlag = false;
  }
  /** Wachstums-Funktion */
  public grow() {
    this.growState += this.growSpeed;
    //console.log('growState: ',this.growState);
    if (this.growState > 100) {
      this.growColor = 0;
      this.growState = 0;
    } else {
      // growColor entsprechend des growStates berechnen
      this.growColor = Math.ceil(this.growState / 25) - 1;
      //console.log('growColor: ',this.growColor);
    }
  }
  /**
  *   Zeichnen der Nahrungsquelle im 2D-Raum
  *   @param ctx - rendering context
  */
  public draw(ctx:CanvasRenderingContext2D):void {
    // Umrechnung des virtuellen Center-Points in die System-Koordinaten
    var cCenter = transformTDPoint(this.cCenter);
    // Zeichne die Nahrungsquelle als Kreis
    var k = new Kreis(cCenter, 1.5 , 0, Math.PI * 2, arrayFColors[this.growColor], '', 1, 1, 'fill');
    k.draw(ctx);
  }
}
/** Zusätzliche Klassen
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
/** Class veForm (beliebige 2D-Form mit vier Eckpunkten) - benützt von lForm und Block
    Verwendet  moveTo() und lineTo()
    JS-Syntax  context.moveTo(xStart,yStart);
               context.lineTo(xEnd,yEnd);
*/
class veForm {
  public points:Array<Point> = [];
  public fcolor:string = '';
  public scolor:string = '';
  public lwidth:number = 0;
  public dflag:string  = '';
  /**
  *   Konstruiert eine veForm im 2D-Raum
  *   @param points  Array der X- und Y-Koordinaten der vier veForm-Points
  *   @param fcolor  Fill color
  *   @param scolor  Stroke color
  *   @param lwidth  Line width
  *   @param dflag   Draw-Flag: fill, stroke oder fillstroke
  */
  public constructor(points:Array<Point>, fcolor:string, scolor:string, lwidth:number, dflag:string) {
  	this.points = points;
    this.fcolor = fcolor;
    this.scolor = scolor;
    this.lwidth = lwidth;
    this.dflag  = dflag;
  }
  /**
  *   Subroutine zum Zeichnen der veForm
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
  *   Zeichnet eine veForm im 2D-Raum
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
/** Class Kreis (2D-Kreis) - benützt von Food
    Verwendet  arc()
    JS-Syntax  context.arc(x,y,r,sAngle,eAngle[,counterclockwise]);
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
  *   Konstruiert einen Kreis im 2D-Raum
  *   @param cCenter  X-, Y-Koordinate des Kreis-Zentrums
  *   @param radius   Radius des Kreises
  *   @param sAngle   Startwinkel, in Rad
  *   @param eAngle   Endwinkel, in Rad
  *   @param fcolor   Fill color
  *   @param scolor   Stroke color
  *   @param opacity  Opazität
  *   @param lwidth   Line width
  *   @param dflag    Draw-Flag: fill, stroke oder fillstroke
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
    // Farben-Strings erstellen (Form: 'rgba(r,g,b,o)'
    this.fcolor = 'rgba('+this.fcolor+','+this.opacity+')';
    this.scolor = 'rgba('+this.scolor+','+this.opacity+')';
  }
  /**
  *   Zeichnet einen Kreis im 2D-Raum
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