/*globals d3, topojson, document*/
// These are helpers for those using JSHint

var abstractData,
    paperData,
    selectedPaper,
    references,
    citedBy,
    maxPaperCitationOnSelected,
    maxPaperCitation,
    maxPaperCitations,
    maxPaperCitedAndCitations,
    searchTitleTarget,
    searchResult,
    searchAuthorTarget,
    svgGroup,
    fontSize = 2,
    titleBegin = 470,
    subTitleBegin = 100,
    dWidth,
    show_Citation = -1,
    referencePaperPos = [],
    selectedPaperPos,
    citedPaperPos,
    forceGraphMapping,
    connected,
    force,
    aViewBaseSvg,
    keywordData,
    keywords,
    keywordEdges,
    keywordStringList,
    keywordVis,
    aViewDiv
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
/**
 * @param {{abstract:[]}} data
 */
function getAbstract(data) {return data.abstract;}

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

    var zoomListener = d3.behavior.zoom()
        .center([xAxisWidth / 2, (titleBegin+50) / 2])
        .scaleExtent([1, 5]).on("zoom", zoom);

    function zoom() {
        svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

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

    function coordinates(point) {
        var scale = zoomListener.scale(), translate = zoomListener.translate();
        return [(point[0] - translate[0]) / scale, (point[1] - translate[1]) / scale];
    }

    function point(coordinates) {
        var scale = zoomListener.scale(), translate = zoomListener.translate();
        return [coordinates[0] * scale + translate[0], coordinates[1] * scale + translate[1]];
    }

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
                        if (d.title.length < 50) return d.title;
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
                        updateSubPaperView();
                        updateAuthorsView();
                        updateAuthorTitle();
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

                        //console.log(div);
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
                            if (d.title === selectedPaper.title) return 'Black';
                            if (references.indexOf(d.id) > -1) return 'OrangeRed';
                            if (citedBy.indexOf(d.id) > -1) return 'DarkGreen';
                            return 'none';
                        } else {
                            return 'Black';
                        }
                    })
                    .attr("font-size", function (d) {
                        if (selectedPaper) {
                            if (d.title == selectedPaper.title ||
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
                            if (d.title == selectedPaper.title ||
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

    function zoomIn() {
        baseSvg.call(zoomListener.event); // https://github.com/mbostock/d3/issues/2387

        // Record the coordinates (in data space) of the center (in screen space).
        var center0 = zoomListener.center(),
            translate0 = zoomListener.translate(),
            coordinates0 = coordinates(center0);
        zoomListener.scale(
            Math.min(5, zoomListener.scale() * 2)
        );

        // Translate back to the center.
        var center1 = point(coordinates0);
        zoomListener.translate([translate0[0] + center0[0] - center1[0], translate0[1] + center0[1] - center1[1]]);

        baseSvg.transition().duration(750).call(zoomListener.event);
    }

    function zoomOut() {
        baseSvg.call(zoomListener.event); // https://github.com/mbostock/d3/issues/2387

        // Record the coordinates (in data space) of the center (in screen space).
        var center0 = zoomListener.center(),
            translate0 = zoomListener.translate(),
            coordinates0 = coordinates(center0);
        zoomListener.scale(
            Math.max(1, zoomListener.scale() * 0.5)
        );

        // Translate back to the center.
        var center1 = point(coordinates0);
        zoomListener.translate([translate0[0] + center0[0] - center1[0], translate0[1] + center0[1] - center1[1]]);

        baseSvg.transition().duration(750).call(zoomListener.event);
    }

    baseSvg.append("rect")
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("x", 10)
        .attr("y", 10)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", "white")
        .attr("style", "cursor: pointer")
        .style("stroke", "grey")
        .style("stroke-width", 1)
        .on('click', zoomIn)
    ;

    baseSvg.append("rect")
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("x", 10)
        .attr("y", 32)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", "white")
        .attr("style", "cursor: pointer")
        .style("stroke", "grey")
        .style("stroke-width", 1)
        .on('click', zoomOut)
    ;

    baseSvg.append("text")
        .attr("x", 16)
        .attr("y", 25)
        .attr("style", "cursor: pointer")
        .text("+")
        .on('click', zoomIn)
    ;

    baseSvg.append("text")
        .attr("x", 18)
        .attr("y", 47)
        .attr("style", "cursor: pointer")
        .text("-")
        .on('click', zoomOut)
    ;
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
    createAuthorsView();
    updateAuthorTitle();

    d3.select("#citationCheckbox").on("change", showCitation);
});

d3.json("Data/all_papers_abs.json", function (error, loadedData) {
    if (error) throw error;
    abstractData = loadedData;
});

d3.json("Data/paper_keywords.json", function (error, loadedData) {
    if (error) throw error;
    keywordData = loadedData;
});

// Load the keywords
(function loadKeywords() {
    queue().defer(d3.json, 'Data/keyword_graph.json').await(keywordsLoaded);
})();
function keywordsLoaded(error, data) {
    if (error) throw error;
    keywordVis = new KeywordVis(data);
    keywords = keywordVis.keywordGraph.vertices;
    keywordEdges = keywordVis.keywordGraph.edges;
    //console.log(keywordVis.keywordGraph.vertices);
}

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
                            if (d.isTarget) return 'Black';
                            else return 'LightGrey'
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
    var target = new RegExp(searchTitleTarget, "i");
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
        searchResult = null;

        getCitations();
        updatePaperDetails();
        updateSubPaperView();
        updateAuthorsView();
        updateAuthorTitle();
    }

    updateText();

    //console.log(maxPaperCitationOnSelected);
}

// click button "search"
function searchAuthor() {
    console.log("search "+searchAuthorTarget);
    selectedPaper = null;
    references = [];
    citedBy = [];
    searchResult = [];
    maxPaperCitationOnSelected = 0;
    var target = new RegExp(searchAuthorTarget, "i");
    for (var year = 2002; year < 2016; year++) {
        if (paperData.hasOwnProperty(year.toString())) {
            (function () {
                var i, j;
                for (i = 0; i < paperData[year].length; i++) {
                    var found = false;
                    for (j = 0; j < paperData[year][i].authors.length; j++) {
                        if (paperData[year][i].authors[j].match(target)) {
                            found = true;
                        }
                    }

                    if (found) {
                        searchResult.push(paperData[year][i]);
                        maxPaperCitationOnSelected = Math.max(getCitedCount(paperData[year][i]), maxPaperCitationOnSelected);
                        paperData[year][i]['isTarget'] = true;
                    } else {
                        paperData[year][i]['isTarget'] = false;
                    }
                }
            })();
        }
    }

    // cannot find matching paper
    if (searchResult.length == 0)
        searchResult = null;

    // only on matching paper, set it as selected paper
    else if (searchResult.length == 1) {
        selectedPaper = searchResult[0];
        searchResult = null;

        getCitations();
        updatePaperDetails();
        updateSubPaperView();
        updateAuthorsView();
        updateAuthorTitle();
    }

    updateText();
}

function showCitation() {
    show_Citation = -show_Citation;
    updateText();
}

d3.select("#searchTitle").on("input", function() {
    searchTitleTarget = this.value;
});

d3.select("#searchAuthor").on("input", function() {
    searchAuthorTarget = this.value;
});

function clearSelectedPaper() {
    selectedPaper = null;
    searchResult = null;
    references = [];
    citedBy = [];
    updateText();
}

function clickKeyword(i) {
    //console.log(i);
    var index = selected_keywords.indexOf(i);
    //console.log(keywords[i].text);
    if (index === -1) { // click on new keyword
        selected_keywords.push(i);
        neighbor_keywords = neighbor_keywords.concat(keywordEdges[i].neighbors);
    } else { // click on an already selected keyword
        selected_keywords.splice(index, 1);
        var neighbor_index = find_subarray(neighbor_keywords, keywordEdges[i].neighbors, 0);
        if (neighbor_index >= 0) {
            neighbor_keywords.splice(neighbor_index, keywordEdges[i].neighbors.length);
        }
    }
    updateByKeywords();
    keywordVis.update();
}

function updatePaperDetails() {

    d3.select("#pDetails").selectAll("div").remove();

    var i;
    var div =  d3.select("#pDetails").append("div");
    var span20 = "<span style=\"padding-left:20px\"></span>";
    if (selectedPaper) {
        var abstract = getAbstract(abstractData[selectedPaper.id]);

        var authorsList = selectedPaper.authors[0];
        for (i = 1; i < getAuthors(selectedPaper).length; i++)
            authorsList += ( span20 + selectedPaper.authors[i]);

        var tmp;
        keywordStringList = [];
        for (i = 0; i < keywordData[selectedPaper.id].keywords.length; i++) {
            tmp = {"text":keywords[keywordData[selectedPaper.id].keywords[i]].text,
            "id":keywordData[selectedPaper.id].keywords[i]};
            keywordStringList.push(tmp);
        }
        keywordStringList.sort(function(a, b){
            if (a.text < b.text )
                return -1;
            if (a.text > b.text )
                return 1;
            return 0;
        });

        //console.log(keywordStringList);

        //for (i = 0; i < keywordStringList.length; i++)
        //    console.log(keywordStringList[i].text, keywordIdList[i].id);

        var keywordsList = "<a href=\"#keywordView\" onclick=\"clickKeyword(keywordStringList[0].id)\">" + keywordStringList[0].text +"</a>";
        for (i = 1; i < keywordStringList.length; i++)
            keywordsList += ', ' + "<a href=\"#keywordView\" onclick=\"clickKeyword(keywordStringList["+i+"].id)\">" +keywordStringList[i].text+"</a>";

        div.html(
            "<h1>" + (selectedPaper.title) + "</h1>" +
            "<p>" + (authorsList) + "</p>" +
            "<h3> Abstract </h3>" +
            "<p  align=\"left\">" + (abstract) + "</p>" +
            "<p  align=\"left\">" + "Keywords: " +
              keywordsList + "</p>" +
            "<p  align=\"left\">" + "Year: "+ selectedPaper.year + span20 + "Cited by " + selectedPaper.cited_count + "</p>" +
            "<p  align=\"left\">" + "External Link: " +
            "<a href=\"" + selectedPaper.link + "\">" + selectedPaper.link + "</a></p>"
        );
    } else {
        div.html("<h1>" + "No paper selected" + "</h1>");
    }
}

function updateAuthorTitle() {

    d3.select("#authorViewTitle").selectAll("div").remove();

    var div =  d3.select("#authorViewTitle").append("div");
    if (selectedPaper) {
        div.html("<h1>" + (selectedPaper.title) + "</h1>");
    } else {
        div.html("<h1>" + "No paper selected" + "</h1>");
    }
}

function updateSubPaperView() {

    d3.select("#pSubView").selectAll("svg").remove();

    var fisheye = d3.fisheye.circular()
        .radius(100)
        .distortion(10);

    d3.select("#pSubView")
        .on("mousemove", function() {
            fisheye.focus(d3.mouse(this));
            d3.selectAll(".subTitle")
                    .each(function(d) {})
                    .attr("transform", function () {
                        var pos = {
                            x:d3.transform(this.getAttribute("transform")).translate[0]+22.5,
                            y:d3.transform(this.getAttribute("transform")).translate[1]
                        };
                        var fEye = fisheye(pos);
                        return "translate("+ (pos.x-22.5) +","+ pos.y
                            +")"+"scale(" + fEye.z+","+ fEye.z+")"
                            ;
                    })
                ;
        });

    // Draw axis
    var xAxisWidth = 1240;
    var length = 0;

    var baseSvg = d3.select("#pSubView").append("svg")
        .attr("width", xAxisWidth)
        .attr("height", subTitleBegin+50);

    var subSvgGroup = baseSvg.append("g");

    var year;
    for (year in paperData) length++;

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
            .range(dateRange);

    var dAxis = d3.svg.axis()
            .scale(dScale)
            .orient("bottom")
            .outerTickSize(0);

    subSvgGroup.append("g")
        .attr("class", "axis")
        .call(dAxis)
        .attr("transform", function () {
            return "translate(-45," + subTitleBegin + ")"
        });

    //console.log(abstractData);

    //var barId, rectId;
    var selection;
    var citationScale;
    var j = 0;
    for (year = 2015; year > 2001; year--) {
        if (paperData.hasOwnProperty(year.toString())) {
            (function () {
                citationScale = d3.scale.linear()
                    .domain([0, maxPaperCitations[year-2002]])
                    .range([0, dWidth - 10]);

                var xOffset = 13 - j;
                var barId = "sub_b" + year;
                var currentData = paperData[year];
                var validTitleCount = -4;

                selection = subSvgGroup.append("g")
                    .attr("id", function () {return barId;})
                    .selectAll("text")
                    .data(currentData);

                selection.enter().append("text")
                    .attr('class','subTitle')
                    .attr("style", "cursor: default")
                    .text(function (d) {return d.title;})
                    .style("font-weight", "normal")
                    .attr("font-size", function () {return fontSize + "px";})
                    .attr("transform", function (d) {
                        if (d.title === selectedPaper.title || citedBy.indexOf(d.id) > -1 || references.indexOf(d.id) > -1 ) {
                            validTitleCount += 5;
                            return "translate(" + ((xOffset + 1) * dWidth - 15 - 30) + ","
                                + (subTitleBegin - 0.5 * fontSize - (validTitleCount) * (fontSize + 0.5)) + ")"
                        } else
                            return "translate(0,0)";
                    })
                    .style("fill", function (d) {
                        if (selectedPaper) {
                            if (d.title === selectedPaper.title) return 'Black';
                            if (citedBy.indexOf(d.id) > -1) return 'ForestGreen';
                            if (references.indexOf(d.id) > -1) return 'DodgerBlue';
                            return 'none';
                        }
                    })
                ;
                j++
            })();
        }
    }
}

function getMappingId(n) {
    for (var i = 0; i < forceGraphMapping.length; i++) {
        if (forceGraphMapping[i] == n)
            return i;
    }

    return -1;
}

function updateAuthorsView () {
    var maxCitedCount = 0;
    if (selectedPaper) {
        forceGraphMapping = [];
        var vertices = [];
        var edges = [];
        var mappingId = 0;
        var year;

        for (year = 2015; year > 2001; year--) {
            if (paperData.hasOwnProperty(year.toString())) {
                (function () {
                    for (var i = 0; i < paperData[year].length; i++) {
                        var matching = false;
                        for (var j = 0; j < getAuthors(paperData[year][i]).length; j++) {
                            if (matching == false) {
                                for (var t = 0; t < getAuthors(selectedPaper).length; t++) {
                                    if (getAuthors(selectedPaper)[t] == getAuthors(paperData[year][i])[j]) {
                                        matching = true;
                                        var tmp = {
                                            "_id": mappingId,
                                            "_type": "vertex",
                                            "data_type": "paper",
                                            "title": paperData[year][i].title,
                                            "year": year,
                                            "citedCount": getCitedCount(paperData[year][i])
                                        };
                                        maxCitedCount = Math.max(getCitedCount(paperData[year][i]), maxCitedCount);
                                        vertices.push(tmp);
                                        forceGraphMapping.push(paperData[year][i].title);
                                        mappingId++;
                                    }
                                }
                            }
                        }
                    }
                })();
            }
        }

        var citationScale = d3.scale.linear()
            .domain([0, maxCitedCount])
            .range([50, 500]);

        for (var i = 0; i < getAuthors(selectedPaper).length; i++) {
            var tmp = {
                "_id": mappingId,
                "_type": "vertex",
                "data_type": "author",
                "author": getAuthors(selectedPaper)[i]
            };
            vertices.push(tmp);
            forceGraphMapping.push(getAuthors(selectedPaper)[i]);
            mappingId++;
        }

        for (year = 2015; year > 2001; year--) {
            if (paperData.hasOwnProperty(year.toString())) {
                (function () {
                    for (var i = 0; i < paperData[year].length; i++) {
                        for (var j = 0; j < getAuthors(paperData[year][i]).length; j++) {
                            for (var t = 0; t < getAuthors(selectedPaper).length; t++) {
                                if (getAuthors(selectedPaper)[t] == getAuthors(paperData[year][i])[j]) {
                                    var tmp = {
                                        "source": getMappingId(getAuthors(paperData[year][i])[j]),
                                        "target": getMappingId(paperData[year][i].title),
                                        "_type": "edge"
                                    };
                                    edges.push(tmp);
                                }
                            }
                        }
                    }
                })();
            }
        }

        force.nodes(vertices)
            .links(edges)
            .start();

        aViewBaseSvg.selectAll(".link").remove();

        setTimeout(dothis, 1000);

        aViewBaseSvg.selectAll(".node").each(function (d) {
            //console.log(d);
            if (d.data_type === "paper" && d.title == selectedPaper.title) {
                d3.select(this).
                    transition().duration(1000).
                    attr("transform", "translate(" + 500 + "," + 265 + ")");
                d3.select(this).selectAll("path").
                    transition().duration(1000)
                    .attr("d", d3.svg.symbol().type("circle").size(200))
                    .style("fill", "red")
            } else {
                d3.select(this).
                    transition().duration(1000).
                    style("opacity", 0);
            }
        });

        function dothis() {

            var link = aViewBaseSvg.selectAll(".link")
                    .data(edges)
                    .enter().append("line")
                    .attr("class", "link")
                    .attr("stroke", "rgb(216, 216, 216)")
                ;

            aViewBaseSvg.selectAll(".node").remove();

            var node = aViewBaseSvg.selectAll(".node")
                .data(vertices);

            node.enter().append("g")
                .attr("class", "node")
                .on("mouseover", function (d) {
                    connected = [d];
                    link.transition()
                        .duration(500)
                        .style('stroke-width', function (l) {
                        if (d === l.source) {
                            connected.push(l.target);
                            return 1;
                        }
                        else if (d === l.target) {
                            connected.push(l.source);
                            return 1;
                        }
                        else return 1;
                    })
                        .style('stroke', function (l) {
                            if (d === l.source || d === l.target) return "rgb(116, 116, 116)";
                            else return "rgb(216, 216, 216)";
                        })
                        .style('stroke-opacity', function (l) {
                            if (d === l.source || d === l.target) return 1.0;
                            else return 0.5;
                        })
                    ;
                    node.transition()
                        .duration(500)
                        .style('opacity', function (l) {
                        if (isConnected(l)) return 1.0;
                        else return 0.2;
                    })
                    ;

                    if (d.data_type === "paper") {
                        d3.select(this).selectAll("text")
                            .text(function (d) {
                                return d.title;
                            });


                        aViewDiv.transition()
                            .duration(500)
                            .style("opacity", .7);

                        var span10 = "<span style=\"padding-left:10px\"></span>";
                        aViewDiv.html("<p style=\"font-size:12px\"> Siggraph: " + (d.year) + span10 + "Cited count: " + (d.citedCount) + "<\p>")
                            //+ "<p style=\"font-size:8px\"> cited count: " + (d.citedCount) + "<\p>")
                            .style("left", 900 + "px")
                            .style("top", 2680 + "px")
                            .style("background", 'LightGrey')
                        ;
                    }
                })
                .on("mouseout", function () {
                    link.style('stroke-width', 1)
                        .style('stroke', "rgb(216, 216, 216)")
                        .style('stroke-opacity', 1.0)
                    ;
                    node.style('opacity', 1.0);
                    node.selectAll("text").remove();
                    node.append("text")
                        .attr("dx", 12)
                        .attr("dy", ".35em")
                        .text(function (d) {
                            if (d.data_type === "author") return d['author'];
                            else return "";
                        });

                    aViewDiv.transition()
                        .duration(500)
                        .style("opacity", 0);
                })
                .on("click", function (d) {
                    if (d.data_type === "paper") {
                        // clear searchResult
                        searchResult = null;

                        // put new selected paper
                        selectedPaper = findSelectedTitle(d.title);

                        getCitations();
                        updateText();
                        updatePaperDetails();
                        updateSubPaperView();
                        updateAuthorsView();
                        updateAuthorTitle();

                        aViewDiv.transition()
                            .duration(500)
                            .style("opacity", 0);

                        d3.event.stopPropagation();
                    }
                })
                .call(force.drag);

            node.append("text")
                .attr("dx", 12)
                .attr("dy", ".35em")
                .text(function (d) {
                    if (d.data_type === "author") return d['author'];
                    else return "";
                });

            var authorCount = 0;
            node.each(function (d) {
                if (d.data_type === "author") {
                    d3.select(this).append("image")
                        .attr("xlink:href", function (d) {
                            if (d.data_type === "author") return "user.svg";
                            else if (d.data_type === "paper") return "paper.svg";
                            //else if (d.data_type === "paper") return "null";
                        })
                        .attr("x", -15)
                        .attr("y", -15)
                        .attr("width", 30)
                        .attr("height", 30)
                        //.attr("opacity", 0.5)
                    ;
                } else {
                    d3.select(this).append("path")
                        .attr("d", d3.svg.symbol()
                            .type(function (d) {
                                if (d.data_type === "author") {
                                    return "triangle-up";
                                }
                                else if (d.data_type === "paper") {
                                    return "circle";
                                }
                            })
                            .size(function (d) {
                                if (d.data_type === "paper" && forceGraphMapping[d._id] == selectedPaper.title) {
                                    return 200;
                                } else
                                    return citationScale(d.citedCount);
                                    //return 100;
                            }))
                        .style("fill", function (d) {
                            if (d.data_type === "paper" && forceGraphMapping[d._id] == selectedPaper.title)
                                return "red";
                            else if (d.data_type === "author") {
                                return "Orange";
                            }
                            else return "ForestGreen";
                        })
                        .style("stroke", "grey")
                        .style("stroke-width", "1")
                    ;
                }

                //console.log(d);
                if (d.data_type === "paper" && forceGraphMapping[d._id] == selectedPaper.title) {
                    d3.select(this).classed("fixed", d.fixed = true);
                    d['px'] = 500;
                    d['py'] = 265;
                } else if (d.data_type === "author") {
                    d3.select(this).classed("fixed", d.fixed = true);
                    d['px'] = 500 + (250 + 100) * Math.cos(authorCount / getAuthors(selectedPaper).length * 6.28 + 0.11);
                    d['py'] = 265 + (5 * authorCount + 100) * Math.sin(authorCount / getAuthors(selectedPaper).length * 6.28 + 0.11);
                    authorCount++;
                }
            });

            force.on("tick", function () {
                link.attr("x1", function (d) {
                    return d.source.x;
                })
                    .attr("y1", function (d) {
                        return d.source.y;
                    })
                    .attr("x2", function (d) {
                        return d.target.x;
                    })
                    .attr("y2", function (d) {
                        return d.target.y;
                    });

                node.attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });
            });
        }
    }
}

