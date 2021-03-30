// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 40, right: 100, bottom: 40, left: 175};
const NUM_EXAMPLES = 15;

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = (MAX_WIDTH / 2) - 10, graph_1_height = 250;
let graph_2_width = (MAX_WIDTH / 2) - 10, graph_2_height = 275;
let graph_3_width = MAX_WIDTH / 2, graph_3_height = 575;

// Take in and clean data
function plotGenres(){
  d3.csv("../data/netflix.csv").then(function(data) {
    // split the "listed_in" variable from a string to a list of Genres and get unique genres
    var genres = new Array();
    data.forEach(function(row) {
      row["listed_in"] = row["listed_in"].split(", ");
      row["listed_in"].forEach(function(genre1) {
        genres.push(genre1);
      })
    });
    // get unique genres
    genres = genres.filter((x, i, a) => a.indexOf(x) === i);
    genre_dict = [];
    genres.forEach(function(genre2) {
      var num = 0;
      data.forEach(function(row) {
        row["listed_in"].forEach(function(genre3) {
          if (genre3 == genre2) {
            num = num + 1;
          }
        })
      })
      genre_dict.push({"genre": genre2, "frequency": parseInt(num,10)})
    });
    genre_dict.sort(function(a,b){return b["frequency"]-a["frequency"]})
    genre_dict = genre_dict.slice(0, NUM_EXAMPLES)

    // plot the genres
    let svg1 = d3.select("#graph1")
      .append("svg")
      .attr("width", graph_1_width)
      .attr("height", graph_1_height)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Set up reference to "frequency" SVG group
    let freqRef = svg1.append("g");

    // Create a linear scale for the x axis
    let x = d3.scaleLinear()
      .domain([0, d3.max(genre_dict, function(d) { return d["frequency"]})])
      .range([0, (graph_1_width - margin.left - margin.right)]);

    // Create a scale band for the y axis
    let y = d3.scaleBand()
      .domain(genre_dict.map(x => x.genre))
      .range([0,(graph_1_height - margin.top - margin.bottom)])
      .padding(0.1);

    // Add y-axis
    svg1.append("g")
      .call(d3.axisLeft(y).tickSize(0).tickPadding(10));

    // Add x-axis
    svg1.append("g")
      .attr("transform", `translate(0, 170)`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    // Select all desired elements in the DOM, count and parse the data values, and create new, data-bound elements for each data value
    let bars = svg1.selectAll("rect").data(genre_dict);

    // Create a color scheme to go with Netflix's
    let color = d3.scaleOrdinal()
      .domain(genre_dict.map(function(d) { return d["genre"] }))
      .range(d3.quantize(d3.interpolateHcl("#4f0404", "#fa0505"), NUM_EXAMPLES));

    // Render bar chart elements
    bars.enter()
      .append("rect")
      .merge(bars)
      .attr("fill", function(d) { return color(d["genre"]) }) // Here, we are using functin(d) { ... } to return fill colors based on the data point d
      .attr("x", x(0))
      .attr("y", function(d) { return y(d["genre"]) })               // HINT: Use function(d) { return ...; } to apply styles based on the data point (d)
      .attr("width", function(d) {return x(d["frequency"])})
      .attr("height", y.bandwidth());

    // Set up reference to SVG frequency group
    let frequencies = freqRef.selectAll("text").data(genre_dict);

    // Render the text elements on the DOM
    frequencies.enter()
        .append("text")
        .merge(frequencies)
        .attr("x", function(d) {return 5 + x(d["frequency"])})
        .attr("y", function(d) {return 9 + y(d["genre"])})
        .style("text-anchor", "start")
        .style("font-size", 10)
        .text(function(d) {return d["frequency"]});

    // Add x-axis label
    svg1.append("text")
        .attr("transform", `translate(${margin.left}, 205)`)
        .style("text-anchor", "middle")
        .text("Number of Titles");

    // Add y-axis label
    svg1.append("text")
        .attr("transform", `translate(-130, 85) rotate(-90)`)
        .style("text-anchor", "middle")
        .text("Genre");

    // Add chart title
    svg1.append("text")
        .attr("transform", `translate(170, -15)`)
        .attr("letter-spacing", 1)
        .style("text-anchor", "middle")
        .style("font-size", 20)
        .text("Number of Titles in 15 Most Popular Genres");
  });
}

let content_type = [["Movie", "Minutes"], ["TV Show", "Seasons"]];

let svg2 = d3.select("#graph2")
      .append("svg")
      .attr("width", graph_2_width)
      .attr("height", graph_2_height)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.bottom})`)

let x = d3.scaleLinear()
  .range([0, graph_2_width - margin.left - margin.right]);

let y = d3.scaleLinear()
  .range([(graph_2_height - margin.top - margin.bottom), 0])

let y_axis_label = svg2.append("g");
let x_axis_label = svg2.append("g");

let y_axis_text = svg2.append("text")
    .attr("transform", `translate(-50, 95) rotate(-90)`)     

let x_axis_text = svg2.append("text")
    .attr("transform", `translate(${margin.left}, 230)`)
    .style("text-anchor", "middle")
    .text("Year");

let title = svg2.append("text")
    .attr("transform", `translate(170, -15)`)
    .attr("letter-spacing", 1)
    .style("text-anchor", "middle")
    .style("font-size", 20);

let line = svg2.append("path")
    .attr('stroke', 'red')
    .attr('fill', 'none');

var div = d3.select("#graph2").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);

function plotRuntimes(type){
  // graph average runtime of movies by release year
  d3.csv("../data/netflix.csv").then(function(data) {
    // get unique years of movies
    data = data.filter(function(d){ return d["type"] == content_type[type][0]});
    var years = data.map(function(d) {return d["release_year"]});
    years = years.filter((x, i, a) => a.indexOf(x) === i);
    years.sort(function(a,b) {return a-b});
    year_dict = [];
    years.forEach(function(year) {
      var avg_list = [];
      data.forEach(function(row){
        if (row["release_year"] == year) {
          var duration = row["duration"].split(", ")[0]
          avg_list.push(parseInt(duration, 10));
        }
      })
      year_dict.push({"year":year, "avg_duration": d3.format(".2s")(d3.mean(avg_list))});
    })

    x.domain([d3.min(year_dict, function(d){return d["year"]}), d3.max(year_dict, function(d){return d["year"]})]);

    y.domain([0, d3.max(year_dict, function(d){return parseInt(d["avg_duration"],10)})]);

    // Add the line
    line.datum(year_dict);
    line.attr("d", d3.line()
        .x(function(d){return x(d["year"])})
        .y(function(d){return y(d["avg_duration"])}));

    // Add y-axis
    y_axis_label.call(d3.axisLeft(y).tickSize(0).tickPadding(10));

    // Add x-axis
    x_axis_label.attr("transform", `translate(0, 195)`);
    x_axis_label.call(d3.axisBottom(x).tickFormat(d3.format("d")));
    // Add y-axis label
    y_axis_text.text("Average " + content_type[type][1]);

    // Add chart title
    title.text("Average Content Duration Across Time");
  });
}


function plotActors(){
  d3.csv("../data/netflix.csv").then(function(data) {
    data = data.filter(function(d) {return d["type"] == 'Movie'});
    data = data.filter(function(d) {return d["country"] == 'United States'});
    data = data.filter(function(d) {return d["rating"] == "PG-13"});
    data = data.filter(function(d) {return parseInt(d["release_year"],10) == 2018});
    var actors = [];
    // get list of all actors
    data.forEach(function(row){
      row["cast"] = row["cast"].split(", ");
      row["cast"].forEach(function(actor) {
        actors.push(actor);
      })
    })
    actors = actors.filter((x, i, a) => a.indexOf(x) === i);
    // get ids for all actors
    var id = 1;
    var nodes_temp = {};
    var links = [];
    actors.forEach(function(actor) {
      if (actor.length > 0) {
        nodes_temp[actor] = id;
        id += 1;
      }
    })
    // find links
    actors.forEach(function(actor){
      temp_data = data.filter(function(row) {return (row["cast"].includes(actor))});
      temp_data.forEach(function(row){
          row["cast"].forEach(function(member) {
            if (member != actor) {
              var actor1id = nodes_temp[actor];
              var actor2id = nodes_temp[member];
              links.push({"source":actor1id, "target":actor2id});
            }
          })
      })
    })
    // construct the right data format
    var nodes = [];
    for (const [id, name] of Object.entries(nodes_temp)) {
      nodes.push({"id":name, "name":id});
    }

    var limited_nodes_ids = [];
    var limited_nodes = [];
    var limited_links = [];
    // limit data to only people who have > 5 connections:
    nodes.forEach(function(node) {
      temp_data = links.filter(function(row) {return (row["source"] == node["id"])});
      if (temp_data.length > 5) {
        limited_nodes_ids.push(node["id"]);
        limited_nodes.push({"id":node["id"], "name":node["name"]});
      }
    })

    links.forEach(function(link) {
      if (limited_nodes_ids.includes(link["source"])) {
        if (limited_nodes_ids.includes(link["target"])) {
          limited_links.push({"source":link["source"], "target":link["target"]});
        }
      }
    })


    const final_links = limited_links.map(d => Object.create(d));
    const final_nodes = limited_nodes.map(d => Object.create(d));

    // graph map
    let svg3 = d3.select("#graph3")
      .append("svg")
      .attr("width", graph_3_width-margin.right)
      .attr("height", graph_3_height)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);


    let title = svg3.append("text")
      .attr("transform", `translate(110, 0)`)
      .attr("letter-spacing", 1)
      .style("text-anchor", "middle")
      .style("font-size", 20)
      .text("Connections between Actors in 2018 PG-13 Movies");

    var link = svg3.append("g")
      .selectAll("line")
      .data(final_links)
      .enter()
      .append("line")
      .style("stroke", "#aaa");

    var node = svg3.append("g")
      .selectAll("g")
      .data(final_nodes)
      .enter()
      .append("circle")
      .attr("r", 5)
      .style("fill", "#fa0505");

    node.append("text")
      .text(function(d) {return d.name;})
      .attr('x', 6)
      .attr('y', 3);

    node.append("title")
      .text(function(d) { return d.name; });

    var simulation = d3.forceSimulation(final_nodes) 
      .force("link", d3.forceLink()                               
        .id(function(d) { return d.id; })                     
        .links(final_links)                                    
      )
      .force("charge", d3.forceManyBody(-100))        
      .force("center", d3.forceCenter(graph_3_width / 2, graph_3_height / 2)) 
      .on("tick", ticked);


    function ticked() {
      link
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node
          .attr("cx", function (d) { return d.x+6; })
          .attr("cy", function(d) { return d.y-6; });
    }
  });
}
// Plot graphs:
plotGenres();
plotRuntimes(0);
plotActors();
