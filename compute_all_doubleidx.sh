declare -a column_array=("" "p_partkey" "p_name" "p_mfgr" "p_brand" "p_size" "p_type" "p_container" "p_retailprice" "p_comment" "s_suppkey" "s_name" "s_address" "s_nationkey" "s_phone" "s_acctbal" "s_comment" "ps_partkey" "ps_suppkey" "ps_availqty" "ps_supplycost" "ps_comment" "c_mktsegment" "c_custkey" "c_nationkey" "c_name" "c_acctbal" "c_phone" "c_address" "c_comment" "c_mktsegment" "n_nationkey" "n_regionkey" "n_name" "n_comment" "r_regionkey" "r_name" "r_comment" "l_linenumber" "l_extendedprice" "l_tax" "l_shipinstruct" "l_comment" "l_shipdate" "l_returnflag" "l_linestatus" "l_orderkey" "l_commitdate" "l_receiptdate" "l_suppkey" "l_discount" "l_quantity" "l_shipmode" "l_partkey" "o_custkey" "o_orderkey" "o_orderdate" "o_orderstatus" "o_totalprice" "o_clerk" "o_comment" "o_shippriority" "o_orderpriority")

declare -a index_array=("" "part(p_partkey)" "part(p_mfgr)" "part(p_size)" "part(p_type)" "supplier(s_suppkey)" "supplier(s_nationkey)" "supplier(s_acctbal)" "supplier(s_name)" "partsupp(ps_partkey)" "partsupp(ps_suppkey)" "partsupp(ps_supplycost)" "customer(c_mktsegment)" "customer(c_custkey)" "customer(c_nationkey)" "customer(c_name)" "customer(c_acctbal)" "customer(c_phone)" "customer(c_address)" "customer(c_comment)" "nation(n_nationkey)" "nation(n_regionkey)" "nation(n_name)" "region(r_regionkey)" "region(r_name)" "lineitem(l_shipdate)" "lineitem(l_returnflag)" "lineitem(l_linestatus)" "lineitem(l_orderkey)" "lineitem(l_commitdate)" "lineitem(l_receiptdate)" "lineitem(l_suppkey)" "lineitem(l_discount)" "lineitem(l_quantity)" "lineitem(l_shipmode)" "lineitem(l_partkey)" "orders(o_custkey)" "orders(o_orderkey)" "orders(o_orderdate)" "orders(o_shippriority)" "orders(o_orderpriority)")

#declare -a output_array=("idx_none.tsv" "idx_ppartkey.tsv" "idx_pmfgr.tsv" "idx_psize.tsv" "idx_ptype.tsv" "idx_ssuppkey.tsv" "idx_snationkey.tsv" "idx_sacctbal.tsv" "idx_sname.tsv" "idx_pspartkey.tsv" "idx_pssuppkey.tsv" "idx_pssupplycost.tsv" "idx_cmktsegment.tsv" "idx_ccustkey.tsv" "idx_cnationkey.tsv" "idx_cname.tsv" "idx_cacctbal.tsv" "idx_cphone.tsv" "idx_caddress.tsv" "idx_ccomment.tsv" "idx_nnationkey.tsv" "idx_nregionkey.tsv" "idx_nname.tsv" "idx_rregionkey.tsv" "idx_rname.tsv" "idx_lshipdate.tsv" "idx_lreturnflag.tsv" "idx_llinestatus.tsv" "idx_lorderkey.tsv" "idx_lcommitdate.tsv" "idx_lreceiptdate.tsv" "idx_lsuppkey.tsv" "idx_ldiscount.tsv" "idx_lquantity.tsv" "idx_lshipmode.tsv" "idx_lpartkey.tsv" "idx_ocustkey.tsv" "idx_oorderkey.tsv" "idx_oorderdate.tsv" "idx_oshippriority.tsv" "idx_oorderpriority.tsv")

fn1="idx_"
fn2="_"
fn3=".tsv"

for i in {1..40}
do
for j in {1..40}
do
if [ "$i" != "$j" ]; then
filename=$fn1${column_array[$i]}$fn2${column_array[$j]}$fn3
echo ${index_array[$i]} ${index_array[$j]} to $filename
./test tpch.db sqlite_all_avg.sql $filename ${index_array[$i]} ${index_array[j]}
fi
done
done




