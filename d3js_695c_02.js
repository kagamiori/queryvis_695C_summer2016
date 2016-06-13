var sum_arrays = [];
for (var i=0; i<9; ++i) {
    sum_arrays.push([]);
}

//=================================================
var X_OFFSET = 40;
var Y_OFFSET = 10;

var margin = { top: 50, right: 0, bottom: 100, left: 50 },
          width = 400 - margin.left - margin.right,
          height = 350 - margin.top - margin.bottom,
          gridSize = Math.floor((width - X_OFFSET) / 14), //14 columns per row (query#)
          legendElementWidth = gridSize*1.5,
          buckets = 9,
          colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"],
          table_ls = ["part", "supplier", "partsupp", "customer", "nation", "region", "lineitem", "orders"],
          query_ls = ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "Q9", "Q10", "Q11", "Q12", "Q13", "Q14"];
	  /*//single fn_list
	  datasets = ["idx_none.tsv", "idx_ppartkey.tsv", "idx_pmfgr.tsv", "idx_psize.tsv", "idx_ptype.tsv", "idx_ssuppkey.tsv", "idx_snationkey.tsv", "idx_sacctbal.tsv", "idx_sname.tsv", "idx_pspartkey.tsv", "idx_pssuppkey.tsv", "idx_pssupplycost.tsv", "idx_cmktsegment.tsv", "idx_ccustkey.tsv", "idx_cnationkey.tsv", "idx_cname.tsv", "idx_cacctbal.tsv", "idx_cphone.tsv", "idx_caddress.tsv", "idx_ccomment.tsv", "idx_nnationkey.tsv", "idx_nregionkey.tsv", "idx_nname.tsv", "idx_rregionkey.tsv", "idx_rname.tsv", "idx_lshipdate.tsv", "idx_lreturnflag.tsv", "idx_llinestatus.tsv", "idx_lorderkey.tsv", "idx_lcommitdate.tsv", "idx_lreceiptdate.tsv", "idx_lsuppkey.tsv", "idx_ldiscount.tsv", "idx_lquantity.tsv", "idx_lshipmode.tsv", "idx_lpartkey.tsv", "idx_ocustkey.tsv", "idx_oorderkey.tsv", "idx_oorderdate.tsv", "idx_oshippriority.tsv", "idx_oorderpriority.tsv", "idx_avg.tsv"];*/
	  //double fn_list
var datasets, DATASETS_SZ, INDEX_AVG;

function draw_one_state(map_idx)
{
    var tsvFile = datasets[map_idx];

    var data = datasets_table[tsvFile];
    var min_value = d3.min(data, function (d) { 
        var tmp; 
        if (d.scanstep >= 0)
            tmp = Math.log(Math.abs(d.scanstep) + 1);
        else  
            tmp = -Math.log(Math.abs(d.scanstep) + 1);
        
        // console.log(tmp);
        return tmp;
    });
    var max_value = d3.max(data, function (d) { 
        var tmp;
        if (d.scanstep >= 0)
            tmp = Math.log(Math.abs(d.scanstep) + 1);
        else  
            tmp = -Math.log(Math.abs(d.scanstep) + 1);
        
        // console.log(tmp);
        return tmp;
    });

    var colorScale = d3.scale.linear().domain([0, max_value]).range(["white", "blue"]);

    var svg = d3.select("#heatmap").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
          
    var cards = svg.selectAll(".query")
            .data(data, function(d) {return d.table+':'+d.query;});

    cards.append("title");

    cards.enter().append("rect")
        .attr("x", function(d) { return (d.query - 1) * gridSize; })
        .attr("y", function(d) { return (d.table - 1) * gridSize; })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("class", "query bordered")
        .attr("width", gridSize)
        .attr("height", gridSize)
        .style("fill", colors[0])
        .attr("transform", "translate(" + X_OFFSET + ", " + Y_OFFSET + ")");

    cards.transition().duration(1000)
        .style("fill", function(d) { 
            var tmp;
            if (d.scanstep >= 0)
         	tmp = Math.log(Math.abs(d.scanstep) + 1);
            else  
         	tmp = -Math.log(Math.abs(d.scanstep) + 1);
            
            //console.log(tmp);
            return colorScale(tmp);
        });

    cards.select("title").text(function(d) { return d.scanstep; });
    
    cards.exit().remove();
}

function draw_states(to_map_idx)
{
	var i;
	for (i = 0; i <= to_map_idx; ++i)
	{
		// console.log(to_map_idx);
		// console.log(i);
		draw_one_state(i);
	}
}


