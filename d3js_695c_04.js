var sum_arrays = [];
for (var i=0; i<10; ++i) {
    sum_arrays.push([]);
}

//=================================================
var X_OFFSET = 40;
var Y_OFFSET = 10;

//debugger;

var margin = { top: 10, right: 10, bottom: 10, left: 10 },
	width = 400 - margin.left - margin.right,
	query_ls = ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "Q9", "Q10", "Q11", "Q12", "Q13", "Q14", "Q_sum"],
	gridSize = Math.floor((width - X_OFFSET) / query_ls.length), //15 columns per row (query#)
	table_ls = ["part", "supplier", "partsupp", "customer", "nation", "region", "lineitem", "orders", "T_sum"],
	legendElementWidth = gridSize*1.5,
	buckets = 9,
	colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"],
	height = gridSize * table_ls.length + margin.top + margin.bottom;
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
        .append("div")
        .style("float", "left");
    selection.each(function (map_idx_obj) {
    		//console.log(map_idx_obj);
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
                    
            var tip = d3.tip()
					  .attr('class', 'tooltip')
					  .offset([-10, 0])
					  .html(function(d) {
						return "<strong>Frequency:</strong> <span style='color:red'>" + d.scanstep_difference + "</span>";
					  });
			
			svg.call(tip);
					  
            
            var cards = svg.selectAll(".query")
                    .data(data, function(d) {return d.table+':'+d.query;})
                    
            var cards_enter = cards.enter();

            cards.append("title");

			 //debugger;
            
            //var cards_sum = svg.selectAll(".query");
           // cards_sum = cards.data(data.filter(function(d){ return (d.query == 14 || d.table == 9); }));
           cards_enter = cards_enter.append("g");
           
            cards_enter.filter(function(d){ return (d.query == 14 || d.table == 9); })
            	.append("circle")
                .attr("cx", function(d) { return (d.query - 0.5) * gridSize; })
                .attr("cy", function(d) { return (d.table - 0.5) * gridSize; })	//cx, cy is center of circle
                .attr("r", gridSize / 2)
                .attr("class", "query bordered")
                .style("fill", colors[0])
                .attr("transform", "translate(" + X_OFFSET + ", " + Y_OFFSET + ")")
                .transition().duration(1000)
                .style("fill", function(d) { 
                    var tmp;
                    if (d.scanstep_difference >= 0)
         	        tmp = Math.log(Math.abs(d.scanstep_difference) + 1);
                    else  
         	        tmp = -Math.log(Math.abs(d.scanstep_difference) + 1);
                    return colorScale(tmp);
                });
                
                
            //cards = cards.filter(function(d){ return (d.query != 14 && d.table != 9); }));
            cards_enter.filter(function(d){ return (d.query != 14 && d.table != 9); })
            .append("rect")
                .attr("x", function(d) { return (d.query - 1) * gridSize; })
                .attr("y", function(d) { return (d.table - 1) * gridSize; })
                .attr("rx", 4)
                .attr("ry", 4)
                .attr("class", "query bordered")
                .attr("width", gridSize)
                .attr("height", gridSize)
                .style("fill", colors[0])
                .attr("transform", "translate(" + X_OFFSET + ", " + Y_OFFSET + ")")
                .transition().duration(1000)
                .style("fill", function(d) { 
                    var tmp;
                    if (d.scanstep_difference >= 0)
         	        tmp = Math.log(Math.abs(d.scanstep_difference) + 1);
                    else  
         	        tmp = -Math.log(Math.abs(d.scanstep_difference) + 1);
                    return colorScale(tmp);
                });
                

           // cards.select("title").text(function(d) { return d.scanstep_difference; });
            
            cards.on("click", function(d) {
                highlight_clicked_card_from_compare(d);
            });
            
            
            				
           /* cards.on("mourseover", function(d, tooltip) {
            	tooltip.transition()
				       .duration(200)
				       .style("opacity", .9);
				  tooltip.html(function(d) {return "<strong>Scansteps:</strong> <span style='color:red'>" + d.scansteps + "</span>";})
				       .style("left", (d3.event.pageX + 5) + "px")
				       .style("top", (d3.event.pageY - 28) + "px");
			  })
			  .on("mouseout", function(d) {
				  tooltip.transition()
				       .duration(500)
				       .style("opacity", 0);
			  });
		*/
		cards.on("mouseover", tip.show)
			 .on('mouseout', tip.hide);

            
            
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
		    datasets.push("avg.tsv");
		    datasets_table["avg.tsv"] = [];
		    done();
		}
	    };
	})(name));
    }
}
/*function load_all_states(done)
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
                }, function(name) {console.log("LOADED ", name)});
           
            }
        
	
	console.log("LOOP ENDED");
}*/


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


