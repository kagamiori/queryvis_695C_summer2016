//Code that displays heatmap is modified from http://bl.ocks.org/tjdecke/5558084
var query_no = 2;

//queries[] is the statics of query using no index
var queries = [
	{q_id: 0,
	 query: "select o_orderpriority, count(*) as order_count from orders where o_orderdate >= date('1996-05-01') and o_orderdate < date('1996-05-01', '+3 month') and exists ( select * from lineitem where l_orderkey = o_orderkey and l_commitdate < l_receiptdate) group by o_orderpriority order by o_orderpriority;",
	 loop_cnt: 2,
	 loops: [{loop_no: 0, table_name: "orders", scanstatus: 1100},
	 	 {loop_no: 1, table_name: "lineitem", scanstatus: 150}],
	 index_cnt: 2,
	 index: [{table_name: "lineitem", column_name: "l_orderkey", idx_id: 7},
	 	 {table_name: "orders", column_name: "o_orderkey", idx_id: 8}]},
	 	 
	{q_id: 1,
	 query: "select * from nation, support where s_name = \"none\";",
	 loop_cnt: 1,
	 loops: [{loop_no: 0, table_name: "support", scanstatus: 325}],
	 index_cnt: 1,
	 index: [{table_name: "support", column_name: "unknown", idx_id: 2}]}
];

var query_index_pair_7 = {
	idx_id: 7, 
	idx_no: 1,
	idx_ls: [{table_name: "lineitem", column_name: "l_orderkey"}],
	records: [
		{q_id: 0,
		 query: "select o_orderpriority, count(*) as order_count from orders where o_orderdate >= date('1996-05-01') and o_orderdate < date('1996-05-01', '+3 month') and exists ( select * from lineitem where l_orderkey = o_orderkey and l_commitdate < l_receiptdate) group by o_orderpriority order by o_orderpriority;",
		 loop_cnt: 2,
		 loops: [{loop_no: 0, table_name: "orders", scanstatus: 150},
		 	 {loop_no: 1, table_name: "lineitem", scanstatus: 3}],
		 index_cnt: 2,
		 index: [{table_name: "lineitem", column_name: "l_orderkey", idx_id: 7},
			{table_name: "orders", column_name: "o_orderkey", idx_id: 8}]},
			 
		{q_id: 1,
		 query: "select * from nation, support;",
		 loop_cnt: 1,
		 loops: [{loop_no: 0, table_name: "support", scanstatus: 325}],
		 index_cnt: 1,
		 index: [{table_name: "support", column_name: "unknown", idx_id: 2}]}
]};


var query_index_pair_8 = {
	idx_id: 8, 
	idx_no: 1,
	idx_ls: [{table_name: "orders", column_name: "o_orderkey"}],
	records: [
		{q_id: 0,
		 query: "select o_orderpriority, count(*) as order_count from orders where o_orderdate >= date('1996-05-01') and o_orderdate < date('1996-05-01', '+3 month') and exists ( select * from lineitem where l_orderkey = o_orderkey and l_commitdate < l_receiptdate) group by o_orderpriority order by o_orderpriority;",
		 loop_cnt: 2,
		 loops: [{loop_no: 0, table_name: "orders", scanstatus: 1100},
		 	 {loop_no: 1, table_name: "lineitem", scanstatus: 150}],
		 index_cnt: 2,
		 index: [{table_name: "lineitem", column_name: "l_orderkey", idx_id: 7},
			{table_name: "orders", column_name: "o_orderkey", idx_id: 8}]},
			 
		{q_id: 1,
		 query: "select * from nation, support;",
		 loop_cnt: 1,
		 loops: [{loop_no: 0, table_name: "support", scanstatus: 325}],
		 index_cnt: 1,
		 index: [{table_name: "support", column_name: "unknown", idx_id: 2}]}
]};

