/*globals d3, topojson, document*/
// These are helpers for those using JSHint

var paperData,
    selectedYear,
    currentYear,
    selectedPaper,
    references,
    citedBy,
    maxPaperCitations,
    maxPaperCitedAndCitations
    ;

/**
 * @param {{cited_by:[]}} data
 */

function getCitedBy(data) {return data.cited_by;}

function getMaxCitations() {
    maxPaperCitations = [];
    maxPaperCitedAndCitations = [];
    for (var year = 2002; year < 2016; year++) {
        if (paperData.hasOwnProperty(year.toString())) {
            (function () {
                var maxCitation = 0;
                var i;
                for (i = 0; i < paperData[year].length; i++)
                    //console.log(paperData[year][i].cited_by.length)
                    maxCitation = Math.max(maxCitation, getCitedBy(paperData[year][i]).length);
                maxPaperCitations.push(maxCitation);

                var maxCitedAndCitation = 0;
                for (i = 0; i < paperData[year].length; i++) {
                    var sum = paperData[year][i].cited_by.length + paperData[year][i].references.length;
                    //console.log(sum);
                    maxCitedAndCitation = Math.max(maxCitedAndCitation, sum);
                }

                maxPaperCitedAndCitations.push(maxCitedAndCitation);
                //console.log(maxCitedAndCitation);
                //console.log(maxCitation);
            })();
        }
    }

    //for (year = 2002; year < 2016; year++) {
    //    console.log(year+" "+maxPaperCitations[year-2002]);
    //}
    //console.log(maxPaperCitations);
    //console.log(maxPaperCitedAndCitations);
}

function getCitations() {
    //console.log(selectedPaper[0][0].__data__);
    //var paperList = paperData[currentYear];
    //for (var i = 0; i < paperList.length; i++)
    //    if (paperList[i].title === selectedPaper[0][0].__data__.title) {
    //        references = paperList[i].references;
    //        citedBy = paperList[i].cited_by;
    //
    //    }
    references = selectedPaper[0][0].__data__.references;
    citedBy = selectedPaper[0][0].__data__.cited_by;
    //console.log(references);
    //console.log(citedBy);
    //console.log(selectedPaper[0][0].__data__.title);
}

function changeSelection() {
    updateYearBar();
    updatePaperBar();
}

