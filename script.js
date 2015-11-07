/*globals d3, topojson, document*/
// These are helpers for those using JSHint

var paperData,
    selectedPaper;

/**
 * @param {{papers:string}} data
 */
function getPapers(data){
    return data.papers;
}

function changeSelection() {
    d3.select("#b2002").selectAll("text").remove();
    d3.select("#b2003").selectAll("text").remove();
    d3.select("#b2004").selectAll("text").remove();
    d3.select("#b2005").selectAll("text").remove();
    d3.select("#b2006").selectAll("text").remove();
    d3.select("#b2007").selectAll("text").remove();
    d3.select("#b2008").selectAll("text").remove();
    d3.select("#b2009").selectAll("text").remove();
    d3.select("#b2010").selectAll("text").remove();
    d3.select("#b2011").selectAll("text").remove();
    d3.select("#b2012").selectAll("text").remove();
    d3.select("#b2013").selectAll("text").remove();
    d3.select("#b2014").selectAll("text").remove();
    d3.select("#b2015").selectAll("text").remove();
    updatePaperBars()
}

function updatePaperBars() {
    console.log("updatePaperBars");
    d3.select("#pView").on("click", function() {
        selectedPaper = null;
        changeSelection();
    });
    // Draw axis
    var xAxisWidth = 2048;
    var titleBegin = 2170;
    var fontSize = 8;
    var length = 0;
    var year;
    var papers = getPapers(paperData);
    for (year in papers) {
        length++;
    }
    var dWidth = xAxisWidth / (length + 2);
    var dateList = [];
    var dateRange = [];

    dateList.push("");
    dateRange.push(0);
    var i = 1;
    for (year in papers) {
        if (papers.hasOwnProperty(year)) {
            dateList.push(year);
            dateRange.push(dWidth * i);
            i++;
        }
    }
    dateList.push("");
    dateRange.push(dWidth * i);

    var dScale = d3.scale.ordinal()
            .domain(dateList)
            .range(dateRange)
        ;

    var dAxis = d3.svg.axis()
        .scale(dScale)
        .orient("bottom");

    d3.select("#axis").append("g")
        .call(dAxis)
        .attr("transform", function() { return "translate(40,"+titleBegin+")"});

    // TODO: Draw paper titles
    var barId;
    var selection;
    var j = 0;
    for (year in papers) {
            if (papers.hasOwnProperty(year)) {
                (function() {
                    var xOffset = j;
                    barId = "#b" + year;
                    var titleList = [];
                    var paperList = getPapers(paperData)[year];
                    for (var i = 0; i < paperList.length; i++)
                        titleList.push(paperList[i].title);

                    titleList.sort();
                    //console.log(titleList);

                    selection = d3.select(barId)
                        .selectAll("text")
                        .data(titleList);

                    selection.enter().append("text")
                        .text(function (d) {
                            if (d.length < 30) return d;
                            else return d.substring(0,27)+'...';
                        })
                        .attr("font-size", function (d) {
                            if (selectedPaper) {
                                if (d == selectedPaper[0][0].__data__)
                                    return (fontSize+1) + "px";
                                else return fontSize + "px";
                            } else {return fontSize + "px";}
                        })
                        .attr("transform", function (d, i) {
                            return "translate(" + ((xOffset+1)*dWidth+16) + ","
                                + (titleBegin - 0.5 * fontSize - (paperList.length-i) * (fontSize + 1)) + ")"
                        })
                        .attr("fill", function(d) {
                            if (selectedPaper ) {
                                if (d == selectedPaper[0][0].__data__)
                                    return 'black';
                                else return 'lightgrey';
                            } else {return 'black';}
                        })
                        .on("click", function() {
                            selectedPaper = d3.select(this);
                            changeSelection();
                            d3.event.stopPropagation();
                        })
                    ;

                    selection.exit()
                        .attr("opacity", 1)
                        .transition()
                        .duration(2000)
                        .attr("height", 0)
                        .attr("opacity", 0)
                        .remove();
                    j++
                })();
            }

    }
}

/* DATA LOADING */

// This is where execution begins; everything
// above this is just function definitions
// (nothing actually happens)

d3.json("Data/papers.json", function (error, loadedData) {
    if (error) throw error;
    paperData = loadedData;
    updatePaperBars();
});