//=================================================
//column_ls[i][j] := columns used by table i query j (all columns involved in where clause, rather than only those scanned)
//id from 1 for each query each column, idx_id is binary number to represent set
//update: q10 done, 40 biniary digits
var column_ls = 
[	
	[//t1 = part (no additional idx)
		[{id: 0, name: "", idx_id: 0}], //q1
		[{id: 1, name: "p_partkey", idx_id: 1}, {id: 2, name: "p_mfgr", idx_id: 2}, {id: 3, name: "p_size", idx_id: 4}, {id: 4, name: "p_type", idx_id: 8}], //q2
		[{id: 0, name: "", idx_id: 0}], //q3
		[{id: 0, name: "", idx_id: 0}], //q4
		[{id: 0, name: "", idx_id: 0}], //q5
		[{id: 0, name: "", idx_id: 0}], //q6
		[{id: 0, name: "", idx_id: 0}], //q7
		[{id: 0, name: "", idx_id: 0}], //q8
		[{id: 0, name: "", idx_id: 0}], //q9
		[{id: 1, name: "p_partkey", idx_id: 1}] //q10
	],
	
	[//t2 = supplier
		[{id: 0, name: "", idx_id: 0}], //q1
		[{id: 1, name: "s_suppkey", idx_id: 16}, {id: 2, name: "s_nationkey", idx_id: 32}, {id: 3, name: "s_acctbal", idx_id: 64}, {id: 4, name: "s_name", idx_id: 128}], //q2
		[{id: 0, name: "", idx_id: 0}], //q3
		[{id: 0, name: "", idx_id: 0}], //q4
		[{id: 1, name: "s_suppkey", idx_id: 16}, {id: 2, name: "s_nationkey", idx_id: 32}], //q5
		[{id: 0, name: "", idx_id: 0}], //q6
		[{id: 0, name: "", idx_id: 0}], //q7
		[{id: 1, name: "s_suppkey", idx_id: 16}, {id: 2, name: "s_nationkey", idx_id: 32}], //q8
	],
	
	[//t3 = partsupp
		[{id: 0, name: "", idx_id: 0}], //q1
		[{id: 1, name: "ps_partkey", idx_id: 256}, {id: 2, name: "ps_suppkey", idx_id: 512}, {id: 3, name: "ps_supplycost", idx_id: 1024}], //q2
		[{id: 0, name: "", idx_id: 0}], //q3
		[{id: 0, name: "", idx_id: 0}], //q4
		[{id: 0, name: "", idx_id: 0}], //q5
		[{id: 0, name: "", idx_id: 0}], //q6
		[{id: 0, name: "", idx_id: 0}], //q7
		[{id: 1, name: "ps_suppkey", idx_id: 512}, {id: 2, name: "ps_partkey", idx_id: 256}], //q8
	],
	
	[//t4 = customer
		[{id: 0, name: "", idx_id: 0}], //q1
		[{id: 0, name: "", idx_id: 0}], //q2
		[{id: 1, name: "c_mktsegment", idx_id: 2048}, {id: 2, name: "c_custkey", idx_id: 4096}], //q3
		[{id: 0, name: "", idx_id: 0}], //q4
		[{id: 1, name: "c_custkey", idx_id: 4096}, {id: 2, name: "c_nationkey", idx_id: 8192}], //q5
		[{id: 0, name: "", idx_id: 0}], //q6
		[{id: 1, name: "c_custkey", idx_id: 4096}, {id: 2, name: "c_nationkey", idx_id: 8192}, {id: 3, name: "c_name", idx_id: 16384}, {id: 4, name: "c_acctbal", idx_id: 32768}, {id: 5, name: "c_phone", idx_id: 65536}, {id: 6, name: "c_address", idx_id: 131072}, {id: 7, name: "c_comment", idx_id: 262144}], //q7
	],
	
	[//t5 = nation
		[{id: 0, name: "", idx_id: 0}], //q1
		[{id: 1, name: "n_nationkey", idx_id: 524288}, {id: 2, name: "n_regionkey", idx_id: 1048576}, {id: 3, name: "n_name", idx_id: 2097152}], //q2
		[{id: 0, name: "", idx_id: 0}], //q3
		[{id: 0, name: "", idx_id: 0}], //q4
		[{id: 1, name: "n_nationkey", idx_id: 524288}, {id: 2, name: "n_regionkey", idx_id: 1048576}, {id: 3, name: "n_name", idx_id: 2097152}], //q5
		[{id: 0, name: "", idx_id: 0}], //q6
		[{id: 1, name: "n_nationkey", idx_id: 524288}, {id: 2, name: "n_name", idx_id: 2097152}], //q7
		[{id: 1, name: "n_nationkey", idx_id: 524288}, {id: 2, name: "n_name", idx_id: 2097152}], //q8
	],
	
	[//t6 = region
		[{id: 0, name: "", idx_id: 0}], //q1
		[{id: 1, name: "r_regionkey", idx_id: 4194304}, {id: 2, name: "r_name", idx_id: 8388608}], //q2
		[{id: 0, name: "", idx_id: 0}], //q3
		[{id: 0, name: "", idx_id: 0}], //q4
		[{id: 1, name: "r_regionkey", idx_id: 4194304}, {id: 2, name: "r_name", idx_id: 8388608}], //q5
	],
	
	[//t7 = lineitem
		[{id: 1, name: "l_shipdate", idx_id: 16777216}, {id: 2, name: "l_returnflag", idx_id: 33554432}, {id: 3, name: "l_linestatus", idx_id: 67108864}], //q1
		[{id: 0, name: "", idx_id: 0}], //q2
		[{id: 1, name: "l_orderkey", idx_id: 134217728}, {id: 2, name: "l_shipdate", idx_id: 16777216}], //q3
		[{id: 1, name: "l_orderkey", idx_id: 134217728}, {id: 2, name: "l_commitdate", idx_id: 268435456}, {id: 3, name: "l_receiptdate", idx_id: 536870912}], //q4
		[{id: 1, name: "l_orderkey", idx_id: 134217728}, {id: 2, name: "l_suppkey", idx_id: 1073741824}], //q5
		[{id: 1, name: "l_shipdate", idx_id: 16777216}, {id: 2, name: "l_discount", idx_id: 2147483648}, {id: 3, name: "l_quantity", idx_id: 4294967296}], //q6
		[{id: 1, name: "l_orderkey", idx_id: 134217728}, {id: 2, name: "l_returnflag", idx_id: 33554432}], //q7
		[{id: 0, name: "", idx_id: 0}], //q8
		[{id: 1, name: "l_orderkey", idx_id: 134217728}, {id: 2, name: "l_shipmode", idx_id: 8589934592}, {id: 3, name: "l_commitdate", idx_id: 268435456}, {id: 4, name: "l_receiptdate", idx_id: 536870912}, {id: 5, name: "l_shipdate", idx_id: 16777216}], //q9
		[{id: 1, name: "l_partkey", idx_id: 17179869184}, {id: 2, name: "l_shipdate", idx_id: 16777216}] //q10
	],
	
	[//t8 = orders
		[{id: 0, name: "", idx_id: 0}], //q1
		[{id: 0, name: "", idx_id: 0}], //q2
		[{id: 1, name: "o_custkey", idx_id: 34359738368}, {id: 2, name: "o_orderkey", idx_id: 68719476736}, {id: 3, name: "o_orderdate", idx_id: 137438953472}, {id: 4, name: "o_shippriority", idx_id: 274877906944}], //q3
		[{id: 1, name: "o_orderdate", idx_id: 137438953472}, {id: 2, name: "o_orderkey", idx_id: 68719476736}, {id: 3, name: "o_orderpriority", idx_id: 549755813888}], //q4
		[{id: 1, name: "o_custkey", idx_id: 34359738368}, {id: 2, name: "o_orderkey", idx_id: 68719476736}, {id: 3, name: "o_orderdate", idx_id: 137438953472}], //q5
		[{id: 0, name: "", idx_id: 0}], //q6
		[{id: 1, name: "o_custkey", idx_id: 34359738368}, {id: 2, name: "o_orderkey", idx_id: 68719476736}, {id: 3, name: "o_orderdate", idx_id: 137438953472}], //q7
		[{id: 0, name: "", idx_id: 0}], //q8
		[{id: 1, name: "o_orderkey", idx_id: 68719476736}], //q9
	]
];


