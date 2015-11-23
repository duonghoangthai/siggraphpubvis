/*globals d3, topojson, document*/
// These are helpers for those using JSHint

var paperData,
    selectedPaper,
    references,
    citedBy,
    maxPaperCitationOnSelected,
    maxPaperCitation,
    maxPaperCitations,
    maxPaperCitedAndCitations,
    searchTarget,
    searchResult,
    svgGroup,
    fontSize = 2,
    titleBegin = 470,
    dWidth,
    show_Citation = -1,
    referencePaperPos = [],
    selectedPaperPos,
    citedPaperPos
;

/**
 * @param {{cited_by:[]}} data
 */
function getCitedBy(data) {return data.cited_by;}
/**
 * @param {{cited_count:[]}} data
 */
function getCitedCount(data) {return data.cited_count;}
/**
 * @param {{references:[]}} data
 */
function getReferences(data) {return data.references;}
/**
 * @param {{authors:[]}} data
 */
function getAuthors(data) {return data.authors;}

function getMaxCitations() {
    maxPaperCitations = [];
    maxPaperCitedAndCitations = [];
    maxPaperCitation = 0;
    for (var year = 2002; year < 2016; year++) {
        if (paperData.hasOwnProperty(year.toString())) {
            (function () {
                var maxCitation = 0;
                var i;
                for (i = 0; i < paperData[year].length; i++)
                    maxCitation = Math.max(maxCitation, getCitedCount(paperData[year][i]));

                maxPaperCitations.push(maxCitation);
                maxPaperCitation = Math.max(maxPaperCitation, maxCitation);

                var maxCitedAndCitation = 0;
                for (i = 0; i < paperData[year].length; i++) {
                    var sum = paperData[year][i].cited_by.length + getReferences(paperData[year][i]).length;
                    maxCitedAndCitation = Math.max(maxCitedAndCitation, sum);
                }

                maxPaperCitedAndCitations.push(maxCitedAndCitation);
            })();
        }
    }
}