function highlight_clicked_card_from_compare(entry)
{
    var table_idx = entry.table - 1;
    var query_idx = entry.query - 1;
	
    read_standard(INDEX_AVG);

    var data = [];
    for (var i=0; i<DATASETS_SZ - 1; ++i) {
        data.push(i);
    }
    var sel = d3.select("#heatmap")
            .selectAll("div").data(data);
    draw_compare_states(sel, entry.table, entry.query);
}

function read_standard(map_idx_standard)
{
    var tsvFile_standard = datasets[map_idx_standard];
    var data = datasets_table[tsvFile_standard];
    data.forEach(function(d){
        sum_arrays[d.table][d.query] = d.scanstep;
    });
}

function draw_compare_states(selection, highlight_table, highlight_query)
{
    selection
        .enter()
        .call(function(d){if (d % 4 == 0)
        			this.append("tr");
        		 })
        .append("td")
        .append("div").attr("style", "width:800px;")
        .each(function (map_idx_obj) {
            var heatmap = d3.select(this);
            
            var tsvFile = datasets[map_idx_obj];
            var data = datasets_table[tsvFile];
            data.forEach(function(d) {
	        d.scanstep_difference = +(d.scanstep-sum_arrays[d.table][d.query]);
            });

            function log_difference(d) { 
                var tmp; 
                if (d.scanstep_difference >= 0)
                    tmp = Math.log(Math.abs(d.scanstep_difference) + 1);
                else  
                    tmp = -Math.log(Math.abs(d.scanstep_difference) + 1);
                return tmp;
            }

            var extent = d3.extent(data, log_difference), min_value = extent[0], max_value = extent[1];

            var colorScale = d3.scale.linear()
                    .domain([min_value, 0, max_value])
                    .range(["red", "white", "blue"]);
            
            heatmap.append("div").text(datasets[map_idx_obj]);
            var svg = heatmap.append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            
            var cards = svg.selectAll(".query")
                    .data(data, function(d) {return d.table+':'+d.query;});

            cards.append("title");

            cards.enter().append("rect")
                .attr("x", function(d) { return (d.query - 1) * gridSize; })
                .attr("y", function(d) { return (d.table - 1) * gridSize; })
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("class", "query bordered")
                .attr("width", gridSize)
                .attr("height", gridSize)
                .style("fill", colors[0])
                .attr("transform", "translate(" + X_OFFSET + ", " + Y_OFFSET + ")");	
            

            cards.transition().duration(1000)
                .style("fill", function(d) { 
                    var tmp;
                    if (d.scanstep_difference >= 0)
         	        tmp = Math.log(Math.abs(d.scanstep_difference) + 1);
                    else  
         	        tmp = -Math.log(Math.abs(d.scanstep_difference) + 1);
                    return colorScale(tmp);
                });

            cards.select("title").text(function(d) { return d.scanstep_difference; });
            
            cards.on("click", function(d) {
                highlight_clicked_card_from_compare(d);
            });
            
            cards.exit().remove();
        });

    selection
        .each(function(map_idx_obj) {
            var div = d3.select(this);
            div.select("svg")
                .selectAll("rect")
                .style("stroke-width", function(d) { if (d.query == highlight_query && d.table == highlight_table) return 5; else return null;})
                .style("stroke", function(d) { if (d.query == highlight_query && d.table == highlight_table) return "black"; else return null;});
        });
}

var datasets_table = {};

function load_all_states(done)
{
    var loaded_so_far = 0;
    for (var i=0; i<datasets.length; ++i) {
	var name = datasets[i];
	d3.tsv(name, function(d) {
            return {
		table: +d.table,
		query: +d.query,
		scanstep: +d.scanstep
            };
	}, (function (internalName) {
	    return function(error, data) {
		datasets_table[internalName] = data;
		console.log("LOADED ", internalName);
		loaded_so_far += 1;
		if (loaded_so_far == datasets.length) {
		    console.log("LOOP ENDED");
		    done();
		}
	    };
	})(name));
    }
}

d3.text("data/datasets.txt", function(error, data) {
    if (error) {
	alert("Error! " + error);
        return;
    }
    datasets = data.trim().split("\n");
    DATASETS_SZ = datasets.length;
    INDEX_AVG = datasets.indexOf("idx_avg.tsv");
    load_all_states(main);
});

function main() {
    read_standard(INDEX_AVG);

    var data = [];
    for (var i=0; i<DATASETS_SZ - 1; ++i) {
        data.push(i);
    }
    var sel = d3.select("#heatmap")
    	    .append("table")
            .selectAll("div")
            .data(data);
    draw_compare_states(sel, -1, -1);
}