/*var find_set = [{name: "None", idx_id: 0}, {name: "o_orderkey", idx_id: 68719476736}, {name: "o_orderdate", idx_id: 137438953472}, {name: "l_orderkey", idx_id: 134217728}, {name: "l_shipdate", idx_id: 16777216}];*/
find_set = [{name: "None", idx_id: 0}, {name: "p_partkey", idx_id: 1}, {name: "p_mfgr", idx_id: 2}, {name: "p_size", idx_id: 4}, {name: "p_type", idx_id: 8}, {name: "s_suppkey", idx_id: 16}, {name: "s_nationkey", idx_id: 32}, {name: "s_acctbal", idx_id: 64}, {name: "s_name", idx_id: 128}, {name: "ps_partkey", idx_id: 256}, {name: "ps_suppkey", idx_id: 512}, {name: "ps_supplycost", idx_id:1024}, {name: "c_mktsegment", idx_id: 2048}, {name: "c_custkey", idx_id: 4096}, {name: "c_nationkey", idx_id: 8192}, {name: "c_name", idx_id: 16348}, {name: "c_acctbal", idx_id: 32768}, {name: "c_phone", idx_id: 65536}, {name: "c_address", idx_id: 131072}, {name: "c_comment", idx_id: 262144}, {name: "n_nationkey", idx_id: 524288}, {name: "n_regionkey", idx_id: 1048576}, {name: "n_name", idx_id: 2097152}, {name: "r_regionkey", idx_id: 4194304}, {name: "r_name", idx_id: 8388608}, {name: "l_shipdate", idx_id: 16777216}, {name: "l_returnflag", idx_id: 33554432}, {name: "l_linestatus", idx_id: 67108864}, {name: "l_orderkey", idx_id: 134217728}, {name: "l_commitdate", idx_id: 268435456}, {name: "l_receiptdate", idx_id: 536870912}, {name: "l_suppkey", idx_id: 1073741824}, {name: "l_discount", idx_id: 2147483648}, {name: "l_quantity", idx_id: 4294967296}, {name: "l_shipmode", idx_id: 8589934592}, {name: "l_partkey", idx_id: 17179869184}, {name: "o_custkey", idx_id: 34359738368}, {name: "o_orderkey", idx_id: 68719476736}, {name: "o_orderdate", idx_id: 137438953472}, {name: "o_shippriority", idx_id: 274877906944}, {name: "o_orderpriority", idx_id: 549755813888}];