function cluster_dfs(node, data_array) {
	var children_list = node.children;
	if (children_list == null)
	{
		var idx = datasets.indexOf(node.name);
		data_array.push(idx);
		console.log(node.name);
		console.log(idx);
	}
	else
	{
		for (var i = 0; i < children_list.length; ++i)
		{
			cluster_dfs(children_list[i], data_array);
		}
	}
};




function collapsible_dfs(node, data_array) {
	var children_list = node.children;
	if (children_list == null)
	{
		var idx = datasets.indexOf(node.name);
		data_array.push(idx);
		console.log(node.name);
		console.log(idx);
	}
	else
	{
		for (var i = 0; i < children_list.length; ++i)
		{
			collapsible_dfs_hidden_nodes(children_list[i], data_array);
		}
	}
};

function collapsible_dfs_hidden_nodes(node, data_array) {
	var children_list = node._children;
	if (children_list == null)
	{
		var idx = datasets.indexOf(node.name);
		data_array.push(idx);
		console.log(node.name);
		console.log(idx);
	}
	else
	{
		for (var i = 0; i < children_list.length; ++i)
		{
			collapsible_dfs_hidden_nodes(children_list[i], data_array);
		}
	}
};




function draw_clustering_tree() {
    var width = 960,
    height = 2200;

    var cluster = d3.layout.cluster()
    	.size([height, width - 160]);

    var diagonal = d3.svg.diagonal()
    	.projection(function(d) { return [d.y, d.x]; });

    var svg = d3.select("#tree").append("svg")
    	.attr("width", width)
    	.attr("height", height)
        .append("g")
        .attr("transform", "translate(40,0)");

    d3.json("cluster.json", function(error, root) {
        if (error) throw error;

	  	var nodes = cluster.nodes(root),
		  	links = cluster.links(nodes);

	  	var link = svg.selectAll(".link")
		  	    .data(links)
			    .enter().append("path")
		        .attr("class", "link")
		        .attr("d", diagonal);

	 	var node = svg.selectAll(".node")
		  	    .data(nodes)
			    .enter().append("g")
		  	    .attr("class", "node")
		  	    .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })

	  	node.append("circle")
		  	    .attr("r", 4.5)
		  	    .on("click", function(d) {
		    	d3.json("get_cluster_average/" + d.name, function(error, root) {
		          	if (error) { console.error(error); }
		        });
		  	});

	  	node.append("text")
		  	    .attr("dx", function(d) { return d.children ? -8 : 8; })
		  	    .attr("dy", 3)
		  	    .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
		  	    .text(function(d) { return d.name; })
		  	    .on("click", function(d) {
		  	    	//var idx_leaf = datasets.indexOf(d.name);
		  	    	var data = [];
		  	    
		  	    	cluster_dfs(d, data);
		  	    	//data.push(idx_leaf);
		  	    	d3.select("#heatmap")
		  	    	  .selectAll("div").remove();
		  	    	/*var sel = d3.select("#heatmap")
		  	    				.selectAll("div")
		  	    				.data(data);			
		  	    	draw_compare_states(sel, -1, -1);*/
		  	    	draw_avg_state(data, data.length);
		  	    });
    });

    d3.select(self.frameElement).style("height", height + "px");
}


function draw_avg_state(subset, cnt)  //subset[cnt] is an array of filenames
{
	var url = "/comp_avg/";
	for (var i = 0; i < cnt; ++i)
	{
		url = url.concat(datasets[subset[i]], " ");
	}

	d3.tsv(url, function(d) {
        return {
			table: +d.table,
			query: +d.query,
			scanstep: +d.scanstep
		};
	}, function(error, d) {
		if (error === null) {
			//debugger;
			datasets_table["avg.tsv"] = d;
			subset.unshift(datasets.indexOf("avg.tsv"));
			d3.select("#heatmap")
  	    	  .selectAll("div").remove();
  	    	var sel = d3.select("#heatmap")
  	    				.selectAll("div")
  	    				.data(subset);			
  	    	draw_compare_states(sel, -1, -1);
    	}
	});
}



