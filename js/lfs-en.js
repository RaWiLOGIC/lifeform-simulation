var canvasCenter;
var canvasWidth;
var canvasHeight;
var arrayLF = [];
var numLFs = 6;
var numFemale;
var numMale;
var lifeTime = 100;
var arrayColors = [['255,80,210', '255,80,210'], ['55,176,255', '55,176,255']];
var arrayBlock;
var arrayFood;
var arrayFColors = ['96,96,96', '72,130,75', '46,177,52', '0,226,11'];
var simulation;
var zaehler = 0;
var activeLifeforms = 0;
var tickTime = 50;
var stopTime = 30;
var stopFlag;
var timeIntervall;
var sStunde = 0;
var sMinute = 0;
var sSekunde = 0;
var timeString;
class LFsimulation {
    constructor({ canvasDiv = 'canvasdiv', canvas = 'cnv' }) {
        this.tick = () => {
            var lfs = 0;
            var numF = 0;
            var numM = 0;
            for (var i = 0; i < arrayLF.length; i++) {
                if (arrayLF[i] != undefined) {
                    arrayLF[i][0].walk();
                    lfs += 1;
                    if (arrayLF[i] != undefined && arrayLF[i][2] == 0)
                        numF += 1;
                    else
                        numM += 1;
                }
            }
            activeLifeforms = lfs;
            numFemale = numF;
            numMale = numM;
            this.lfDisplay.innerHTML = 'Life forms: ' + activeLifeforms + ' (' + numFemale + ' Female / ' + numMale + ' Male)';
            for (var i = 0; i < arrayFood.length; i++) {
                if (arrayFood[i] != undefined) {
                    arrayFood[i][0].grow();
                }
            }
            this.render(this.ctx);
            zaehler += 1;
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
            if (activeLifeforms > 1) {
                var dIndex;
                var cIndex;
                stopFlag = true;
                dIndex = getdefinedIndex();
                if (arrayLF[dIndex] != undefined)
                    cIndex = arrayLF[dIndex][2];
                for (var i = dIndex + 1; i < arrayLF.length; i++) {
                    if (arrayLF[i] != undefined && arrayLF[i][2] != cIndex)
                        stopFlag = false;
                }
            }
            if (activeLifeforms < 4 || stopFlag === true) {
                if (stopTime > 0) {
                    stopTime -= 1;
                }
                else {
                    clearInterval(simulation);
                    changeButtons();
                }
            }
        };
        this.canvasdiv = document.getElementById(canvasDiv);
        this.canvas = document.getElementById(canvas);
        this.ctx = this.canvas.getContext("2d");
        canvasWidth = this.canvas.getBoundingClientRect().width;
        canvasHeight = this.canvas.getBoundingClientRect().height;
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
        canvasCenter = new Point(canvasWidth / 2, canvasHeight / 2);
        this.canvasBackground = '#000';
        this.timeDisplay = document.getElementById('timedisplay');
        this.lfDisplay = document.getElementById('lfdisplay');
        this.endDisplay = document.getElementById('enddisplay');
    }
    initBlocks() {
        arrayBlock = [];
        var bNum = 0;
        for (var i = 1; i <= 4; i++) {
            for (var j = 1; j <= 4; j++) {
                var x = canvasWidth / 5 * i - canvasWidth / 2;
                var y = canvasHeight / 5 * j - canvasHeight / 2;
                var center = new Point(x, y);
                var b = new Block(center, 1.4, 1.4, 0, i);
                arrayBlock[bNum] = [b, center];
                bNum += 1;
            }
        }
    }
    initFoods() {
        arrayFood = [];
        var fNum = 0;
        for (var i = 1; i <= 5; i++) {
            for (var j = 1; j <= 5; j++) {
                var x = canvasWidth / 5 * i - canvasWidth / 10 - canvasWidth / 2;
                var y = canvasHeight / 5 * j - canvasHeight / 10 - canvasHeight / 2;
                var center = new Point(x, y);
                var f = new Food(center);
                arrayFood[fNum] = [f, center];
                fNum += 1;
            }
        }
    }
    createLFcenter() {
        var center = getRandompoint();
        for (var i = 0; i < arrayBlock.length; i++) {
            var d = center.distanceTo(arrayBlock[i][1]);
            if (d < 20)
                this.createLFcenter();
        }
        return center;
    }
    initLforms() {
        var center;
        var cIndex;
        var lf;
        center = this.createLFcenter();
        lf = new lForm(center, 3.5, 7, 0, 0);
        arrayLF[0] = [lf, center, 0];
        center = this.createLFcenter();
        lf = new lForm(center, 3.5, 7, 1, 1);
        lf.pCounter = 0;
        arrayLF[1] = [lf, center, 1];
        center = this.createLFcenter();
        lf = new lForm(center, 3.5, 7, 0, 2);
        arrayLF[2] = [lf, center, 0];
        center = this.createLFcenter();
        lf = new lForm(center, 3.5, 7, 1, 3);
        lf.pCounter = 0;
        arrayLF[3] = [lf, center, 1];
        if (numLFs > 4) {
            for (var i = 4; i < numLFs; i++) {
                center = this.createLFcenter();
                cIndex = Math.round(Math.random());
                lf = new lForm(center, 3.5, 7, cIndex, i);
                lf.pCounter = 1;
                arrayLF[i] = [lf, center, cIndex];
            }
        }
        activeLifeforms = arrayLF.length;
    }
    initSimulation() {
        timeIntervall = 1000 / tickTime;
        this.initBlocks();
        this.initFoods();
        this.initLforms();
        this.render(this.ctx);
        this.startSimulation();
    }
    startSimulation() {
        simulation = window.setInterval(this.tick, tickTime);
    }
    render(ctx) {
        ctx.fillStyle = this.canvasBackground;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        for (var i = 0; i < arrayBlock.length; i++) {
            arrayBlock[i][0].draw(ctx);
        }
        for (var i = 0; i < arrayFood.length; i++) {
            arrayFood[i][0].draw(ctx);
        }
        for (var i = 0; i < arrayLF.length; i++) {
            if (arrayLF[i] != undefined)
                arrayLF[i][0].draw(ctx);
        }
        if (stopTime <= 1) {
            this.endDisplay.style.display = 'block';
        }
    }
}
function changeButtons() {
    var b1 = document.getElementById('b1');
    b1.disabled = false;
    var b2 = document.getElementById('b2');
    b2.disabled = true;
}
function transformTDPoint(tdpoint) {
    var x = canvasCenter.x + tdpoint.x;
    var y = canvasCenter.y + tdpoint.y;
    return new Point(x, y);
}
function rotateTDPointZ(theta, tdpoint) {
    var w = theta * Math.PI / 180;
    var sinTheta = Math.sin(w);
    var cosTheta = Math.cos(w);
    return new Point(tdpoint.x * cosTheta - tdpoint.y * sinTheta, tdpoint.y * cosTheta + tdpoint.x * sinTheta);
}
function getRandompoint() {
    var x = Math.floor((Math.random() * (canvasWidth - 40))) - (canvasWidth / 2 - 20);
    var y = Math.floor((Math.random() * (canvasHeight - 40))) - (canvasHeight / 2 - 20);
    return new Point(x, y);
}
function getundefinedIndex() {
    for (var i = 0; i < arrayLF.length; i++) {
        if (arrayLF[i] == undefined)
            return i;
    }
    return arrayLF.length;
}
function getdefinedIndex() {
    for (var i = 0; i < arrayLF.length; i++) {
        if (arrayLF[i] != undefined)
            return i;
    }
    return 0;
}
class lForm {
    constructor(lfCenter, lfWidth, lfLength, cIndex, lfNumber) {
        this.lfCenter = null;
        this.lfWidth = 0;
        this.lfLength = 0;
        this.cIndex = 0;
        this.lfNumber = 0;
        this.lfCenter = lfCenter;
        this.lfWidth = lfWidth;
        this.lfLength = lfLength;
        this.cIndex = cIndex;
        this.lfNumber = lfNumber;
        this.origC = lfCenter;
        this.nodes = [];
        this.caseEvent = 0;
        this.kollDistance = this.lfWidth + this.lfLength + Math.random() * 3;
        this.opacity = 1;
        this.fColor = 'rgba(' + arrayColors[this.cIndex][0] + ',' + this.opacity + ')';
        this.sColor = 'rgba(' + arrayColors[this.cIndex][1] + ',' + this.opacity + ')';
        this.lifeTime = lifeTime + Math.round(Math.random() * lifeTime / 2);
        this.eLevel = 50 + Math.round(Math.random() * 50);
        this.hLevel = 50;
        this.pLevel = 25;
        this.meetDistance = 2.5;
        this.pCounter = 1;
        this.partnerIndex = null;
        this.koCounter = 100;
        this.gCounter = 25;
        this.init();
    }
    rotateNodes(theta) {
        for (var n = 0; n < this.nodes.length; n++) {
            var node = this.nodes[n];
            this.nodes[n] = rotateTDPointZ(theta, node);
        }
    }
    rotateMe(theta) {
        this.initNodes();
        this.rotateNodes(theta);
        this.rAngle = theta;
    }
    calculateSpeed(distance) {
        var step;
        if (this.partnerFlag === true || this.foodFlag === true) {
            step = 0.995;
            return step;
        }
        if (distance > 200) {
            step = 0.7;
            return step;
        }
        else {
            if (distance > 100) {
                step = 0.65;
            }
            else {
                step = 0.6;
            }
            return step;
        }
    }
    calcAngle(target) {
        var rotAngleRad = this.origC.getAngleBetween(target) + Math.PI * 2;
        var rotAngleDeg = Math.round((180 / Math.PI * rotAngleRad) - 180);
        return rotAngleDeg;
    }
    initNodes() {
        var node0 = new Point(this.lfLength / 2, 0);
        var node1 = new Point(-this.lfLength / 2, +this.lfWidth / 2);
        var node2 = new Point(-this.lfLength / 5, 0);
        var node3 = new Point(-this.lfLength / 2, -this.lfWidth / 2);
        this.nodes = [node0, node1, node2, node3];
    }
    initFlags() {
        this.avoidCourse = false;
        this.changeFlag = true;
        this.delFlag = false;
        this.koModus = false;
        this.foodFlag = false;
        this.eatFlag = false;
        this.partnerFlag = false;
        this.prepairFlag = false;
        this.pairFlag = false;
        this.birthFlag = false;
    }
    initTarget() {
        this.mTarget = getRandompoint();
        for (var i = 0; i < arrayBlock.length; i++) {
            var d = this.mTarget.distanceTo(arrayBlock[i][1]);
            if (d < this.kollDistance)
                this.initTarget();
        }
        var distance = this.origC.distanceTo(this.mTarget);
        if (distance < this.kollDistance)
            this.initTarget();
        this.step = this.calculateSpeed(distance);
    }
    init() {
        this.initNodes();
        this.initFlags();
        this.initTarget();
        this.rAngle = this.calcAngle(this.mTarget);
        this.rotateNodes(this.rAngle);
    }
    initBirth(center) {
        var aIndex;
        var cIndex;
        var lf;
        aIndex = getundefinedIndex();
        console.log('LF ', aIndex, ' is born.');
        cIndex = Math.round(Math.random());
        lf = new lForm(center, 3.5, 7, cIndex, aIndex);
        lf.opacity = 0;
        lf.gCounter = 0;
        lf.changeFlag = false;
        lf.birthFlag = true;
        lf.caseEvent = 10;
        arrayLF[aIndex] = [lf, center, cIndex];
    }
    proofKollision() {
        for (var i = 0; i < arrayLF.length; i++) {
            if (i != this.lfNumber && arrayLF[i] != undefined && this.changeFlag === true && this.birthFlag === false) {
                var distance = this.lfCenter.distanceTo(arrayLF[i][1]);
                if (distance < this.kollDistance) {
                    this.kollIndex = i;
                    this.avoidMode = 0;
                    var gender = arrayLF[this.kollIndex][2];
                    if (gender == this.cIndex) {
                        if (distance < this.lfLength / 2) {
                            this.changeFlag = false;
                            return 4;
                        }
                        else {
                            for (var j = 0; j < arrayLF.length; j++) {
                                if (j != this.lfNumber && arrayLF[j] != undefined && j != i) {
                                    var distance = this.lfCenter.distanceTo(arrayLF[j][1]);
                                    if (distance < this.kollDistance)
                                        return 8;
                                }
                            }
                            for (var j = 0; j < arrayBlock.length; j++) {
                                if (arrayBlock[j] != undefined) {
                                    var distance = this.lfCenter.distanceTo(arrayBlock[j][1]);
                                    if (distance < this.kollDistance)
                                        return 8;
                                }
                            }
                            for (var j = 0; j < arrayFood.length; j++) {
                                if (arrayFood[j] != undefined && arrayFood[j][0].growState < 3) {
                                    var distance = this.lfCenter.distanceTo(arrayFood[j][1]);
                                    if (distance < this.kollDistance)
                                        return 8;
                                }
                            }
                            return 1;
                        }
                    }
                    else {
                        if (this.cIndex == 0) {
                            if (this.prepairFlag === true) {
                                if (arrayLF[this.kollIndex][0].partnerIndex == this.lfNumber) {
                                    this.pairFlag = true;
                                    return 7;
                                }
                                else {
                                    if (distance < this.lfLength / 2) {
                                        this.changeFlag = false;
                                        return 4;
                                    }
                                    else {
                                        for (var j = 0; j < arrayLF.length; j++) {
                                            if (j != this.lfNumber && arrayLF[j] != undefined && j != i) {
                                                var distance = this.lfCenter.distanceTo(arrayLF[j][1]);
                                                if (distance < this.kollDistance)
                                                    return 8;
                                            }
                                        }
                                        for (var j = 0; j < arrayBlock.length; j++) {
                                            if (arrayBlock[j] != undefined) {
                                                var distance = this.lfCenter.distanceTo(arrayBlock[j][1]);
                                                if (distance < this.kollDistance)
                                                    return 8;
                                            }
                                        }
                                        for (var j = 0; j < arrayFood.length; j++) {
                                            if (arrayFood[j] != undefined && arrayFood[j][0].growState < 3) {
                                                var distance = this.lfCenter.distanceTo(arrayFood[j][1]);
                                                if (distance < this.kollDistance)
                                                    return 8;
                                            }
                                        }
                                        return 1;
                                    }
                                }
                            }
                            else {
                                if (distance < this.lfLength / 2) {
                                    this.changeFlag = false;
                                    return 4;
                                }
                                else {
                                    for (var j = 0; j < arrayLF.length; j++) {
                                        if (j != this.lfNumber && arrayLF[j] != undefined && j != i) {
                                            var distance = this.lfCenter.distanceTo(arrayLF[j][1]);
                                            if (distance < this.kollDistance)
                                                return 8;
                                        }
                                    }
                                    for (var j = 0; j < arrayBlock.length; j++) {
                                        if (arrayBlock[j] != undefined) {
                                            var distance = this.lfCenter.distanceTo(arrayBlock[j][1]);
                                            if (distance < this.kollDistance)
                                                return 8;
                                        }
                                    }
                                    for (var j = 0; j < arrayFood.length; j++) {
                                        if (arrayFood[j] != undefined && arrayFood[j][0].growState < 3) {
                                            var distance = this.lfCenter.distanceTo(arrayFood[j][1]);
                                            if (distance < this.kollDistance)
                                                return 8;
                                        }
                                    }
                                    return 1;
                                }
                            }
                        }
                        else {
                            if (this.partnerFlag === true) {
                                if (this.kollIndex == this.partnerIndex) {
                                    if (distance < this.meetDistance) {
                                        this.changeFlag = false;
                                        this.pairFlag = true;
                                        return 7;
                                    }
                                    else {
                                        return 3;
                                    }
                                }
                                else {
                                    if (distance < this.lfLength / 2) {
                                        this.changeFlag = false;
                                        return 4;
                                    }
                                    else {
                                        for (var j = 0; j < arrayLF.length; j++) {
                                            if (j != this.lfNumber && arrayLF[j] != undefined && j != i) {
                                                var distance = this.lfCenter.distanceTo(arrayLF[j][1]);
                                                if (distance < this.kollDistance)
                                                    return 8;
                                            }
                                        }
                                        for (var j = 0; j < arrayBlock.length; j++) {
                                            if (arrayBlock[j] != undefined) {
                                                var distance = this.lfCenter.distanceTo(arrayBlock[j][1]);
                                                if (distance < this.kollDistance)
                                                    return 8;
                                            }
                                        }
                                        for (var j = 0; j < arrayFood.length; j++) {
                                            if (arrayFood[j] != undefined && arrayFood[j][0].growState < 3) {
                                                var distance = this.lfCenter.distanceTo(arrayFood[j][1]);
                                                if (distance < this.kollDistance)
                                                    return 8;
                                            }
                                        }
                                    }
                                    return 1;
                                }
                            }
                            else {
                                return 1;
                            }
                        }
                    }
                }
            }
        }
        for (var i = 0; i < arrayBlock.length; i++) {
            var distance = this.lfCenter.distanceTo(arrayBlock[i][1]);
            if (distance < this.kollDistance) {
                this.kollIndex = i;
                this.avoidMode = 1;
                if (distance < this.lfLength / 2) {
                    return 5;
                }
                else {
                    if (this.avoidCourse === false) {
                        distance = this.mTarget.distanceTo(arrayBlock[i][1]);
                    }
                    else {
                        distance = this.aTarget.distanceTo(arrayBlock[i][1]);
                    }
                    if (distance < this.kollDistance) {
                        this.origC = this.lfCenter;
                        this.init();
                        return 0;
                    }
                    else {
                        return 1;
                    }
                }
            }
        }
        for (var i = 0; i < arrayFood.length; i++) {
            var distance = this.lfCenter.distanceTo(arrayFood[i][1]);
            if (distance < this.kollDistance && this.foodIndex != i) {
                this.kollIndex = i;
                this.avoidMode = 2;
                var eatable = arrayFood[i][0].growColor;
                if (distance < this.lfLength / 2 && eatable < 3) {
                    return 5;
                }
                else {
                    if (eatable < 3) {
                        if (this.avoidCourse === false) {
                            distance = this.mTarget.distanceTo(arrayFood[i][1]);
                        }
                        else {
                            distance = this.aTarget.distanceTo(arrayFood[i][1]);
                        }
                        if (distance < this.kollDistance) {
                            this.origC = this.lfCenter;
                            this.init();
                            return 0;
                        }
                        else {
                            return 1;
                        }
                    }
                    else {
                        if (this.eLevel < 75 && arrayFood[i][0].occupyFlag === false && this.partnerFlag === false) {
                            this.foodIndex = i;
                            arrayFood[i][0].occupyFlag = true;
                            this.initFlags();
                            this.foodFlag = true;
                            this.mTarget = arrayFood[i][1];
                            this.origC = this.lfCenter;
                            this.initNodes();
                            this.rAngle = this.calcAngle(this.mTarget);
                            this.rotateNodes(this.rAngle);
                            var distance = this.lfCenter.distanceTo(this.mTarget);
                            this.step = this.calculateSpeed(distance);
                            return 0;
                        }
                        else {
                            if (this.avoidCourse === false) {
                                distance = this.mTarget.distanceTo(arrayFood[i][1]);
                            }
                            else {
                                distance = this.aTarget.distanceTo(arrayFood[i][1]);
                            }
                            if (distance < this.kollDistance) {
                                this.origC = this.lfCenter;
                                this.init();
                                return 0;
                            }
                            else {
                                return 1;
                            }
                        }
                    }
                }
            }
        }
        if (this.cIndex == 1 && this.partnerFlag === true) {
            return 3;
        }
        else {
            return 0;
        }
    }
    searchFood() {
        var distance;
        var fArray = [];
        var aNum = 0;
        for (var i = 0; i < arrayFood.length; i++) {
            if (arrayFood[i][0].growColor > 0 && arrayFood[i][0].growColor < 3 && arrayFood[i][0].occupyFlag === false) {
                distance = this.lfCenter.distanceTo(arrayFood[i][1]);
                fArray[aNum] = [i, distance];
                aNum += 1;
            }
        }
        if (fArray.length > 1) {
            fArray.sort((a, b) => a[1] - b[1]);
            this.foodIndex = fArray[0][0];
            this.mTarget = arrayFood[this.foodIndex][1];
            arrayFood[this.foodIndex][0].occupyFlag = true;
            this.initFlags();
            this.foodFlag = true;
            this.origC = this.lfCenter;
            this.initNodes();
            this.rAngle = this.calcAngle(this.mTarget);
            this.rotateNodes(this.rAngle);
            var distance = this.lfCenter.distanceTo(this.mTarget);
            this.step = this.calculateSpeed(distance);
        }
        return 0;
    }
    searchPartner() {
        var distance;
        var fArray = [];
        var aNum = 0;
        for (var i = 0; i < arrayLF.length; i++) {
            if (arrayLF[i] != undefined && arrayLF[i][2] == 0 && arrayLF[i][0].partnerIndex == null && arrayLF[i][0].prepairFlag === false && arrayLF[i][0].pairFlag === false && arrayLF[i][0].foodFlag === false) {
                distance = this.lfCenter.distanceTo(arrayLF[i][1]);
                fArray[aNum] = [i, distance];
                aNum += 1;
            }
        }
        if (fArray.length > 1) {
            fArray.sort((a, b) => a[1] - b[1]);
            this.partnerIndex = fArray[0][0];
            arrayLF[this.partnerIndex][0].prepairFlag = true;
            arrayLF[this.partnerIndex][0].partnerIndex = this.lfNumber;
            this.mTarget = arrayLF[this.partnerIndex][1];
            this.initFlags();
            this.prepairFlag = true;
            this.partnerFlag = true;
            this.origC = this.lfCenter;
            this.initNodes();
            this.rAngle = this.calcAngle(this.mTarget);
            this.rotateNodes(this.rAngle);
            var distance = this.lfCenter.distanceTo(this.mTarget);
            this.step = this.calculateSpeed(distance);
            return 3;
        }
        else
            return 0;
    }
    movetoTarget() {
        if (this.avoidCourse === false) {
            this.lfCenter = this.mTarget.projectOntoCircle(this.lfCenter, this.step);
            arrayLF[this.lfNumber][1] = this.lfCenter;
            if (this.lfCenter.distanceTo(this.mTarget) <= this.meetDistance) {
                if (this.caseEvent == 0)
                    this.partnerIndex = null;
                if (this.foodFlag === true) {
                    this.eatFlag = true;
                    console.log('LF ', this.lfNumber, ' takes in food.');
                }
                else {
                    if (this.cIndex == 1) {
                        this.pCounter = 0;
                    }
                    this.origC = this.lfCenter;
                    this.init();
                    this.caseEvent = 0;
                }
            }
        }
        else {
            this.lfCenter = this.aTarget.projectOntoCircle(this.lfCenter, this.step);
            arrayLF[this.lfNumber][1] = this.lfCenter;
            if (this.lfCenter.distanceTo(this.aTarget) <= this.meetDistance) {
                this.avoidCourse = false;
                this.origC = this.lfCenter;
                this.initNodes();
                this.rAngle = this.calcAngle(this.mTarget);
                this.rotateNodes(this.rAngle);
                var distance = this.origC.distanceTo(this.mTarget);
                this.step = this.calculateSpeed(distance);
                if (this.avoidMode == 0 && arrayLF[this.kollIndex] != undefined)
                    arrayLF[this.kollIndex][0].changeFlag = true;
                if (this.partnerFlag === true) {
                    this.caseEvent = 3;
                }
                else {
                    this.caseEvent = 0;
                }
            }
        }
    }
    avoidKollision() {
        if (this.avoidCourse === false) {
            var vpdistance = this.lfWidth;
            var radvp1 = (this.rAngle - 50) * Math.PI / 180;
            var radvp2 = (this.rAngle + 50) * Math.PI / 180;
            var vp1;
            var vp2;
            var newX;
            var newY;
            var d1;
            var d2;
            var aAngle;
            newX = this.lfCenter.x + Math.cos(radvp1) * vpdistance;
            newY = this.lfCenter.y + Math.sin(radvp1) * vpdistance;
            vp1 = new Point(newX, newY);
            newX = this.lfCenter.x + Math.cos(radvp2) * vpdistance;
            newY = this.lfCenter.y + Math.sin(radvp2) * vpdistance;
            vp2 = new Point(newX, newY);
            switch (this.avoidMode) {
                case 0:
                    if (arrayLF[this.kollIndex] != undefined) {
                        d1 = vp1.distanceTo(arrayLF[this.kollIndex][1]);
                        d2 = vp2.distanceTo(arrayLF[this.kollIndex][1]);
                    }
                    else {
                        d1 = Math.random();
                        d2 = Math.random();
                    }
                    break;
                case 1:
                    d1 = vp1.distanceTo(arrayBlock[this.kollIndex][1]);
                    d2 = vp2.distanceTo(arrayBlock[this.kollIndex][1]);
                    break;
                case 2:
                    d1 = vp1.distanceTo(arrayFood[this.kollIndex][1]);
                    d2 = vp2.distanceTo(arrayFood[this.kollIndex][1]);
                    break;
            }
            if (d1 < d2) {
                aAngle = (this.rAngle + 65);
            }
            else {
                aAngle = (this.rAngle - 65);
            }
            var avoidangleRad = (aAngle) * Math.PI / 180;
            var distance = this.lfLength * 2 + Math.floor(Math.random() * 3);
            var newX = this.lfCenter.x + Math.cos(avoidangleRad) * distance;
            var newY = this.lfCenter.y + Math.sin(avoidangleRad) * distance;
            this.aTarget = new Point(newX, newY);
            this.origC = this.lfCenter;
            this.initNodes();
            this.rAngle = this.calcAngle(this.aTarget);
            this.rotateNodes(this.rAngle);
            var distance = this.lfCenter.distanceTo(this.aTarget);
            this.step = this.calculateSpeed(distance);
            this.avoidCourse = true;
        }
        this.movetoTarget();
    }
    eat() {
        if (arrayFood[this.foodIndex][0].growColor == 3) {
            if (this.gCounter > 0) {
                this.gCounter -= 1;
            }
            else {
                this.eLevel = 100;
                this.gCounter = 25;
                arrayFood[this.foodIndex][0].init();
                this.foodIndex = -1;
                this.partnerIndex = null;
                if (this.cIndex == 1) {
                    this.pCounter = 0;
                }
                this.caseEvent = 0;
                this.origC = this.lfCenter;
                this.init();
            }
        }
    }
    walktoPartner() {
        if (arrayLF[this.partnerIndex] != undefined && arrayLF[this.partnerIndex][0].foodFlag === false) {
            if (this.lfCenter.distanceTo(this.mTarget) > this.meetDistance) {
                this.mTarget = arrayLF[this.partnerIndex][1];
                this.origC = this.lfCenter;
                this.initNodes();
                this.rAngle = this.calcAngle(this.mTarget);
                this.rotateNodes(this.rAngle);
                var distance = this.lfCenter.distanceTo(this.mTarget);
                this.step = this.calculateSpeed(distance);
                this.lfCenter = this.mTarget.projectOntoCircle(this.lfCenter, this.step);
                arrayLF[this.lfNumber][1] = this.lfCenter;
            }
            else {
                this.pairFlag = true;
                arrayLF[this.partnerIndex][0].pairFlag = true;
            }
        }
        else {
            this.partnerIndex = null;
            this.origC = this.lfCenter;
            this.init();
            this.caseEvent = 0;
        }
    }
    accidentKollision() {
        if (arrayLF[this.kollIndex] != undefined) {
            var cindex = arrayLF[this.kollIndex][0].cIndex;
            if (cindex == this.cIndex) {
                if (arrayLF[this.kollIndex][0].changeFlag === true && arrayLF[this.kollIndex][0].birthFlag === false && arrayLF[this.kollIndex][0].delFlag === false && arrayLF[this.kollIndex][0].pairFlag === false) {
                    arrayLF[this.kollIndex][0].koModus = true;
                }
                this.caseEvent = 0;
            }
            else {
                if (this.kollIndex == this.partnerIndex) {
                    this.caseEvent = 3;
                }
                else {
                    if (arrayLF[this.kollIndex][0].changeFlag === true && arrayLF[this.kollIndex][0].birthFlag === false && arrayLF[this.kollIndex][0].delFlag === false && arrayLF[this.kollIndex][0].pairFlag === false) {
                        arrayLF[this.kollIndex][0].koModus = true;
                    }
                    this.caseEvent = 0;
                }
            }
        }
        else {
            this.caseEvent = 0;
        }
    }
    accidentBFKollision() {
        var distance = this.lfLength * 2 + Math.floor(Math.random() * 3);
        var aAngle = (this.rAngle - 180);
        var avoidangleRad = aAngle * Math.PI / 180;
        var newX = this.lfCenter.x + Math.cos(avoidangleRad) * distance;
        var newY = this.lfCenter.y + Math.sin(avoidangleRad) * distance;
        this.aTarget = new Point(newX, newY);
        this.origC = this.lfCenter;
        this.initNodes();
        if (this.avoidMode == 1) {
            this.rAngle = this.calcAngle(arrayBlock[this.kollIndex][1]);
        }
        else {
            this.rAngle = this.calcAngle(arrayFood[this.kollIndex][1]);
        }
        this.rotateNodes(this.rAngle);
        var distance = this.lfCenter.distanceTo(this.aTarget);
        this.step = this.calculateSpeed(distance);
        this.avoidCourse = true;
        this.caseEvent = 0;
        this.movetoTarget();
    }
    execKOmodus() {
        if (this.koCounter > 0) {
            this.koCounter -= 1;
            this.rotateMe(this.rAngle + 7.2);
        }
        else {
            this.koModus = false;
            this.koCounter = 100;
            this.caseEvent = 0;
        }
    }
    meetPartner() {
        if (arrayLF[this.partnerIndex] != undefined) {
            if (this.cIndex == 0) {
                if (this.gCounter > 0) {
                    if (this.gCounter == 25) {
                        this.mTarget = arrayLF[this.partnerIndex][1];
                        this.origC = this.lfCenter;
                        this.initNodes();
                        this.rAngle = this.calcAngle(this.mTarget);
                        this.rotateNodes(this.rAngle);
                        this.changeFlag = false;
                        this.koModus = false;
                    }
                    this.gCounter -= 1.5;
                }
                else {
                    this.initBirth(this.lfCenter);
                    this.gCounter = 25;
                    this.partnerIndex = null;
                    this.initFlags();
                    this.caseEvent = 8;
                    this.mTarget = getRandompoint();
                }
            }
            else {
                if (this.gCounter > 0) {
                    if (this.gCounter == 25) {
                        this.mTarget = arrayLF[this.partnerIndex][1];
                        this.origC = this.lfCenter;
                        this.initNodes();
                        this.rAngle = this.calcAngle(this.mTarget);
                        this.rotateNodes(this.rAngle);
                        this.changeFlag = false;
                        this.koModus = false;
                    }
                    this.gCounter -= 1.5;
                }
                else {
                    this.pCounter -= 1;
                    if (this.pCounter < 0)
                        this.pCounter = 1;
                    this.gCounter = 25;
                    this.partnerIndex = null;
                    this.initFlags();
                    this.caseEvent = 8;
                    this.mTarget = getRandompoint();
                }
            }
        }
        else {
            this.partnerIndex = null;
            this.origC = this.lfCenter;
            this.init();
            this.caseEvent = 0;
            this.movetoTarget();
        }
    }
    walkBack() {
        var distance = this.lfLength * 2.25 + Math.floor(Math.random() * 3);
        var aAngle = (this.rAngle + 180);
        var avoidangleRad = aAngle * Math.PI / 180;
        var newX = this.lfCenter.x + Math.cos(avoidangleRad) * distance;
        var newY = this.lfCenter.y + Math.sin(avoidangleRad) * distance;
        this.aTarget = new Point(newX, newY);
        this.origC = this.lfCenter;
        var distance = this.lfCenter.distanceTo(this.aTarget);
        this.step = this.calculateSpeed(distance) * 0.75;
        this.avoidCourse = true;
        this.caseEvent = 0;
        this.movetoTarget();
    }
    fadeOut() {
        if (this.gCounter > 0) {
            this.gCounter -= 2;
            this.opacity = this.gCounter / 100;
            this.fColor = 'rgba(' + arrayColors[this.cIndex][0] + ',' + this.opacity + ')';
            this.sColor = 'rgba(' + arrayColors[this.cIndex][1] + ',' + this.opacity + ')';
        }
        else {
            delete arrayLF[this.lfNumber];
        }
    }
    fadeIn() {
        if (this.gCounter < 100) {
            this.gCounter += 2;
            this.opacity = this.gCounter / 100;
            this.fColor = 'rgba(' + arrayColors[this.cIndex][0] + ',' + this.opacity + ')';
            this.sColor = 'rgba(' + arrayColors[this.cIndex][1] + ',' + this.opacity + ')';
        }
        else {
            this.gCounter = 25;
            this.opacity = 1;
            this.birthFlag = false;
            this.origC = this.lfCenter;
            this.init();
            this.caseEvent = 0;
            this.movetoTarget();
        }
    }
    walk() {
        if (this.pairFlag === true) {
            this.caseEvent = 7;
        }
        else {
            if (this.koModus === true) {
                this.caseEvent = 6;
            }
        }
        if (this.caseEvent == 0 && this.eatFlag === true) {
            this.caseEvent = 2;
        }
        if (this.caseEvent == 0 || this.caseEvent == 3) {
            this.caseEvent = this.proofKollision();
        }
        if (this.cIndex == 1 && numMale == 1) {
            if (this.prepairFlag === false && this.delFlag === false && this.eatFlag === false && this.pCounter != 0) {
                this.pCounter = 0;
                this.partnerIndex = null;
                this.partnerFlag = false;
                this.foodFlag = false;
                console.log('Species conservation procedure for male LF ', this.lfNumber, ' was called.');
                this.caseEvent = 0;
                this.caseEvent = this.searchPartner();
            }
        }
        if (this.cIndex == 1 && this.caseEvent == 0 && this.eLevel > this.pLevel && this.foodFlag === false && this.prepairFlag === false && this.pCounter <= 0) {
            this.caseEvent = this.searchPartner();
        }
        if (this.caseEvent == 0 && this.partnerFlag === true && this.prepairFlag === true) {
            this.caseEvent = 3;
        }
        if (this.caseEvent == 0 && this.eLevel < this.hLevel && this.foodFlag === false && this.prepairFlag === false) {
            this.caseEvent = this.searchFood();
        }
        switch (this.caseEvent) {
            case 0:
                this.movetoTarget();
                break;
            case 1:
                this.avoidKollision();
                break;
            case 2:
                this.eat();
                break;
            case 3:
                this.walktoPartner();
                break;
            case 4:
                this.accidentKollision();
                break;
            case 5:
                this.accidentBFKollision();
                break;
            case 6:
                this.execKOmodus();
                break;
            case 7:
                this.meetPartner();
                break;
            case 8:
                this.walkBack();
                break;
            case 9:
                this.fadeOut();
                break;
            case 10:
                this.fadeIn();
                break;
            default:
                this.movetoTarget();
        }
        if (zaehler / timeIntervall == Math.abs(zaehler / timeIntervall))
            this.lifeTime -= 0.05;
        this.eLevel -= 0.05;
        if (this.caseEvent != 9 && this.delFlag === false && this.koModus === false && this.birthFlag === false) {
            if (this.lifeTime < 0) {
                console.log('Lifetime of LF ', this.lfNumber, ' has expired.');
                this.changeFlag = false;
                this.delFlag = true;
                this.gCounter = 100;
                this.caseEvent = 9;
                this.fadeOut();
            }
            else {
                if (this.eLevel < 0 && this.eatFlag === false) {
                    console.log('Energy-Level of LF ', this.lfNumber, ' has expired.');
                    this.changeFlag = false;
                    this.delFlag = true;
                    this.gCounter = 100;
                    this.caseEvent = 9;
                    this.fadeOut();
                }
            }
        }
        if (this.birthFlag === false && this.delFlag === false)
            this.opacity = 1;
    }
    draw(ctx) {
        if (this.birthFlag === true) {
            var kcenter = transformTDPoint(this.lfCenter);
            var radius = this.lfLength / 2 + 1;
            var k = new Kreis(kcenter, radius, 0, Math.PI * 2, '', '0,255,0', this.opacity, 1, 'stroke');
            k.draw(ctx);
        }
        if (this.delFlag === true) {
            var kcenter = transformTDPoint(this.lfCenter);
            var radius = this.lfLength / 2 + 1;
            var k = new Kreis(kcenter, radius, 0, Math.PI * 2, '', '255,0,0', this.opacity, 1, 'stroke');
            k.draw(ctx);
        }
        if (this.birthFlag === false && this.delFlag === false)
            this.opacity = 1;
        var aPoints = [];
        for (var n = 0; n < this.nodes.length; n++) {
            var x = this.nodes[n].x + this.lfCenter.x;
            var y = this.nodes[n].y + this.lfCenter.y;
            aPoints[n] = transformTDPoint(new Point(x, y));
        }
        var lf = new veForm(aPoints, this.fColor, this.sColor, 1, 'fillstroke');
        lf.draw(ctx);
    }
}
class Block {
    constructor(bCenter, bWidth, bLength, rAngle, bnumber) {
        this.bCenter = null;
        this.bWidth = 0;
        this.bLength = 0;
        this.rAngle = 0;
        this.bnumber = 0;
        this.bCenter = bCenter;
        this.bWidth = bWidth;
        this.bLength = bLength;
        this.rAngle = rAngle;
        this.bnumber = bnumber;
        this.nodes = [];
        this.fColor = '#aaa';
        this.sColor = '#aaa';
        this.init();
    }
    rotateNodes(theta) {
        for (var n = 0; n < this.nodes.length; n++) {
            var node = this.nodes[n];
            this.nodes[n] = rotateTDPointZ(theta, node);
        }
    }
    rotateMe(theta) {
        this.initNodes();
        this.rotateNodes(theta);
        this.rAngle = theta;
    }
    initNodes() {
        var node0 = new Point(0 - this.bLength / 2, 0 + this.bWidth / 2);
        var node1 = new Point(0 + this.bLength / 2, 0 + this.bWidth / 2);
        var node2 = new Point(0 + this.bLength / 2, 0 - this.bWidth / 2);
        var node3 = new Point(0 - this.bLength / 2, 0 - this.bWidth / 2);
        this.nodes = [node0, node1, node2, node3];
    }
    init() {
        this.initNodes();
        this.rotateNodes(this.rAngle);
    }
    draw(ctx) {
        var aPoints = [];
        for (var n = 0; n < this.nodes.length; n++) {
            var x = this.nodes[n].x + this.bCenter.x;
            var y = this.nodes[n].y + this.bCenter.y;
            aPoints[n] = transformTDPoint(new Point(x, y));
        }
        var b = new veForm(aPoints, this.fColor, this.sColor, 1, 'fillstroke');
        b.draw(ctx);
    }
}
class Food {
    constructor(cCenter) {
        this.cCenter = null;
        this.cCenter = cCenter;
        this.init();
    }
    init() {
        this.growState = 0;
        this.growSpeed = 0.07 + ((Math.random() + 0.01) / 10);
        this.growColor = 0;
        this.occupyFlag = false;
    }
    grow() {
        this.growState += this.growSpeed;
        if (this.growState > 100) {
            this.growColor = 0;
            this.growState = 0;
        }
        else {
            this.growColor = Math.ceil(this.growState / 25) - 1;
        }
    }
    draw(ctx) {
        var cCenter = transformTDPoint(this.cCenter);
        var k = new Kreis(cCenter, 1.5, 0, Math.PI * 2, arrayFColors[this.growColor], '', 1, 1, 'fill');
        k.draw(ctx);
    }
}
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    add(p) {
        return new Point(this.x + p.x, this.y + p.y);
    }
    subtract(p) {
        return new Point(this.x - p.x, this.y - p.y);
    }
    copy() {
        return this.add(new Point(0, 0));
    }
    distanceTo(p) {
        let dx = p.x - this.x;
        let dy = p.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    projectOntoCircle(point, radius) {
        let angle = this.getAngleBetween(point);
        let newX = point.x + Math.cos(angle) * radius;
        let newY = point.y + Math.sin(angle) * radius;
        return new Point(newX, newY);
    }
    getAngleBetween(point) {
        let delta = this.subtract(point);
        let angle = Math.atan2(delta.y, delta.x);
        return angle;
    }
}
class veForm {
    constructor(points, fcolor, scolor, lwidth, dflag) {
        this.points = [];
        this.fcolor = '';
        this.scolor = '';
        this.lwidth = 0;
        this.dflag = '';
        this.points = points;
        this.fcolor = fcolor;
        this.scolor = scolor;
        this.lwidth = lwidth;
        this.dflag = dflag;
    }
    drawveForm(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        ctx.lineTo(this.points[1].x, this.points[1].y);
        ctx.lineTo(this.points[2].x, this.points[2].y);
        ctx.lineTo(this.points[3].x, this.points[3].y);
        ctx.closePath();
    }
    draw(ctx) {
        switch (this.dflag) {
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
class Kreis {
    constructor(cCenter, radius, sAngle, eAngle, fcolor, scolor, opacity, lwidth, dflag) {
        this.cCenter = null;
        this.radius = 0;
        this.sAngle = 0;
        this.eAngle = 0;
        this.fcolor = '';
        this.scolor = '';
        this.opacity = 1;
        this.lwidth = 0;
        this.dflag = '';
        this.cCenter = cCenter;
        this.radius = radius;
        this.sAngle = sAngle;
        this.eAngle = eAngle;
        this.fcolor = fcolor;
        this.scolor = scolor;
        this.opacity = opacity;
        this.lwidth = lwidth;
        this.dflag = dflag;
        this.fcolor = 'rgba(' + this.fcolor + ',' + this.opacity + ')';
        this.scolor = 'rgba(' + this.scolor + ',' + this.opacity + ')';
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.cCenter.x, this.cCenter.y, this.radius, this.sAngle, this.eAngle);
        switch (this.dflag) {
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