var find_set_sz = 41;


var query_text = 
[	"select l_returnflag, l_linestatus, sum(l_quantity) as sum_qty, sum(l_extendedprice) as sum_base_price, sum(l_extendedprice * (1 - l_discount)) as sum_disc_price, sum(l_extendedprice * (1 - l_discount) * (1 + l_tax)) as sum_charge, avg(l_quantity) as avg_qty, avg(l_extendedprice) as avg_price, avg(l_discount) as avg_disc, count(*) as count_order from lineitem where l_shipdate <= date('1998-12-01', '-88 day') group by l_returnflag, l_linestatus order by l_returnflag, l_linestatus;",
	"select s_acctbal, s_name, n_name, p_partkey, p_mfgr, s_address, s_phone, s_comment from part, supplier, partsupp, nation, region where p_partkey = ps_partkey and s_suppkey = ps_suppkey and p_size = 4 and p_type like '%STEEL' and s_nationkey = n_nationkey and n_regionkey = r_regionkey and r_name = 'EUROPE' and ps_supplycost = ( select min(ps_supplycost) from partsupp, supplier, nation, region where p_partkey = ps_partkey and s_suppkey = ps_suppkey and s_nationkey = n_nationkey and n_regionkey = r_regionkey and r_name = 'EUROPE') order by s_acctbal desc, n_name, s_name, p_partkey;",
	"select l_orderkey, sum(l_extendedprice * (1 - l_discount)) as revenue, o_orderdate, o_shippriority from customer, orders, lineitem where c_mktsegment = 'BUILDING' and c_custkey = o_custkey and l_orderkey = o_orderkey and o_orderdate < date('1995-03-22') and l_shipdate > date('1995-03-22') group by l_orderkey, o_orderdate, o_shippriority order by revenue desc, o_orderdate;",
	"select o_orderpriority, count(*) as order_count from orders where o_orderdate >= date('1996-05-01') and o_orderdate < date('1996-05-01', '+3 month') and exists ( select * from lineitem where l_orderkey = o_orderkey and l_commitdate < l_receiptdate) group by o_orderpriority order by o_orderpriority;",
	"select n_name, sum(l_extendedprice * (1 - l_discount)) as revenue from customer, orders, lineitem, supplier, nation, region where c_custkey = o_custkey and l_orderkey = o_orderkey and l_suppkey = s_suppkey and c_nationkey = s_nationkey and s_nationkey = n_nationkey and n_regionkey = r_regionkey and r_name = 'AFRICA' and o_orderdate >= date('1993-01-01') and o_orderdate < date('1993-01-01', '+1 year') group by n_name order by revenue desc;",
	"select sum(l_extendedprice * l_discount) as revenue from lineitem where l_shipdate >= date('1993-01-01') and l_shipdate < date ('1993-01-01', '+1 year') and l_discount between 0.02 - 0.01 and 0.02 + 0.01 and l_quantity < 25;",
	"select c_custkey, c_name, sum(l_extendedprice * (1 - l_discount)) as revenue, c_acctbal, n_name, c_address, c_phone, c_comment from customer, orders, lineitem, nation where c_custkey = o_custkey and l_orderkey = o_orderkey and o_orderdate >= date('1993-06-01') and o_orderdate < date('1993-06-01', '+3 month') and l_returnflag = 'R' and c_nationkey = n_nationkey group by c_custkey, c_name, c_acctbal, c_phone, n_name, c_address, c_comment order by revenue desc;",
	"select ps_partkey, sum(ps_supplycost * ps_availqty) as value from partsupp, supplier, nation where ps_suppkey = s_suppkey and s_nationkey = n_nationkey and n_name = 'UNITED KINGDOM' group by ps_partkey having sum(ps_supplycost * ps_availqty) > ( select sum(ps_supplycost * ps_availqty) * 0.0001000000 from partsupp, supplier, nation where ps_suppkey = s_suppkey and s_nationkey = n_nationkey and n_name = 'UNITED KINGDOM') order by value desc;",
	"select l_shipmode, sum(case when o_orderpriority = '1-URGENT' or o_orderpriority = '2-HIGH' then 1 else 0 end) as high_line_count, sum(case when o_orderpriority <> '1-URGENT' and o_orderpriority <> '2-HIGH' then 1 else 0 end) as low_line_count from orders, lineitem where o_orderkey = l_orderkey and l_shipmode in ('SHIP', 'MAIL') and l_commitdate < l_receiptdate and l_shipdate < l_commitdate and l_receiptdate >= date('1994-01-01') and l_receiptdate < date('1994-01-01', '+1 year') group by l_shipmode order by l_shipmode;",
	"select 100.00 * sum(case when p_type like 'PROMO%' then l_extendedprice * (1 - l_discount) else 0 end) / sum(l_extendedprice * (1 - l_discount)) as promo_revenue from lineitem, part where l_partkey = p_partkey and l_shipdate >= date('1994-04-01') and l_shipdate < date ('1994-04-01', '+1 month');",
	"select c_name, c_custkey, o_orderkey, o_orderdate, o_totalprice, sum(l_quantity) from customer, orders, lineitem where o_orderkey in ( select l_orderkey from lineitem group by l_orderkey having sum(l_quantity) > 315) and c_custkey = o_custkey and o_orderkey = l_orderkey group by c_name, c_custkey, o_orderkey, o_orderdate, o_totalprice order by o_totalprice desc, o_orderdate;",
	"select sum(l_extendedprice* (1 - l_discount)) as revenue from lineitem, part where ( p_partkey = l_partkey and p_brand = 'Brand#34' and p_container in ('SM CASE', 'SM BOX', 'SM PACK', 'SM PKG') and l_quantity >= 7 and l_quantity <= 7 + 10 and p_size between 1 and 5 and l_shipmode in ('AIR', 'AIR REG') and l_shipinstruct = 'DELIVER IN PERSON') or ( p_partkey = l_partkey and p_brand = 'Brand#52' and p_container in ('MED BAG', 'MED BOX', 'MED PKG', 'MED PACK') and l_quantity >= 13 and l_quantity <= 13 + 10 and p_size between 1 and 10 and l_shipmode in ('AIR', 'AIR REG') and l_shipinstruct = 'DELIVER IN PERSON') or ( p_partkey = l_partkey and p_brand = 'Brand#24' and p_container in ('LG CASE', 'LG BOX', 'LG PACK', 'LG PKG') and l_quantity >= 21 and l_quantity <= 21 + 10 and p_size between 1 and 15 and l_shipmode in ('AIR', 'AIR REG') and l_shipinstruct = 'DELIVER IN PERSON'); ",
	"select s_name, s_address from supplier, nation where s_suppkey in ( select ps_suppkey from partsupp where ps_partkey in ( select p_partkey from part where p_name like 'papaya%') and ps_availqty > ( select 0.5 * sum(l_quantity) from lineitem where l_partkey = ps_partkey and l_suppkey = ps_suppkey and l_shipdate >= date('1997-01-01') and l_shipdate < date('1997-01-01', '+1 year'))) and s_nationkey = n_nationkey and n_name = 'GERMANY' order by s_name;",
	"select s_name, count(*) as numwait from supplier, lineitem l1, orders, nation where s_suppkey = l1.l_suppkey and o_orderkey = l1.l_orderkey and o_orderstatus = 'F' and l1.l_receiptdate > l1.l_commitdate and exists ( select * from lineitem l2 where l2.l_orderkey = l1.l_orderkey and l2.l_suppkey <> l1.l_suppkey) and not exists ( select * from lineitem l3 where l3.l_orderkey = l1.l_orderkey and l3.l_suppkey <> l1.l_suppkey and l3.l_receiptdate > l3.l_commitdate) and s_nationkey = n_nationkey and n_name = 'UNITED STATES' group by s_name order by numwait desc, s_name;"
];

