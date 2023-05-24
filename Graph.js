let Graph = class {
  constructor(v) {
    this.group = "";
    this.vectors = v;
    this.str = "";
  }
  setStr(head, g, end) {
    this.str = head;
    this.vectors.forEach(function (v) {
    g.str = g.str + `vertex(${v.x - origin.x}, ${v.y - origin.y});\n`;
    });
    this.str += end;
    // console.log(this.str);
  }
};


function LoadVectors() {
  var g = [];
  for (var i = 0; i < ImgStrings.length - 1; i++) {
    if (ImgStrings[i] == "beginShape(TRIANGLE_STRIP);") {
      var v = [];
      // console.log(`graph${g.length}`);
      while (i < ImgStrings.length - 2 && ImgStrings[i + 1] != "endShape();") {
        var str = ImgStrings[i + 1].replace("vertex(", "");
        str = str.replace(");", "");
        var strs = str.split(",");
        var x = parseInt(strs[0]);
        x = sizeFactor * x + origin.x;
        var y = parseInt(strs[1]);
        y = sizeFactor * y + origin.y;
        v.push(new Vector(x, y));
        // console.log(x+','+y);

        i++;
      }

      if (v.length > 2) {
        var new_g = new Graph(v);
        new_g.setStr("beginShape(TRIANGLE_STRIP);\n", new_g, "endShape();\n");
        g.push(new_g);
      }
    }
    graph = g;
  }
}


function LoadGroups() {
  var g = [];
  for (var i = 0; i < GroupStrings.length - 1; i++) {
    if (GroupStrings[i].startsWith("Group:")) {
      var startStr = GroupStrings[i];
      var v = [];
      while (i < GroupStrings.length - 2 && GroupStrings[i + 1] != "EndGroup") {
        var str = GroupStrings[i + 1].replace("vertex(", "");
        str = str.replace(");", "");
        var strs = str.split(",");
        var x = parseInt(strs[0]);
        x = sizeFactor * x + origin.x;
        var y = parseInt(strs[1]);
        y = sizeFactor * y + origin.y;
        v.push(new Vector(x, y));
        // console.log(x+','+y);
        i++;
      }

      if (v.length > 2) {
        var new_g = new Graph(v);
        new_g.setStr(startStr + '\n', new_g, 'EndGroup\n');
        g.push(new_g);
      }
    }
  }
  groups = g;
    
}