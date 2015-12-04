/**
 * Created by duong on 26/11/2015.
 */
function KeywordVis(keywordGraph) {
    this.svg = d3.select("#kView svg");
    this.keywordView = this.svg.append("g");
    this.keywordGraph = keywordGraph;
    this.init();
    this.update();
}

mouseover_item = -1;
neighbor_keywords = [];
selected_keywords = [];
search_text = ""
num_rows = 38;

var isalpha = function(c) { return 'a' <= c && c <= 'z'; };

KeywordVis.prototype.init = function() {
    var border_x = 10;
    var border_y = 10;
    var text_width = 50;
    var text_height = 23;

    var cells = this.svg
        .append("g")
        .attr("transform", "translate(" + border_x + "," + border_y + ")")
        .selectAll("g")
        .data(this.keywordGraph.vertices)
        .enter().append("g")
        .attr("transform", function(d, i) {
            return "translate(" + Math.floor(i / num_rows) * text_width + ","
                + (i % num_rows) * text_height + ")"});

    cells.append("rect")
        .attr("width", text_width)
        .attr("height", text_height)
        .attr("stroke", "rgb(248, 248, 248)")
        .attr("stroke-width", "8")
        //.style("fill", "rgb(119, 119, 119)");
        .attr("fill", "rgb(248, 248, 248)");

    var self = this;
    cells.append("text")
        .attr("class", "leadChar")
        .attr("x", 5)
        .attr("y", function(d) { return 17; })
        .attr("fill", "rgb(20, 150, 250)")
        .attr("fill-opacity","0.6")
        .attr("font-size", "40px")
        .text(function(d, i) {
            if (i > 0 && isalpha(d.text[0]) && d.text.slice(0, 1) != self.keywordGraph.vertices[i-1].text.slice(0, 1))
                return d.text.slice(0, 1).toUpperCase();
            return "";
        });

    cells.append("text")
        .attr("class", "keyword")
        .attr("x", 5)
        .attr("y", function(d) { return 17; })
        .attr("fill", "rgb(20, 20, 20)")
        .attr("font-size", function(d, i) { return "14px"; })
        .text(function(d) { return d.text; });
}

// Find a sub-array from an array
var find_subarray = function (arr, subarr, from_index) {
    from_index = from_index || 0;

    var i, found, j;
    var last_check_index = arr.length - subarr.length;
    var subarr_length = subarr.length;

    position_loop:
        for (i = from_index; i <= last_check_index; ++i) {
            for (j = 0; j < subarr_length; ++j) {
                if (arr[i + j] !== subarr[j]) {
                    continue position_loop;
                }
            }
            return i;
        }
    return -1;
};

KeywordVis.prototype.update = function() {
    var self = this;
    var mouse_x = Math.floor(mouseover_item / num_rows);
    var mouse_y = mouseover_item % num_rows;

    var func = function(d, i) {
        var x = Math.floor(i / num_rows);
        var y = i % num_rows;
        if (mouse_y === y && x !== mouse_x && Math.abs(x - mouse_x) <= 1) {
            return "0.1";
        } else if (search_text !== "" && d.text.indexOf(search_text) !== 0) {
            return "0.1";
        }
        return "1";
    };

    var rect = this.svg.selectAll("rect").data(this.keywordGraph.vertices);
    rect.transition()
        .duration(100)
        .ease("linear")
        .attr("fill-opacity", func)
        .attr("stroke-opacity", func)
        .attr("fill", function(d, i) {
            if (neighbor_keywords.indexOf(i) > -1){
                return "rgb(150, 250, 250)";
            }
            return "rgb(248, 248, 248)";
        });

    text = this.svg.selectAll(".keyword").data(this.keywordGraph.vertices);
    text.transition()
        .duration(100)
        .ease("linear")
        .attr("stroke-opacity", func)
        .attr("fill-opacity", func)
        .attr("fill", function(d, i) {
            if (i === mouseover_item) {
                return "rgb(150, 90, 78)";
            } else if (selected_keywords.indexOf(i) > -1) {
                return "rgb(250, 80, 80)";
            }
            return "rgb(20, 20, 20)";
        });

    text.on("mouseover", function(d, i) {
        //d3.select(this).transition().duration(1000).attr("fill", "rgb(150, 90, 78)");
        mouseover_item = i; self.update();
    });
    text.on("click", function(d, i) {
        var index = selected_keywords.indexOf(i);
        console.log(self.keywordGraph.vertices[i].text);
        if (index === -1) { // click on new keyword
            selected_keywords.push(i);
            neighbor_keywords = neighbor_keywords.concat(self.keywordGraph.edges[i].neighbors);
        } else { // click on an already selected keyword
            selected_keywords.splice(index, 1);
            var neighbor_index = find_subarray(neighbor_keywords, self.keywordGraph.edges[i].neighbors, 0);
            if (neighbor_index >= 0) {
                neighbor_keywords.splice(neighbor_index, self.keywordGraph.edges[i].neighbors.length);
            }
        }
        updateByKeywords();
        self.update();
    });

    var searchBox = d3.select("#searchKeyword");
    searchBox.on("keyup", function(event) {
        search_text = searchBox[0][0].value;
        self.update();
    });
    this.svg.on("mouseleave", function(d) { mouseover_item = -1; self.update(); });
}
