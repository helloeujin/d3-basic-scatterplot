import * as d3 from "d3";
import "./viz.css";

////////////////////////////////////////////////////////////////////
////////////////////////////  Init  ///////////////////////////////
const svg = d3.select("#svg-container").append("svg").attr("id", "svg");
// const g = svg.append("g"); // group

let width = parseInt(d3.select("#svg-container").style("width"));
let height = parseInt(d3.select("#svg-container").style("height"));
const margin = { top: 20, right: 30, bottom: 40, left: 30 };

// parsing & formatting
const formatXAxis = d3.format("~s"); //숫자를 간결하게 표현하기 위한 포매팅 방식 (K, M)

// scale
const xScale = d3.scaleLog().range([margin.left, width - margin.right]);
const yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);
const radiusScale = d3.scaleSqrt().range([0, 55]);
const colorScale = d3
  .scaleOrdinal()
  .range(["#8160C8", "#FFA602", "#CDC0E4", "#cfcfcf"]); // #ccc

// axis
const xAxis = d3
  .axisBottom(xScale)
  .tickFormat((d) => formatXAxis(d))
  .tickValues([500, 1000, 2000, 4000, 8000, 16000, 32000, 64000]);

const yAxis = d3.axisLeft(yScale).ticks(5);

// svg elements
let circles;

////////////////////////////////////////////////////////////////////
////////////////////////////  Load CSV  ////////////////////////////
let data = [];
let region;

d3.csv("/data/gapminder_combined.csv")
  .then((raw_data) => {
    // data parsing
    data = raw_data.map((d) => {
      d.population = parseInt(d.population);
      d.income = parseInt(d.income);
      d.year = parseInt(d.year);
      d.life_expectancy = parseInt(d.life_expectancy);
      return d;
    });

    region = [...new Set(data.map((d) => d.region))];

    //  scale updated
    // xScale.domain(d3.extent(data, (d) => d.income));
    xScale.domain([500, d3.max(data, (d) => d.income)]);
    yScale.domain(d3.extent(data, (d) => d.life_expectancy));
    radiusScale.domain([0, d3.max(data, (d) => d.population)]);
    colorScale.domain(region);

    // axis
    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis);

    svg
      .append("g")
      .attr("class", "y-axis")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxis);

    // add circles
    circles = svg
      .selectAll("circles")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.income))
      .attr("cy", (d) => yScale(d.life_expectancy))
      .attr("r", (d) => radiusScale(d.population))
      .attr("fill", (d) => colorScale(d.region))
      .attr("stroke", "#fff");
  })
  .catch((error) => {
    console.error("Error loading CSV data: ", error);
  });

////////////////////////////////////////////////////////////////////
////////////////////////////  Resize  //////////////////////////////
window.addEventListener("resize", () => {
  //  width, height updated
  width = parseInt(d3.select("#svg-container").style("width"));
  height = parseInt(d3.select("#svg-container").style("height"));

  //  scale updated
  xScale.range([margin.left, width - margin.right]);
  yScale.range([height - margin.bottom, margin.top]);

  //  axis updated
  d3.select(".x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis);

  d3.select(".y-axis")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(yAxis);

  // circles updated
  circles
    .attr("cx", (d) => xScale(d.income))
    .attr("cy", (d) => yScale(d.life_expectancy))
    .attr("r", (d) => radiusScale(d.population));
});