var sum_row0 = [];
var sum_row1 = [];
var sum_row2 = [];
var sum_row3 = [];
var sum_row4 = [];
var sum_row5 = [];
var sum_row6 = [];
var sum_row7 = [];
var sum_row8 = [];

var sum_arrays = [sum_row0, sum_row1, sum_row2, sum_row3, sum_row4, sum_row5, sum_row6, sum_row7, sum_row8];

var sum_count = 0;

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

var datasets_idx_map = [[0, 0], [1, 1], [2, 2], [4, 3], [8, 4], [16, 5], [32, 6], [64, 7], [128, 8], [256, 9], [512, 10], [1024, 11], [2048, 12], [4096, 13], [8192, 14], [16348, 15], [32768, 16], [65536, 17], [131072, 18], [262144, 19], [524288, 20], [1048576, 21], [2097152, 22], [4194304, 23], [8388608, 24], [16777216, 25], [33554432, 26], [67108864, 27], [134217728, 28], [268435456, 29], [536870912, 30], [1073741824, 31], [2147483648, 32], [4294967296, 33], [8589934592, 34], [17179869184, 35], [34359738368, 36], [68719476736, 37], [137438953472, 38], [274877906944, 39], [549755813888, 40], [1099511627776, 41]]; //{binary set (by sum), index in datasets[]}