function createAuthorsView () {
    force = d3.layout.force()
        .charge(-200)
        .linkDistance(80)
        .friction(0.9)
        .gravity(0.0)
        .size([1000, 530]);

    aViewBaseSvg = d3.select("#aView").append("svg")
            .attr("width", 1000)
            .attr("height", 530)
        ;

    aViewDiv =  d3.select("#aView").append("div")
        .attr("class", "authorViewToolTip")
        .style("opacity", 0)
        ;

    updateAuthorsView();
}

function isConnected(d) {
    for (var i = 0; i < connected.length; i++) {
        if (d === connected[i])
            return true;
    }
    return false;
}

function findSelectedTitle(t) {
    var result = null;
    for (var year = 2002; year < 2016; year++) {
        if (paperData.hasOwnProperty(year.toString())) {
            (function () {
                for (var i = 0; i < paperData[year].length; i++) {
                    if (paperData[year][i].title === t) {
                        result = paperData[year][i];
                        return;
                    }
                }
            })();
        }
    }
    return result;
}

function updateByKeywords() {
    //console.log(selected_keywords);
    selectedPaper = null;
    references = [];
    citedBy = [];
    searchResult = [];
    maxPaperCitationOnSelected = 0;
    console.log(selected_keywords);
    for (var year = 2002; year < 2016; year++) {
        if (paperData.hasOwnProperty(year.toString())) {
            (function () {
                var i, j;
                for (i = 0; i < paperData[year].length; i++) {
                    var found = true;
                    for (j = 0; j < selected_keywords.length; ++j) {
                        if (keywordData[paperData[year][i].id].keywords.indexOf(selected_keywords[j]) < 0) {
                            found = false;
                            break;
                        }
                    }

                    if (found) {
                        searchResult.push(paperData[year][i]);
                        maxPaperCitationOnSelected = Math.max(getCitedCount(paperData[year][i]), maxPaperCitationOnSelected);
                        paperData[year][i]['isTarget'] = true;
                    } else {
                        paperData[year][i]['isTarget'] = false;
                    }
                }
            })();
        }
    }

    // cannot find matching paper
    if (searchResult.length == 0)
        searchResult = null;

    // only on matching paper, set it as selected paper
    else if (searchResult.length == 1) {
        selectedPaper = searchResult[0];
        searchResult = null;

        getCitations();
        updatePaperDetails();
        updateSubPaperView();
        updateAuthorsView();
        updateAuthorTitle();
    }

    updateText();
}