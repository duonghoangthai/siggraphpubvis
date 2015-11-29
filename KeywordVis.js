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
            return "translate(" + (i % 23) * text_width + ","
                + Math.floor(i / 23) * text_height + ")"});

    cells.append("rect")
        .attr("width", text_width)
        .attr("height", text_height)
        .style("stroke", "rgb(248, 248, 248)")
        .style("stroke-width", "10")
        //.style("fill", "rgb(119, 119, 119)");
        .style("fill", "rgb(248, 248, 248)")

    cells.append("text")
        .attr("x", 5)
        .attr("y", function(d) { return text_height / 3 * 2; })
        .attr("fill", "rgb(20, 20, 20)")
        .attr("font-size", function(d, i) { if (i === mouseover_item) return "10px"; else return "20px"; })
        .text(function(d) { return d.text; });
}

KeywordVis.prototype.update = function() {
    var rect = this.svg.selectAll("rect").data(this.keywordGraph.vertices)
        .attr("fill-opacity", function(d, i) { if (i === mouseover_item + 1 || i === mouseover_item + 2) return "0"; else return "1"; })
        .attr("stroke-opacity", function(d, i) { if (i === mouseover_item + 1 || i === mouseover_item + 2) return "0"; else return "1"; });

    var text = this.svg.selectAll("text").data(this.keywordGraph.vertices)
        .attr("fill-opacity", function(d, i) { if (i === mouseover_item + 1 || i === mouseover_item + 2) return "0"; else return "1"; })
        .attr("stroke-opacity", function(d, i) { if (i === mouseover_item + 1 || i === mouseover_item + 2) return "0"; else return "1"; })
        .attr("font-size", function(d, i) { if (i === mouseover_item) return "21px"; else return "20px"; });
    var self = this;
    text.on("mouseover", function(d, i) { mouseover_item = i; self.update(); });
}