//====================================begin==============================================		  
/*var svg = d3.select("#heatmap").append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		  
var tableLabel = svg.selectAll("tableLabel")
          .data(table_ls)
          .enter().append("text")
            .text(function (d) { return d; })
            .attr("x", 0)
            .attr("y", function (d, i) { return i * gridSize; })
            .style("text-anchor", "end")
            .attr("transform", "translate(" + X_OFFSET + ", " + gridSize / 1.5 + ")");
           
var queryLabel = svg.selectAll("queryLabel")
          .data(query_ls)
          .enter().append("text")
            .text(function(d) { return d; })
            .attr("x", function(d, i) { return i * gridSize; })
            .attr("y", 0)
            .style("text-anchor", "middle")
            .attr("transform", "translate(" + (X_OFFSET + gridSize / 2) + ", 0)");
            //.attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });*/
//=================================end======================================
			
/*var loop_max = 0;
for (j = 0; j < query_no; ++j)
{
	for (k = 0; k < )
}
	
var colorScale = d3.scale.quantile()
          .domain([0, buckets - 1, d3.max(data, function (d) { return d.value; })])
          .range(colors);	*/	  
		  
//var map = svg.selectAll("rect").data(queries).enter();

/*map.append("rect").attr("x", function(d) { return (d.hour - 1) * gridSize; })
	      .attr("y", function(d) { return (d.day - 1) * gridSize; })
	      .attr("rx", 4)
	      .attr("ry", 4)
	      .attr("class", "hour bordered")
	      .attr("width", gridSize)
	      .attr("height", gridSize)
	      .style("fill", colors[0]);*/

