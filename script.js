/*globals d3, topojson, document*/
// These are helpers for those using JSHint

var paperData,
    selectedYear,
    currentYear,
    selectedPaper,
    references,
    citedBy;

function getCitations() {
    var paperList = paperData[currentYear];
    for (var i = 0; i < paperList.length; i++)
        if (paperList[i].title === selectedPaper[0][0].__data__) {
            references = paperList[i].references;
            citedBy = paperList[i].cited_by;
        }
    //console.log(paperList[i]);
    //console.log(references);
    //console.log(citedBy);
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

    console.log("updatePaperBars");
    d3.select("#pView").on("click", function () {
        selectedPaper = null;
        selectedYear = null;
        changeSelection();
    });
    // Draw axis
    var xAxisWidth = 1024;
    var titleBegin = 370;
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
            return "translate(0," + titleBegin + ")"
        });

    // Draw bounding box
    var yearList = [];
    for (year = 2002; year < 2016; year++) {
        yearList.push(year);
    }
    var yBBox = d3.select("#yearBoundingBox").selectAll("rect").data(yearList);

    yBBox.enter().append("rect")
        .attr("x", function (d, i) {
            return (i + 1) * dWidth - 15;
        })
        .attr("y", 0)
        .attr("width", dWidth - 15)
        .attr("height", 370)
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

    // Draw paper titles
    var barId;
    var selection;
    var j = 0;
    for (year = 2015; year > 2001; year--) {
        if (paperData.hasOwnProperty(year)) {
            (function () {
                var xOffset = 13 - j;
                barId = "#b" + year;
                //var titleList = [];
                var paperList = paperData[year];
                //for (var i = 0; i < paperList.length; i++)
                //    titleList.push(paperList[i].title);
                //
                //titleList.sort();

                selection = d3.select(barId)
                    .selectAll("text")
                    .data(paperList);

                selection.enter().append("text")
                    .text(function (d) {
                        if (d.title.length < 50) return d;
                        else return d.title.substring(0, 47) + '...';
                    })
                    .attr("font-size", function (d) {
                        if (selectedPaper) {
                            if (d.title == selectedPaper[0][0].__data__)
                                return (fontSize + 1) + "px";
                            else return fontSize + "px";
                        } else {
                            return fontSize + "px";
                        }
                    })
                    .attr("transform", function (d, i) {
                        return "translate(" + ((xOffset + 1) * dWidth - 15) + ","
                            + (titleBegin - 0.5 * fontSize - (paperList.length - i) * (fontSize + 0.5)) + ")"
                    })
                    .attr("fill", function (d) {
                        if (selectedPaper) {
                            if (d.title == selectedPaper[0][0].__data__) return 'black';
                            if (references.indexOf(d.id) > -1) return 'red';
                            if (citedBy.indexOf(d.id) > -1) return 'blue';
                            return 'lightgrey';
                        } else {
                            return 'black';
                        }
                    })
                    //.on("click", function() {
                    //    selectedPaper = d3.select(this);
                    //    changeSelection();
                    //    d3.event.stopPropagation();
                    //})
                    .on("mouseover", function () {

                    })
                    .on("mouseout", function () {

                    })
                ;

                selection.transition()
                    .duration(500)
                    .style("fill", function (d) {
                        if (selectedPaper) {
                            if (d.title == selectedPaper[0][0].__data__) return 'black';
                            if (references.indexOf(d.id) > -1) return 'red';
                            if (citedBy.indexOf(d.id) > -1) return 'blue';
                            return 'lightgrey';
                        } else {
                            return 'black';
                        }
                    })
                    .attr("font-size", function (d) {
                        if (selectedPaper) {
                            if (d.title == selectedPaper[0][0].__data__ ||
                                references.indexOf(d.id) > -1 ||
                                citedBy.indexOf(d.id) > -1)
                                return (fontSize + 10) + "px";
                            else return fontSize + "px";
                        } else {
                            return fontSize + "px";
                        }
                    })
                    .attr("transform", function (d, i) {
                        if (selectedPaper) {
                            if (d.title == selectedPaper[0][0].__data__ ||
                                references.indexOf(d.id) > -1 ||
                                citedBy.indexOf(d.id) > -1)
                                return "translate(" + ((xOffset + 1) * dWidth - 15) + ","
                                    + (titleBegin - 0.5 * fontSize - (paperList.length - i) * (fontSize + 0.5)) + ")"
                                    //+ "rotate(-45)"
                                    ;
                            else
                                return "translate(" + ((xOffset + 1) * dWidth - 15) + ","
                                    + (titleBegin - 0.5 * fontSize - (paperList.length - i) * (fontSize + 0.5)) + ")"
                        } else {
                            return "translate(" + ((xOffset + 1) * dWidth - 15) + ","
                                + (titleBegin - 0.5 * fontSize - (paperList.length - i) * (fontSize + 0.5)) + ")"
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

    //console.log(d3.select(".viewport").node().scrollTop);
    var predefine = 0;
    if (currentYear != selectedYear) {
        currentYear = selectedYear;
    } else {
        predefine = d3.select(".viewport").node().scrollTop;
    }

    var titleList = [];
    var paperList = [];
    if (selectedYear) {
        paperList = paperData[selectedYear];
        for (var i = 0; i < paperList.length; i++)
            titleList.push(paperList[i].title);
        titleList.sort();
    }

    d3.select(".viewport").select("svg").remove();

    var scrollSVG = d3.select(".viewport").append("svg")
        .attr("class", "scroll-svg");

    var chartGroup = scrollSVG.append("g")
        .attr("class", "chartGroup");

    chartGroup.append("rect")
        .attr("fill", "black");

    var rowEnter = function (rowSelection) {
        //rowSelection.append("rect")
        //    .attr("rx", 3)
        //    .attr("ry", 3)
        //    .attr("width", "300")
        //    .attr("height", "20")
        //;

        rowSelection.append("text")
            .attr("transform", "translate(0,15)")
            .style("fill", function (d) {
                if (selectedPaper) {
                    if (d == selectedPaper[0][0].__data__)
                        return 'black';
                    else return 'lightgrey';
                } else {
                    return 'black';
                }
            });

    };
    var rowUpdate = function (rowSelection) {
        //rowSelection.select("rect")
        //    .attr("fill", function (d) {
        //        if (selectedPaper) {
        //            if (d == selectedPaper[0][0].__data__)
        //                return "orange";
        //            else return "none";
        //        } else {
        //            return "none";
        //        }
        //    });


        rowSelection.select("text")
            .text(function (d) {return d;})
            .style("fill", function (d) {
                if (selectedPaper) {
                    if (d == selectedPaper[0][0].__data__)
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
        rowSelection.select("text")
            .style("fill", "none")
        ;
    };

    var virtualScroller = d3.VirtualScroller()
        .rowHeight(20)
        .enter(rowEnter)
        .update(rowUpdate)
        .exit(rowExit)
        .svg(scrollSVG)
        .totalRows(paperList.length)
        .viewport(d3.select(".viewport"));

    virtualScroller.data(titleList);

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
    updateYearBar();
    //updatePaperBar();
});