function draw_collapsible_clustering_tree() {
	var width = 1800,
    height = 1000;

	var i = 0,
		duration = 750,
		root;

	var tree = d3.layout.tree()
		.size([height, width]);

	var diagonal = d3.svg.diagonal()
		.projection(function(d) { return [d.y, d.x]; });

	var svg = d3.select("#tree").append("svg")
		.attr("width", width)
		.attr("height", height)
	  .append("g")
		.attr("transform", "translate(50, 0)");

	d3.json("cluster.json", function(error, node) {
	  if (error) throw error;

	  root = node;
	  root.x0 = height / 2;
	  root.y0 = 0;

	  function collapse(d) {
		if (d.children) {
		  d._children = d.children;
		  d._children.forEach(collapse);
		  d.children = null;
		}
	  }

	  root.children.forEach(collapse);
	  update(root, tree, root, svg, duration, diagonal);
	});

	d3.select(self.frameElement).style("height", "800px");
}


function update(source, tree, root, svg, duration, diagonal) {

  //console.log("in update()");
  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
      links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 180; });

  // Update the nodes…
  var node = svg.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .on("click", function(d) {
          click(d, tree, root, svg, duration, diagonal);
      })
      .on("mouseover", function(d) {
      	  var subtree_nodes = [];
	  	  collapsible_dfs_hidden_nodes(d, subtree_nodes);
	  	  var tip = d3.tip()
					  .attr('class', 'tooltip')
					  .offset([-10, 0])
					  .html(function(d) {
						return "<strong>Leaf nodes in the subtree:</strong> <span style='color:red'>" + subtree_nodes.length + "</span>";
					  });
		
			svg.call(tip);
		
	  	 d3.select(this).on("mouseover", tip.show);
      });
      
      
  /*var subtree_nodes = [];
  	  collapsible_dfs(source, subtree_nodes);
  	  var tip = d3.tip()
				  .attr('class', 'tooltip')
				  .offset([-10, 0])
				  .html(function(d) {
					return "<strong>Nodes in the subtree:</strong> <span style='color:red'>" + subtree_nodes.length + "</span>";
				  });
		
		svg.call(tip);
		
  nodeEnter.on("mouseover", tip.show)
		   .on('mouseout', tip.hide);*/
		   
		   

  nodeEnter.append("circle")
      .attr("r", 1e-6)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeEnter.append("text")
      .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
      .attr("dy", ".35em")
      .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
      .text(function(d) { return d.name; })
      .style("fill-opacity", 1e-6);

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("circle")
      .attr("r", 4.5)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeUpdate.select("text")
      .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .remove();

  nodeExit.select("circle")
      .attr("r", 1e-6);

  nodeExit.select("text")
      .style("fill-opacity", 1e-6);

  // Update the links…
  var link = svg.selectAll("path.link")
      .data(links, function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      });

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
};


// Toggle children on click.
function click(d, tree, root, svg, duration, diagonal) {
    if (d.children) {
        console.log("internal node");
        d._children = d.children;
        d.children = null;
    } else {
        console.log("leaf");
        d.children = d._children;
        d._children = null;
        
        var idx_leaf = datasets.indexOf(d.name);
        if (idx_leaf !== -1) {	//leaf node
            var data = [];
            data.push(idx_leaf);
            var sel = d3.select("#heatmap")
                    .selectAll("div")
                    .data(data);			
            draw_compare_states(sel, -1, -1);
        }
        else	//internal node
        {
        	var data = [];
		  	    
  	    	//cluster_dfs(d, data);		//for clustering tree
  	    	collapsible_dfs(d, data);
  	    	//data.push(idx_leaf);
  	    	d3.select("#heatmap")
  	    	  .selectAll("div").remove();
  	    	/*var sel = d3.select("#heatmap")
  	    				.selectAll("div")
  	    				.data(data);			
  	    	draw_compare_states(sel, -1, -1);*/
  	    	draw_avg_state(data, data.length);
        }
    }
    update(d, tree, root, svg, duration, diagonal);
}



function main() {
    read_standard(INDEX_AVG);

    /*var data = [];
    for (var i=0; i<DATASETS_SZ - 1; ++i) {
        data.push(i);
    }
    var sel = d3.select("#heatmap")
            .selectAll("div")
            .data(data);
    draw_compare_states(sel, -1, -1);*/
    //draw_clustering_tree();
    draw_collapsible_clustering_tree();
}
