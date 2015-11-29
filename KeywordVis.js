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
    var border_x = 15;
    var border_y = 15;
    var squares = this.svg.append("g")
        .attr("transform", "translate(" + border_x + "," + border_y + ")")
        .selectAll("rect").data(this.keywordGraph.vertices);

    var text_width = 50;
    var text_height = 30;
    squares.enter().append("rect")
        .attr("x", function(d, i) { return (i % 21) * text_width; })
        .attr("y", function(d, i) { return Math.floor(i / 21) * text_height; })
        .attr("width", text_width)
        .attr("height", text_height)
        .style("stroke", "white")
        .style("fill", "rgb(119, 119, 119)");
}