function indexClicked(col, curr_idx)
{
	// console.log(curr_idx);
	// console.log(col.idx_id);
	var new_idx = curr_idx + col.idx_id;
	var map_idx = -1;
	
	for (var i = 0; i < DATASETS_SZ; ++i)
	{
		if (datasets_idx_map[i][0] == new_idx)
			map_idx = datasets_idx_map[i][1];
	}
	
	if (map_idx != -1)
		heatmapChart(new_idx, map_idx);	
	else
		d3.select("#err_msg").text("sorry, to be implemented");
}

function cardClicked(entry, curr_idx)
{
	// console.log(curr_idx);
	// console.log(entry.table);
	// console.log(entry.query);
	var table_idx = entry.table - 1;
	var query_idx = entry.query - 1;
	
	var query_tab = d3.select("#query_text");
	var q_thead = query_tab.selectAll("thead");
	var q_tbody = query_tab.selectAll("tbody");
	q_thead.selectAll("tr").remove();
	q_tbody.selectAll("td").remove();

	q_thead = query_tab.append("thead");
	q_tbody = query_tab.append("tbody");
	q_thead.append("tr")
		     .append("th")
		     .text("Query");
	q_tbody.append("td").text(query_text[query_idx]);
	
	
	var col_tab = d3.select("#columns_used");
	var thead = col_tab.selectAll("thead");
	var tbody = col_tab.selectAll("tbody");
	thead.selectAll("tr").remove();
	tbody.selectAll("tr").remove();
	//thead0.exit().remove();
	//tbody0.exit().remove();
	
	//col_tab.append("table");
	thead = col_tab.append("thead");
	tbody = col_tab.append("tbody");

	thead.append("tr")
		     .append("th")
		     .text("Columns");
				 
	var rows = tbody.selectAll("tr")
		     .data(column_ls[table_idx][query_idx])
		     .enter()
		     .append("tr");
		     
	var cells = rows.append("td")
	     .text(function(d) {return d.name;})
	     .on("click", function (d) { indexClicked(d, curr_idx); });
	     
	//cells.exit().remove();
	//rows.exit().remove();
	
}



