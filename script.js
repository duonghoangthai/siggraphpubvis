/*globals d3, topojson, document*/
// These are helpers for those using JSHint

/* DATA LOADING */

// This is where execution begins; everything
// above this is just function definitions
// (nothing actually happens)

d3.json("Data/papers.json", function (error, paperData) {
    if (error) throw error;
    console.log(paperData);
});