function updateYearBar() {
    /* fisheye
     var fisheye = d3.fisheye.circular()
     .radius(200)
     .distortion(20);

     d3.select("#pView")
     .on("mousemove", function() {
     fisheye.focus(d3.mouse(this));
     var titles = d3.selectAll("text")
     .each(function(d) {})
     .attr("transform", function (d) {
     var pos = {
     x:d3.transform(this.getAttribute("transform")).translate[0],
     y:d3.transform(this.getAttribute("transform")).translate[1]
     };
     var feye = fisheye(pos);
     return "translate("+
     pos.x
     +","+pos.y+")"
     +"scale(" + feye.z+","+ feye.z+")"
     ;
     })
     ;
     });
     */

    //sortPapers();

    console.log("updatePaperBars");
    d3.select("#pView").on("click", function () {
        selectedPaper = null;
        selectedYear = null;
        changeSelection();
    });
    // Draw axis
    var xAxisWidth = 1024;
    var titleBegin = 470;
    var fontSize = 1;
    var length = 0;
    var year;
    for (year in paperData) {
        length++;
    }
    var dWidth = xAxisWidth / (length + 2);
    var dateList = [];
    var dateRange = [];

    dateList.push("");
    dateRange.push(0);
    var i = 1;
    for (year in paperData) {
        if (paperData.hasOwnProperty(year)) {
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
        .attr("transform", function () {
            return "translate(-40," + titleBegin + ")"
        });

    // Draw bounding box
    var yearList = [];
    for (year = 2002; year < 2016; year++) {
        yearList.push(year);
    }
    var yBBox = d3.select("#yearBoundingBox").selectAll("rect").data(yearList);

    yBBox.enter().append("rect")
        .attr("x", function (d, i) {
            return (i + 1) * dWidth - 15 - 40;
        })
        .attr("y", 0)
        .attr("width", dWidth - 15)
        .attr("height", titleBegin)
        .attr("fill", "white")
        .on("click", function (d) {
            selectedYear = d;
            d3.event.stopPropagation();
            //changeSelection();
            updatePaperBar();
        })
        .on("mouseover", function () {
            this.setAttribute('stroke', 'seagreen');
        })
        .on("mouseout", function () {
            this.setAttribute('stroke', "none");
        })
    ;

    // Draw dashed line for each year
    var maxHeights = [];
    for (year = 2002; year < 2016; year++) {
        maxHeights.push(titleBegin);
    }

    // Draw paper titles
    var barId;
    var selection;
    var j = 0;
    var highlight_PaperIdx = 0;
    var highlight_PaperTotal = 0;
    if (selectedPaper) {
        highlight_PaperTotal = selectedPaper[0][0].__data__.cited_by.length +
            selectedPaper[0][0].__data__.references.length+1;
    }

    var yWidth = 470/52;
    var yOffset = (titleBegin- yWidth*highlight_PaperTotal)*0.5;

    //console.log(highlight_PaperTotal);

    for (year = 2015; year > 2001; year--) {
        if (paperData.hasOwnProperty(year.toString())) {
            (function () {
                var xOffset = 13 - j;
                barId = "#b" + year;
                var currentData = paperData[year];
                selection = d3.select(barId)
                    .selectAll("text")
                    .data(currentData);

                selection.enter().append("text")
                    .text(function (d) {
                        if (d.title.length < 50) return d;
                        else return d.title.substring(0, 47) + '...';
                    })
                    .attr("font-size", function (d) {
                        if (selectedPaper) {
                            if (d.title == selectedPaper[0][0].__data__.title)
                                return (fontSize + 1) + "px";
                            else return fontSize + "px";
                        } else {
                            return fontSize + "px";
                        }
                    })
                    .attr("transform", function (d, i) {
                        return "translate(" + ((xOffset + 1) * dWidth - 15 - 40) + ","
                            + (titleBegin - 0.5 * fontSize - (currentData.length - i) * (fontSize + 0.5)) + ")"
                    })
                    .attr("fill", function (d) {
                        if (selectedPaper) {
                            if (d.title === selectedPaper[0][0].__data__.title) return 'black';
                            if (references.indexOf(d.id) > -1) return 'red';
                            if (citedBy.indexOf(d.id) > -1) return 'blue';
                            return 'lightgrey';
                        } else {
                            return 'black';
                        }
                    })
                    .on("click", function(d) {
                        if (selectedPaper) {
                            if (d.title == selectedPaper[0][0].__data__.title ||
                                references.indexOf(d.id) > -1 ||
                                citedBy.indexOf(d.id) > -1) {
                                selectedPaper = d3.select(this);
                                getCitations();
                                changeSelection();
                            }
                            d3.event.stopPropagation();
                        } else
                            d3.event.stopPropagation();
                    })
                    .on("mouseover", function () {

                    })
                    .on("mouseout", function () {

                    })
                ;

                selection.transition()
                    .duration(500)
                    .style("fill", function (d) {
                        if (selectedPaper) {
                            if (d.title === selectedPaper[0][0].__data__.title) return 'black';
                            if (references.indexOf(d.id) > -1) return 'red';
                            if (citedBy.indexOf(d.id) > -1) return 'blue';
                            return 'none';
                        } else {
                            return 'black';
                        }
                    })
                    .attr("font-size", function (d) {
                        if (selectedPaper) {
                            if (d.title == selectedPaper[0][0].__data__.title ||
                                references.indexOf(d.id) > -1 ||
                                citedBy.indexOf(d.id) > -1)
                                return (fontSize + 8) + "px";
                            else return fontSize + "px";
                        } else {
                            return fontSize + "px";
                        }
                    })
                    .attr("transform", function (d, i) {
                        if (selectedPaper) {
                            if (d.title == selectedPaper[0][0].__data__.title ||
                                references.indexOf(d.id) > -1 ||
                                citedBy.indexOf(d.id) > -1) {
                                highlight_PaperIdx = highlight_PaperIdx + 1;
                                maxHeights[d.year-2002] = Math.min(maxHeights[d.year-2002],
                                    (titleBegin - ((highlight_PaperIdx-1) * yWidth + yOffset) - 5));

                                return "translate(" + ((xOffset + 1) * dWidth - 15 - 40) + ","
                                    + (titleBegin - ((highlight_PaperIdx-1) * yWidth + yOffset)  + ")"
                                    //+ "rotate(-45)")
                                    );
                                //return "translate(" + ((xOffset + 1) * dWidth - 15) + ","
                                //    + (titleBegin - 0.5 * fontSize - (paperList.length - i) * (fontSize + 0.5)) + ")"
                                //+ "rotate(-45)"
                                //;
                            } else
                                return "translate(" + ((xOffset + 1) * dWidth - 15 - 40) + ","
                                    + (titleBegin - 0.5 * fontSize - (currentData.length - i) * (fontSize + 0.5)) + ")"
                        } else {
                            return "translate(" + ((xOffset + 1) * dWidth - 15 - 40) + ","
                                + (titleBegin - 0.5 * fontSize - (currentData.length - i) * (fontSize + 0.5)) + ")"
                        }
                    })
                    .text(function (d) {
                        return d.title;
                    })
                ;

                selection.exit()
                    .attr("opacity", 1)
                    .transition()
                    .duration(2000)
                    .attr("height", 0)
                    .attr("opacity", 0)
                    .remove()
                ;
                j++
            })();
        }
    }

    // Draw dashed line for each year
    //console.log(maxHeights);
    var dashedLines = d3.select("#yearDashedLine").selectAll("line").data(maxHeights);

    dashedLines.enter().append("line")
        .attr("x1", function (d,i) { return (i + 1) * dWidth - 15 - 40;})
        .attr("y1", titleBegin)
        .attr("x2", function (d,i) { return (i + 1) * dWidth - 15 - 40;})
        .attr("y2", function (d) { return d;})
        .attr("stroke-width", 1)
        .attr("stroke", "black")
        .style("stroke-dasharray", ("3, 2"))
    ;

    dashedLines.transition()
        .duration(500)
        .attr("x1", function (d,i) { return (i + 1) * dWidth - 15 - 40;})
        .attr("y1", titleBegin)
        .attr("x2", function (d,i) { return (i + 1) * dWidth - 15 - 40;})
        .attr("y2", function (d) { return d;})
    ;
}

function updatePaperBar() {
    // draw one year papers


    /*
    length = getPapers(paperData)[2014].length/2;
    dWidth = (xAxisWidth)/length;
    var titleList = [];
    var paperList = getPapers(paperData)[2014];
    for (i = 0; i < paperList.length/2; i++)
        titleList.push(paperList[i].title);
    titleList.sort();
    var svg_paperList = d3.select("#oneYearPaperList").selectAll("text").data(titleList);

    svg_paperList.enter().append("text")
            .text(function (d) {return d;})
            .attr("font-size", "11px")
            .attr("transform", function (d, i) {
                return "translate(" + (xAxisWidth-40) + ","
                    + i*11 + ")"
            })
        ;
    */

    var citationScale = d3.scale.linear()
        .domain([0, maxPaperCitations[selectedYear-2002]])
        .range([0, 200]);

    //console.log(d3.select(".viewport").node().scrollTop);
    var predefine = 0;
    if (currentYear != selectedYear) {
        currentYear = selectedYear;
    } else {
        predefine = d3.select(".viewport").node().scrollTop;
    }

    //var titleList = [];
    //var paperList = [];
    //if (selectedYear) {
    //    paperList = paperData[selectedYear];
    //    for (var i = 0; i < paperList.length; i++)
    //        titleList.push(paperList[i].title);
    //    titleList.sort();
    //}

    d3.select(".viewport").select("svg").remove();

    var scrollSVG = d3.select(".viewport").append("svg")
        .attr("class", "scroll-svg");

    var chartGroup = scrollSVG.append("g")
        .attr("class", "chartGroup");

    chartGroup.append("rect")
        .attr("fill", "black");

    var rowEnter = function (rowSelection) {
        rowSelection.append("rect")
            .attr("y", 15)
            //.attr("width", "300")
            .attr("width", function(d){return citationScale(d.cited_by.length)})
            .attr("height", "3")
            .attr("fill", "orange")
        ;

        rowSelection.append("text")
            .attr("transform", "translate(0,15)")
            .style("fill", function (d) {
                if (selectedPaper) {
                    if (d.title == selectedPaper[0][0].__data__.title)
                        return 'black';
                    else return 'lightgrey';
                } else {
                    return 'black';
                }
            });

    };
    var rowUpdate = function (rowSelection) {
        rowSelection.select("rect")
            .attr("width", function(d){
                //console.log(d.cited_by.length);
                return citationScale(d.cited_by.length);
            })
            .attr("fill", function (d) {
                if (selectedPaper) {
                    if (d.title == selectedPaper[0][0].__data__.title)
                        return "orange";
                    else return "lightgrey";
                } else {
                    return "orange";
                }
            });


        rowSelection.select("text")
            .text(function (d) {return d.title;})
            .style("fill", function (d) {
                if (selectedPaper) {
                    if (d.title == selectedPaper[0][0].__data__.title)
                        return 'black';
                    else return 'lightgrey';
                } else {
                    return 'black';
                }
            })
            .on("click", function () {
                selectedPaper = d3.select(this);
                getCitations();
                changeSelection();
            });
    };

    var rowExit = function (rowSelection) {
        rowSelection.select("text").style("fill", "none");
    };

    var totalRows = function() {
        if (selectedYear != null)
            return (paperData[selectedYear].length);
        else
            return 50;
    };

    var sideData = function() {
        if (selectedYear != null)
            return paperData[selectedYear];
        else
            return [];
    };

    var virtualScroller = d3.VirtualScroller()
        .rowHeight(20)
        .enter(rowEnter)
        .update(rowUpdate)
        .exit(rowExit)
        .svg(scrollSVG)
        .totalRows(totalRows())
        .viewport(d3.select(".viewport"));

    virtualScroller.data(sideData());

    chartGroup.call(virtualScroller);
    d3.select(".viewport").node().scrollTop = predefine;
    chartGroup.call(virtualScroller);
}

/* DATA LOADING */

// This is where execution begins; everything
// above this is just function definitions
// (nothing actually happens)

d3.json("Data/all_papers.json", function (error, loadedData) {
    if (error) throw error;
    paperData = loadedData;
    getMaxCitations();
    updateYearBar();
    //updatePaperBar();
});

function sortByTitle() {
    function compareTitle(a,b) {
        if (a.title < b.title)
            return -1;
        if (a.title > b.title)
            return 1;
        return 0;
    }

    for (var year = 2015; year > 2001; year--) {
        paperData[year].sort(compareTitle);
        //paperData[year].sort(compareCitation);
    }

    selectedPaper = null;
    //selectedYear = null;

    changeSelection();
}

function sortByCitation() {
    function compareCitation(a,b) {
        if (a.cited_by.length > b.cited_by.length)
            return -1;
        if (a.cited_by.length < b.cited_by.length)
            return 1;
        return 0;
    }

    for (var year = 2015; year > 2001; year--) {
        //paperData[year].sort(compareTitle);
        paperData[year].sort(compareCitation);
    }

    selectedPaper = null;
    //selectedYear = null;

    changeSelection();
}