// get cite_by and references from selected papaer to global variables
function getCitations() {
    references = selectedPaper.references;
    citedBy = getCitedBy(selectedPaper);
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

    //function zoom() {
    //    svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    //}

    console.log("updatePaperBars");

    //sortSelectedYear();

    // Draw axis
    var xAxisWidth = 1240;
    var length = 0;

    function zoom() {
        console.log("zoom");
        svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    var zoomListener = d3.behavior.zoom().scaleExtent([1, 5]).on("zoom", zoom);

    var baseSvg = d3.select("#pView").append("svg")
        .attr("width", xAxisWidth)
        .attr("height", titleBegin+50)
        //.attr("fill", "white")
        .attr("class", "overlay")
        //.on("click", function() {
        //
        //    //d3.event.stopPropagation();
        //})
        .call(zoomListener);



    svgGroup = baseSvg.append("g");

    var div =  d3.select("#pView").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var year;
    for (year in paperData) {
        length++;
    }
    dWidth = xAxisWidth / (length + 1);
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
    dateRange.push(dWidth * (i+1));

    var dScale = d3.scale.ordinal()
            .domain(dateList)
            .range(dateRange)
        ;

    var dAxis = d3.svg.axis()
            .scale(dScale)
            .orient("bottom")
            .outerTickSize(0)
        ;

    svgGroup.append("g")
        .attr("class", "axis")
        .call(dAxis)
        .attr("transform", function () {
            return "translate(-45," + titleBegin + ")"
        });

    // Draw dashed line for each year
    var maxHeights = [];
    for (year = 2002; year < 2016; year++) {
        maxHeights.push(titleBegin);
    }

    // Draw paper titles
    //var barId, rectId;
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

    var citationScale;

    //console.log(highlight_PaperTotal);

    for (year = 2015; year > 2001; year--) {
        if (paperData.hasOwnProperty(year.toString())) {
            (function () {
                citationScale = d3.scale.linear()
                    .domain([0, maxPaperCitations[year-2002]])
                    .range([0, dWidth - 10]);

                var xOffset = 13 - j;
                var barId = "b" + year;
                var rectId = "r" + year;
                var currentData = paperData[year];
                selection = svgGroup.append("g")
                    .attr("id", function () {
                        return rectId;
                    })
                    .selectAll("rect")
                    .data(currentData);

                selection.enter().append("rect")
                    .attr("x", 0)
                    .attr("y", 0)
                    .attr("width", function(){return 0;})
                    .attr("height", fontSize)
                    .attr("transform", function (d, i) {
                        return "translate(" + ((xOffset + 1) * dWidth - 15 - 30) + ","
                            + (titleBegin - 1.5 * fontSize + 0.15 - (currentData.length - i) * (fontSize + 0.5)) + ")"
                    })
                    .attr("fill", "orange");

                selection = svgGroup.append("g")
                    .attr("id", function () {
                        return barId;
                    })
                    .selectAll("text")
                    .data(currentData);

                selection.enter().append("text")
                    .attr("style", "cursor: pointer")
                    .text(function (d) {
                        if (d.title.length < 50) return d;
                        else return d.title.substring(0, 47) + '...';
                    })
                    .style("font-weight", "normal")
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
                        return "translate(" + ((xOffset + 1) * dWidth - 15 - 30) + ","
                            + (titleBegin - 0.5 * fontSize - (currentData.length - i) * (fontSize + 0.5)) + ")"
                    })
                    .attr("fill", function (d) {
                        if (selectedPaper) {
                            if (d.title === selectedPaper[0][0].__data__.title) return 'Black';
                            if (references.indexOf(d.id) > -1) return 'Red';
                            if (citedBy.indexOf(d.id) > -1) return 'Blue';
                            return 'LightGrey';
                        } else {
                            return 'Black';
                        }
                    })
                    .on("click", function() {
                        // clear searchResult
                        searchResult = null;

                        // put new selected paper
                        selectedPaper = d3.select(this)[0][0].__data__;
                        getCitations();
                        updateText();

                        updatePaperDetails();

                        d3.event.stopPropagation();
                    })
                    .on("mouseover", function(d) {

                        div.transition()
                            .duration(200)
                            .style("opacity", .7);

                        var span10 = "<span style=\"padding-left:10px\"></span>";

                        var authorsList = "";
                        for (var i = 0; i < getAuthors(d).length; i++) {
                            authorsList += d.authors[i] + span10;
                            if ((i+1)%3 == 0)
                                authorsList += '<br/>';
                        }

                        var colorText;
                        if (searchResult) {
                            if (d.isTarget) colorText ='Black';
                            else colorText = 'DarkGrey';
                        } else if (selectedPaper) {
                            if (d.title === selectedPaper.title) colorText = 'Black';
                            else if (citedBy.indexOf(d.id) > -1) colorText = 'ForestGreen';
                            else if (references.indexOf(d.id) > -1) colorText = 'DodgerBlue';
                            else colorText =  'DarkGrey';
                        } else {
                            colorText = 'Black'
                        }

                        div	.html( "<p style=\"color:" + colorText + "\">" + (d.title) +
                            "<\p> <p style=\"font-size:8px; color:" + colorText + "\">" +authorsList + "<\p>")
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px")
                            .style("background", 'LightGrey')
                        ;

                        console.log(div);
                    })
                    .on("mouseout", function() {
                        div.transition()
                            .duration(500)
                            .style("opacity", 0);
                    })
                ;

                selection.transition()
                    .duration(500)
                    .style("fill", function (d) {
                        if (selectedPaper) {
                            if (d.title === selectedPaper[0][0].__data__.title) return 'Black';
                            if (references.indexOf(d.id) > -1) return 'OrangeRed';
                            if (citedBy.indexOf(d.id) > -1) return 'DarkGreen';
                            return 'none';
                        } else {
                            return 'Black';
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

                                return "translate(" + ((xOffset + 1) * dWidth - 15 - 30) + ","
                                    + (titleBegin - ((highlight_PaperIdx-1) * yWidth + yOffset)  + ")"
                                    );
                            } else
                                return "translate(" + ((xOffset + 1) * dWidth - 15 - 30) + ","
                                    + (titleBegin - 0.5 * fontSize - (currentData.length - i) * (fontSize + 0.5)) + ")"
                        } else {
                            return "translate(" + ((xOffset + 1) * dWidth - 15 - 30) + ","
                                + (titleBegin - 0.5 * fontSize - (currentData.length - i) * (fontSize + 0.5)) + ")"
                        }
                    })
                    .text(function (d) {
                        if (d.title.length < 75) return d.title;
                        else return d.title.substring(0, 72) + '...';
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

/* DATA LOADING */

// This is where execution begins; everything
// above this is just function definitions
// (nothing actually happens)

d3.json("Data/all_papers_cited_count.json", function (error, loadedData) {
    if (error) throw error;
    paperData = loadedData;
    getMaxCitations();

    updateYearBar();
    updatePaperDetails();

    d3.select("#citationCheckbox").on("change", showCitation);
});

function updateText() {
    referencePaperPos = [];
    citedPaperPos = [];
    var j = 0;
    var obj;
    //var citationScale;
    for (var year = 2015; year > 2001; year--) {
        if (paperData.hasOwnProperty(year.toString())) {
            (function () {
                var xOffset = 13 - j;

                //if (searchResult) {
                //    citationScale = d3.scale.linear()
                //        .domain([0, maxPaperCitationOnSelected])
                //        .range([0, dWidth - 10]);
                //} else {
                    var citationScale = d3.scale.linear()
                        .domain([0, maxPaperCitations[year - 2002]])
                        .range([0, dWidth - 10]);
                //}

                var barId = "#b" + year;
                var currentData = paperData[year];
                svgGroup.select(barId)
                    .selectAll("text")
                    .data(currentData)
                    .transition()
                    .duration(500)
                    .style("fill", function (d) {
                        if (searchResult) {
                            if (d.isTarget) return 'black';
                            else return 'lightgrey'
                        }

                        if (selectedPaper) {
                            if (d.title === selectedPaper.title) return 'Black';
                            if (citedBy.indexOf(d.id) > -1) return 'ForestGreen';
                            if (references.indexOf(d.id) > -1) return 'DodgerBlue';
                            return 'LightGrey';
                        } else {
                            return 'Black';
                        }
                    })
                    .text(function (d) {
                        if (d.title.length < 75) return d.title;
                        else return d.title.substring(0, 72) + '...';
                    })
                    .attr("transform", function (d, i) {
                        var x = (xOffset + 1) * dWidth - 15 - 30;
                        var y = titleBegin-0.5*fontSize - (currentData.length-i)*(fontSize+0.5);
                        if (selectedPaper) {
                            if (d.title == selectedPaper.title) {
                                selectedPaperPos = {x: x, y: y-fontSize*0.3};
                            } else
                            if (citedBy.indexOf(d.id) > -1) {
                                obj = {x: x, y: y-fontSize*0.3};
                                referencePaperPos.push(obj);
                            } else
                            if (references.indexOf(d.id) > -1) {
                                var l = d.title.length;
                                obj = {x: x, y: y-fontSize*0.3, l: l};
                                citedPaperPos.push(obj);
                            }
                        }
                        return "translate(" + x + "," + y + ")";
                    })
                    ;
                var rectId = "#r" + year;
                svgGroup.select(rectId)
                    .selectAll("rect")
                    .data(currentData)
                    .transition()
                    .duration(500)
                    .attr("width", function(d){
                        if (show_Citation == 1) {
                            if (selectedPaper) {
                                if (references.indexOf(d.id) > -1 ||
                                    citedBy.indexOf(d.id) > -1)
                                    return citationScale(d.cited_count);
                                else return 0;
                            } else if (searchResult) {
                                if (d['isTarget'])
                                    return citationScale(d.cited_count);
                                else
                                    return 0;
                            } else
                                return citationScale(d.cited_count);
                        }
                        else
                            return 0;
                    })
                ;
                j++;
            })();
        }
    }
    //console.log(selectedPaperPos);
    //console.log(referencePaperPos);

    // draw link
    svgGroup.selectAll('.link').remove();

    var i, tmpList, lineGeneratorBasis;
    for (i = 0; i < referencePaperPos.length; i++) {
        tmpList = [];
        tmpList.push({x:(selectedPaperPos.x+Math.min(75,selectedPaper.title.length)), y:selectedPaperPos.y});
        tmpList.push({x:(selectedPaperPos.x+Math.min(75,selectedPaper.title.length)+10), y:selectedPaperPos.y});
        tmpList.push({x:(referencePaperPos[i].x-10), y:referencePaperPos[i].y});
        tmpList.push(referencePaperPos[i]);

        lineGeneratorBasis = d3.svg.line()
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; })
            .interpolate('basis');

        svgGroup.append('path')
            .attr("class", "link")
            .style("fill", "none")
            .style("stroke", "black")
            .style("stroke-width", 0.5)
            .style("stroke-opacity", 0.3)
            .attr('d', lineGeneratorBasis(tmpList));
    }

    for (i = 0; i < citedPaperPos.length; i++) {
        tmpList = [];
        tmpList.push({x:(citedPaperPos[i].x+Math.min(75,citedPaperPos[i].l)), y:citedPaperPos[i].y});
        tmpList.push({x:(citedPaperPos[i].x+Math.min(75,citedPaperPos[i].l)+10), y:citedPaperPos[i].y});
        tmpList.push({x:(selectedPaperPos.x-10), y:selectedPaperPos.y});
        tmpList.push(selectedPaperPos);

        lineGeneratorBasis = d3.svg.line()
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; })
            .interpolate('basis');

        svgGroup.append('path')
            .attr("class", "link")
            .style("fill", "none")
            .style("stroke", "black")
            .style("stroke-width", 0.5)
            .style("stroke-opacity", 0.3)
            .attr('d', lineGeneratorBasis(tmpList));
    }

}

// click button "sortByTitle"
function sortByTitle() {
    function compareTitle(a,b) {
        if (a.title < b.title)
            return -1;
        if (a.title > b.title)
            return 1;
        return 0;
    }

    for (var year = 2015; year > 2001; year--)
        paperData[year].sort(compareTitle);

    selectedPaper = null;

    updateText();
}

// click button "sortByCitation"
function sortByCitation() {
    function compareCitation(a,b) {
        if (a.cited_count > b.cited_count)
            return -1;
        if (a.cited_count < b.cited_count)
            return 1;
        return 0;
    }

    for (var year = 2015; year > 2001; year--)
        paperData[year].sort(compareCitation);

    selectedPaper = null;

    updateText();
}

// click button "search"
function searchTitle() {
    selectedPaper = null;
    references = [];
    citedBy = [];
    searchResult = [];
    maxPaperCitationOnSelected = 0;
    var target = new RegExp(searchTarget, "i");
    for (var year = 2002; year < 2016; year++) {
        if (paperData.hasOwnProperty(year.toString())) {
            (function () {
                var i;
                for (i = 0; i < paperData[year].length; i++)
                    if(paperData[year][i].title.match(target)) {
                        searchResult.push(paperData[year][i]);
                        maxPaperCitationOnSelected = Math.max(getCitedCount(paperData[year][i]), maxPaperCitationOnSelected);
                        paperData[year][i]['isTarget'] = true;
                    } else {
                        paperData[year][i]['isTarget'] = false;
                    }
            })();
        }
    }
    //console.log(searchTarget);
    //console.log(searchResult.length);
    //for(var i = 0; i < searchResult.length; i++)
    //    console.log(searchResult[i].title);

    // cannot find matching paper
    if (searchResult.length == 0)
        searchResult = null;

    /// only on matching paper, set it as selected paper
    else if (searchResult.length == 1) {
        selectedPaper = searchResult[0];
        getCitations();
        searchResult = null;
    }

    updateText();

    //console.log(maxPaperCitationOnSelected);
}

function showCitation() {
    show_Citation = -show_Citation;
    updateText();
}

d3.select("#searchInput").on("input", function() {
    searchTarget = this.value;
});

function clearSelectedPaper() {
    selectedPaper = null;
    searchResult = null;
    references = [];
    citedBy = [];
    updateText();
}

function updatePaperDetails() {

    d3.select("#pDetails").selectAll("div").remove();

    var sampleAbstract = "Despite the visual importance of hair and the attention paid to hair modeling in the graphics research, modeling realistic hair still remains a very challenging task that can be performed by very few artists. In this paper we present hair meshes, a new method for modeling hair that aims to bring hair modeling as close as possible to modeling polygonal surfaces. This new approach provides artists with direct control of the overall shape of the hair, giving them the ability to model the exact hair shape they desire. We use the hair mesh structure for modeling the hair volume with topological constraints that allow us to automatically and uniquely trace the path of individual hair strands through this volume. We also define a set of topological operations for creating hair meshes that maintain these constraints. Furthermore, we provide a method for hiding the volumetric structure of the hair mesh from the end user, thus allowing artists to concentrate on manipulating the outer surface of the hair as a polygonal surface. We explain and show examples of how hair meshes can be used to generate individual hair strands for a wide variety of realistic hair styles."

    var div =  d3.select("#pDetails").append("div");
    var span20 = "<span style=\"padding-left:20px\"></span>";
    if (selectedPaper) {
        var authorsList = selectedPaper.authors[0];
        for (var i = 1; i < getAuthors(selectedPaper).length; i++)
            authorsList += ( span20 + selectedPaper.authors[i]);

        div.html(
            "<h1>" + (selectedPaper.title) + "</h1>" +
            "<p>" + (authorsList) + "</p>" +
            "<h3> Abstract </h3>" +
            "<p  align=\"left\">" + (sampleAbstract) + "</p>" +
            "<p  align=\"left\">" + "Keywords:" + "</p>" +
            "<p  align=\"left\">" + "Year: "+ selectedPaper.year + span20 + "Cited by " + selectedPaper.cited_count + "</p>" +
            "<p  align=\"left\">" + "External Link: " +
            "<a href=\"" + selectedPaper.link + "\">" + selectedPaper.link + "</a></p>"
        );
    } else {
        div.html("<h1>" + "No paper selected" + "</h1>");
    }
}