/**
 * Created by duong on 26/11/2015.
 */
function KeywordVis(keywordGraph) {
    this.svg = d3.select("#kView svg");
    console.log(this.svg);
    this.keywordView = this.svg.append("g");
    this.keywordGraph = keywordGraph;

    this.update();
}

KeywordVis.prototype.update = function() {
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
        .attr("font-size", "20px")
        .text(function(d) { return d.text; });
}