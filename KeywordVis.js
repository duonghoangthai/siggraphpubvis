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
    var squares = this.svg.append("g").selectAll("rect").data(this.keywordGraph.vertices);
    squares.enter().append("rect")
        .attr("x", function(d, i) { return i * 50; })
        .attr("y", 0)
        .attr("width", 50)
        .attr("height", 30)
        .style("stroke", "black")
        .style("fill", "red");
}