//.tsv format: table	query	scan_step_num      
var heatmapChart = function(curr_idx, map_idx) {
    var tsvFile = datasets[map_idx];
    var data = datasets_table[tsvFile];

    var colorScale = d3.scale.quantile()
            .domain([0, buckets - 1, d3.max(data, function (d) { return d.scanstep; })])
            .range(colors);

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
        .style("fill", function(d) { return colorScale(d.scanstep); });

    cards.select("title").text(function(d) { return d.scanstep; });
    
    //-----------------------------
    cards.on("click", function(d) {cardClicked(d, curr_idx); });
    //-----------------------------
    
    cards.exit().remove();
    
    //------------------------------
    var curr_idx_tab = d3.select("#current_idx");
    var c_thead = curr_idx_tab.selectAll("thead");
    var c_tbody = curr_idx_tab.selectAll("tbody");
    c_thead.selectAll("tr").remove();
    c_tbody.selectAll("td").remove();

    c_thead = curr_idx_tab.append("thead");
    c_tbody = curr_idx_tab.append("tbody");
    c_thead.append("tr")
	.append("th")
	.text("Current Index");
    
    // console.log(curr_idx);
    // console.log(find_set[2].idx_id);
    // console.log(find_set[2].idx_id & curr_idx);
    if (curr_idx == 0)
    {
	c_tbody.append("td").text(find_set[0].name);
    }
    else
    {
	for (j = 0; j < find_set_sz; ++j)
	{
	    if ((find_set[j].idx_id & curr_idx) != 0)
	    {
		c_tbody.append("td").text(find_set[j].name);
	    }
	}
	
	
	for (j = 0; j < find_set_sz; ++j)
	{
	    var tmp1 = find_set[j].idx_id / 4294967296;
	    var tmp2 = curr_idx / 4294967296;
	    if ((tmp1 & tmp2) != 0)
	    {
		c_tbody.append("td").text(find_set[j].name);
	    }
	}
    }
    //------------------------------

    var colorScale = d3.scale.threshold()
    	    .domain([0, 150, 300, 450, 600, 750, 900, 1050, 1200])
    	    .range([0].concat(colors));
    
    var legend = svg.selectAll(".legend")
            .data(colorScale.domain(), function(d) { return d; });

    legend.enter().append("g")
        .attr("class", "legend");

    legend.append("rect")
        .attr("x", function(d, i) { return legendElementWidth * i; })
        .attr("y", height)
        .attr("width", legendElementWidth)
        .attr("height", gridSize / 2)
        .style("fill", function(d, i) { return colors[i]; });

    legend.append("text")
        .attr("class", "mono")
        .text(function(d) { return "≥ " + Math.round(d); })
        .attr("x", function(d, i) { return legendElementWidth * i; })
        .attr("y", height + gridSize);

    legend.exit().remove();
        
}


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
	
	var heatmap_tab = d3.select("#heatmap");
	heatmap_tab.selectAll("svg").remove();
	
	read_standard(INDEX_AVG); 
      	draw_compare_states(DATASETS_SZ - 1, entry.table, entry.query);
}



function read_standard(map_idx_standard)
{
    var tsvFile_standard = datasets[map_idx_standard];
    var data = datasets_table[tsvFile_standard];
    data.forEach(function(d){
        sum_arrays[d.table][d.query] = d.scanstep;
    });
}

function draw_one_compare_state(map_idx_obj, highlight_table, highlight_query)
{
    var tsvFile = datasets[map_idx_obj];
    var data = datasets_table[tsvFile];
    data.forEach(function(d) {
	d.scanstep_difference = +(d.scanstep-sum_arrays[d.table][d.query]);
    });
    var min_value = d3.min(data, function (d) { 
        var tmp; 
        if (d.scanstep_difference >= 0)
            tmp = Math.log(Math.abs(d.scanstep_difference) + 1);
        else  
            tmp = -Math.log(Math.abs(d.scanstep_difference) + 1);
        return tmp;
    });
    var max_value = d3.max(data, function (d) { 
        var tmp;
        if (d.scanstep_difference >= 0)
            tmp = Math.log(Math.abs(d.scanstep_difference) + 1);
        else  
            tmp = -Math.log(Math.abs(d.scanstep_difference) + 1);
        return tmp;
    });
    var colorScale = d3.scale.linear().domain([min_value, 0, max_value]).range(["red", "white", "blue"]);

    var heatmap = d3.select("#heatmap");
    heatmap.append("tr").append("td").attr("width", 200).attr("height", 50).text(datasets[map_idx_obj]);
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
        .style("stroke-width", function(d) { if (d.query == highlight_query && d.table == highlight_table) return 5; else return null;})
        .style("stroke", function(d) { if (d.query == highlight_query && d.table == highlight_table) return "black"; else return null;})
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
    
    cards.on("click", function(d) {highlight_clicked_card_from_compare(d); });
    
    cards.exit().remove();
}


function draw_compare_states(to_map_idx, highlight_table, highlight_query)
{
	var i;
	for (i = 0; i < to_map_idx; ++i)
	{
		// console.log(to_map_idx);
		// console.log(i);
		draw_one_compare_state(i, highlight_table, highlight_query);
	}
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
    draw_compare_states(DATASETS_SZ - 1, -1, -1);
    
    var button = ["Reset"];
    
    var datasetpicker = d3.selectAll(".dataset-button").data(button).enter()
            .append("input")
            .attr("value", function(d){ return "Dataset " + d; })
            .attr("type", "button")
            .attr("class", "dataset-button")
            .on("click", function(d) {
                heatmapChart(0, 0);
            });	  
}
