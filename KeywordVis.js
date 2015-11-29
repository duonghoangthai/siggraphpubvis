/**
 * Created by duong on 26/11/2015.
 */
function KeywordVis(keywordGraph) {
    this.svg = d3.select("#kView svg");
    console.log(this.svg);
    this.keywordView = this.svg.append("g");
    this.keywordGraph = keywordGraph;

    this.init();
    this.update();
}

mouseover_item = -2;

KeywordVis.prototype.init = function() {
    var border_x = 25;
    var border_y = 25;
    var text_width = 50;
    var text_height = 25;

    var cells = this.svg
        .append("g")
        .attr("transform", "translate(" + border_x + "," + border_y + ")")
        .selectAll("g")
        .data(this.keywordGraph.vertices)
        .enter().append("g")
        .attr("transform", function(d, i) {
            return "translate(" + Math.floor(i / 32) * text_width + ","
                + (i % 32) * text_height + ")"});

    cells.append("rect")
        .attr("width", text_width)
        .attr("height", text_height)
        .attr("stroke", "rgb(248, 248, 248)")
        .attr("stroke-width", "8")
        //.style("fill", "rgb(119, 119, 119)");
        .attr("fill", "rgb(248, 248, 248)");

    cells.append("text")
        .attr("class", "keyword")
        .attr("x", 5)
        .attr("y", function(d) { return 17; })
        .attr("fill", "rgb(20, 20, 20)")
        .attr("font-size", function(d, i) { if (i === mouseover_item) return "10px"; else return "19px"; })
        .text(function(d) { return d.text; });
}

KeywordVis.prototype.update = function() {
    var mouse_x = Math.floor(mouseover_item / 32);
    var mouse_y = mouseover_item % 32;
    var func = function(d, i) {
        var x = Math.floor(i / 32);
        var y = i % 32;
        if (mouse_y == y && x != mouse_x && Math.abs(x - mouse_x) <= 3)
            return "0.1";
        return "1";
    };

    var rect = this.svg.selectAll("rect").data(this.keywordGraph.vertices);
    rect.transition()
        .duration(100)
        .ease("linear")
        .attr("fill-opacity", func)
        .attr("stroke-opacity", func);

    text = this.svg.selectAll("text").data(this.keywordGraph.vertices);
    text.transition()
        .duration(100)
        .ease("linear")
        .attr("stroke-opacity", func)
        .attr("fill-opacity", func)
        .attr("fill", function(d, i) { if (i == mouseover_item) return "rgb(150, 90, 78)"; else return "rgb(20, 20, 20)"; });

    var self = this;
    text.on("mouseover", function(d, i) {
        //d3.select(this).transition().duration(1000).attr("fill", "rgb(150, 90, 78)");
        mouseover_item = i; self.update();
    });
    this.svg.on("mouseleave", function(d) { mouseover_item = -1; self.update(); });
}
