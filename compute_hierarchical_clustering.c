//http://linux.die.net/man/3/readdir

#include <stdio.h>
#include <sys/types.h>
#include <dirent.h>
#include <stdlib.h>
#include <string.h>
#include <string>
#include <math.h>
//-----------------------------------
using namespace std;
//-----------------------------------
char **fn_list = (char **)malloc(sizeof(char *) * 100);
int fn_cnt = 0;
const int TABLE_NUM = 8;//8
const int QUERY_NUM = 14;//14
const int STATE_NUM = 53;//41
int record[20][10][60];		//[query][table][state], query from 0, state from 0, table from 1
int cardi[60];	//cardi[i] == how many columns/rows/states are combined to compute the ith average
int orig[60];	//for reconstruct clustering order of states
int new_state_mark = STATE_NUM + 1;
int new_order[60];
int ncnt = 0;

struct combine_rec
{
	int source_1;
	int source_2;
	int dest;
	
	combine_rec()
	{
		source_1 = source_2 = dest = -1;
	}
	
	combine_rec(int s1, int s2, int d)
	{
		source_1 = s1;
		source_2 = s2;
		dest = d;
	}
};

combine_rec mem[5000];
int mcnt = 0;
//-----------------------------------
void output_state(int idx_state, int table_num, int query_num);
//-----------------------------------
void list_filename()
{
	DIR *dp;
	struct dirent *ep;

	dp = opendir ("./");
	if (dp != NULL)
	{
		while (ep = readdir (dp))
		{
			//puts (ep->d_name);
			if (strstr(ep->d_name, ".tsv") != NULL)
			{
				fn_list[fn_cnt] = (char *)malloc(sizeof(char) * 256);
				strcpy(fn_list[fn_cnt], ep->d_name);
				++fn_cnt;
			}
		}
		(void) closedir (dp);
	}
	else
		perror ("Couldn't open the directory");

	return;
}
//----------------------------------
long log_diff(long op1, long op2)
{
	return logl(abs(op1) + 1) - logl(abs(op2) + 1);
}
//----------------------------------
long compute_diff_between_rows(int state_idx, int row_idx1, int row_idx2)
{
	int i, j, k;
	long diff = 0;
	long tmp;
	for (j = 0; j < QUERY_NUM; ++j)
	{
		//tmp = (record[j][row_idx1][state_idx] - record[j][row_idx2][state_idx]) * (record[j][row_idx1][state_idx] - record[j][row_idx2][state_idx]);
		tmp = log_diff(record[j][row_idx1][state_idx], record[j][row_idx2][state_idx]) * log_diff(record[j][row_idx1][state_idx], record[j][row_idx2][state_idx]);
		diff += tmp;
		/*if (tmp > 0)
			diff += tmp;
		else
			diff += (-tmp);*/
		//printf("diff = %ld\n", tmp);
	}
	
	return diff;
}
//----------------------------------
long compute_diff_between_columns(int state_idx, int col_idx1, int col_idx2)
{
	int i, j, k;
	long diff = 0;
	long tmp;
	for (i = 1; i <= TABLE_NUM; ++i)
	{
		tmp = log_diff(record[col_idx1][i][state_idx], record[col_idx2][i][state_idx]) * log_diff(record[col_idx1][i][state_idx], record[col_idx2][i][state_idx]);
		diff += tmp;
		/*if (tmp > 0)
			diff += tmp;
		else
			diff += (-tmp);*/
		//printf("diff = %ld\n", tmp);
	}
	
	return diff;
}
//----------------------------------
int compute_diff_of_one_state(int state_idx, int table_num, int query_num)
{
	int i, j, k;
	int row_diff = 0;
	int sum_diff = 0;
	for (i = 1; i <= table_num - 1; ++i)
	{
		for (j = 0; j < query_num; ++j)
		{
			row_diff = compute_diff_between_rows(state_idx, i, i+1);
			sum_diff += row_diff;
		}
	}
	
	return sum_diff;
}
//----------------------------------
int compute_diff_between_states(int idx_state1, int idx_state2, int query_num, int table_num)
{
	int i, j, k;
	int diff = 0;
	int tmp_diff = 0;
	for (i = 1; i <= table_num; ++i)
	{
		for (j = 0; j < query_num; ++j)
		{
			tmp_diff = (record[j][i][idx_state1] - record[j][i][idx_state2]);
			diff += (tmp_diff > 0 ? tmp_diff : -tmp_diff);
		}
	}
	
	return diff;
}
//----------------------------------
int compute_diff_of_all_state(int table_num, int query_num)
{
	int i, j, k;
	int state_diff = 0;
	int sum_diff = 0;
	for (k = 0; k < STATE_NUM; ++k)
	{
		state_diff = compute_diff_of_one_state(k, table_num, query_num);
		sum_diff += state_diff;
	}
	
	return sum_diff;
}
//----------------------------------
int combine_two_rows(int idx_row1, int idx_row2, int row_num) //row2 should always larger than row1, return idx of the new row
{
	int tmp_rec[14];
	int i, j, k;
	for (k = 0; k < STATE_NUM; ++k)
	{
		for (j = 0; j < QUERY_NUM; ++j)
		{
			//avg link
			tmp_rec[j] = (record[j][idx_row1][k] * cardi[idx_row1] + record[j][idx_row2][k] * cardi[idx_row2]) / (cardi[idx_row1] + cardi[idx_row2]);
			
			//min link
			//tmp_rec[j] = (record[j][idx_row1][k] > record[j][idx_row2][k]) ? record[j][idx_row2][k] : record[j][idx_row1][k];
		}

		printf("\nCombination:\n");
		output_state(k, row_num, QUERY_NUM);
		for (i = 1; i <= row_num; ++i)
		{
			if (i > idx_row1 && i < idx_row2)
			{
				for (j = 0; j < QUERY_NUM; ++j)
				{
					record[j][i-1][k] = record[j][i][k];
				}
			}
			else if (i > idx_row2)
			{
				for (j = 0; j < QUERY_NUM; ++j)
				{
					record[j][i-2][k] = record[j][i][k];
				}
			}
		}
		for (j = 0; j < QUERY_NUM; ++j)
		{
			record[j][row_num-1][k] = tmp_rec[j];
		}
		printf("after combine\n");
		output_state(k, row_num-1, QUERY_NUM);
	}
	return row_num-1;

}
//----------------------------------
int combine_two_columns(int idx_col1, int idx_col2, int col_num) //row2 should always larger than row1, return idx of the new row
{
	int tmp_rec[14];
	int i, j, k;
	for (k = 0; k < STATE_NUM; ++k)
	{
		for (i = 1; i <= TABLE_NUM; ++i)
		{
			//avg link
			tmp_rec[i] = (record[idx_col1][i][k] * cardi[idx_col1] + record[idx_col2][i][k] * cardi[idx_col2]) / (cardi[idx_col1] + cardi[idx_col2]);
			
			//min link
			//tmp_rec[i] = (record[idx_col1][i][k] > record[idx_col2][i][k]) ? record[idx_col2][i][k] : record[idx_col1][i][k];
			
			//max link
			//tmp_rec[i] = (record[idx_col1][i][k] < record[idx_col2][i][k]) ? record[idx_col2][i][k] : record[idx_col1][i][k];
			
			//printf("idx_col1 = %d, idx_col2 = %d, rec_col1 = %d, rec_col2 = %d, new rec = %d\n", idx_col1, idx_col2, record[idx_col1][i][k], record[idx_col2][i][k], tmp_rec[i]);
			//output_state(k, TABLE_NUM, col_num);
		}

		for (j = 0; j < col_num; ++j)
		{
			if (j > idx_col1 && j < idx_col2)
			{
				//output_state(k, TABLE_NUM, col_num);
				for (i = 1; i <= TABLE_NUM; ++i)
				{
					record[j-1][i][k] = record[j][i][k];
					//printf("after combine\n");
					//output_state(k, TABLE_NUM, col_num);
				}
			}
			else if (j > idx_col2)
			{
				for (i = 1; i <= TABLE_NUM; ++i)
				{
					record[j-2][i][k] = record[j][i][k];
				}
			}
		}
		for (i = 1; i <= TABLE_NUM; ++i)
		{
			record[col_num-2][i][k] = tmp_rec[i];
		}
		//printf("after combine\n");
		//output_state(k, TABLE_NUM, col_num);
	}
	
	return col_num-2;

}
//----------------------------------
int combine_two_states(int idx_state1, int idx_state2, int state_num)
{
	printf("combining state %d(%d) and state %d(%d) to state %d(%d)\n", idx_state1, orig[idx_state1], idx_state2, orig[idx_state2], state_num-2, new_state_mark);
	mem[mcnt] = combine_rec(orig[idx_state1], orig[idx_state2], new_state_mark);
	mcnt++;
	
	int tmp_rec[QUERY_NUM][TABLE_NUM+1];
	int i, j, k;
	for (j = 0; j < QUERY_NUM; ++j)
	{
		for (i = 1; i <= TABLE_NUM; ++i)
		{
			//avg link
			tmp_rec[j][i] = (record[j][i][idx_state1] * cardi[idx_state1] + record[j][i][idx_state2] * cardi[idx_state2]) / (cardi[idx_state1] + cardi[idx_state2]);
			
			//min link
			//tmp_rec[i] = (record[idx_col1][i][k] > record[idx_col2][i][k]) ? record[idx_col2][i][k] : record[idx_col1][i][k];
			
			//max link
			//tmp_rec[i] = (record[idx_col1][i][k] < record[idx_col2][i][k]) ? record[idx_col2][i][k] : record[idx_col1][i][k];
			
			//printf("idx_col1 = %d, idx_col2 = %d, rec_col1 = %d, rec_col2 = %d, new rec = %d\n", idx_col1, idx_col2, record[idx_col1][i][k], record[idx_col2][i][k], tmp_rec[i]);
			//output_state(k, TABLE_NUM, col_num);
		}
	}
	
	for (k = 0; k < STATE_NUM; ++k)
	{
		if (k > idx_state1 && k < idx_state2)
		{
			for (i = 1; i <= TABLE_NUM; ++i)
			{
				for (j = 0; j < QUERY_NUM; ++j)
				{
					record[j][i][k-1] = record[j][i][k];
				}
			}
			orig[k-1] = orig[k];
		}
		else if (k > idx_state2)
		{
			for (i = 1; i <= TABLE_NUM; ++i)
			{
				for (j = 0; j < QUERY_NUM; ++j)
				{
					record[j][i][k-2] = record[j][i][k];
				}
			}
			orig[k-2] = orig[k];
		}
	}
	
	for (i = 1; i <= TABLE_NUM; ++i)
	{
		for (j = 0; j < QUERY_NUM; ++j)
		{
			record[j][i][state_num-2] = tmp_rec[j][i];
		}
	}
	orig[state_num-2] = new_state_mark++;
	
	return state_num-2;
}
//----------------------------------
void output_state(int idx_state, int table_num, int query_num)
{
	int i, j;
	for (i = 1; i <= table_num; ++i)
	{
		for (j = 0; j < query_num; ++j)
		{
			printf("%d\t", record[j][i][idx_state]);
		}
		printf("\n");
	}
}
//----------------------------------
void print_mem_dfs(int curr_idx)
{
	int i = -1;
	
	if (curr_idx <= STATE_NUM)
	{
		printf("%d  ", curr_idx);
		new_order[ncnt] = curr_idx;
		++ncnt;
		return;
	}
	else
	{
		for (i = 0; i < mcnt; ++i)
		{
			if (mem[i].dest == curr_idx)
				break;
		}
		print_mem_dfs(mem[i].source_1);
		print_mem_dfs(mem[i].source_2);
		return;
	}
}
//----------------------------------
void output_state_reorder()
{
	FILE *in = fopen("datasets.txt", "r");
	char buff[100];
	char datasets[60][100];
	int cnt = 0;
	if (!in)
	{
		printf("open file error\n");
		return;
	}
	
	while(fscanf(in, "%s\n", buff) == 1)
	{
		strcpy(datasets[cnt], buff);
		printf("buff = %s\n", buff);
		++cnt;
	}
	fclose(in);
	
	FILE *out = fopen("datasets_reorder.txt", "w+");
	if (!out)
	{
		printf("open file error\n");
		return;
	}
	
	int i;
	for (i = 0; i < mcnt; ++i)
	{
		int j = new_order[i];
		printf("%s\n", datasets[j]);
	}
	
	return;
	
}
//----------------------------------
int main()
{
	FILE *fp;
	int tmpi, tmpj, tmp_step;
	char *tmps = (char *)malloc(sizeof(char) * 20);
	
	
	list_filename();
	
	int i, j, k, l;
	for (i = 0; i < 50; ++i)
		cardi[i] = 1;
		
	for (i = 1; i <= TABLE_NUM; ++i)
	{
		for (j = 0; j < QUERY_NUM; ++j)
		{
			for (k = 0; k < STATE_NUM; ++k)
			{
				record[j][i][k] = 0;
				orig[k] = k;
			}
		}
	}
	
	
	//---------for-debug-begin----------
	//strcpy(fn_list[0], "idx_none.tsv");
	//fn_cnt = 1;
	//---------for-debug-end------------
	
	for (l = 0; l < fn_cnt; ++l)
	{
		fp = fopen(fn_list[l], "r");
		if (fp == NULL)
		{
			printf("open file error: %s\n", fn_list[l]);
			return 0;
		}
		
		fscanf(fp, "%s	%s	%s\n", tmps, tmps, tmps);
		for (i = 1; i <= TABLE_NUM; ++i)
		{
			for (j = 0; j < QUERY_NUM; ++j)
			{
				fscanf(fp, "%d	%d	%d\n", &tmpi, &tmpj, &tmp_step);
				record[j][i][l] = tmp_step;
				//if (i == 7 && j == 8)
				//	printf("%s: %d\n", fn_list[l], tmp_step);
			}
		}
		fclose(fp);
	}
	
	
	//============row=clustering=begin=================
	/*long tmp_diff, curr_diff;
	long min_diff;
	int min_row1, min_row2, min_new;
	int table_num = TABLE_NUM;
	int query_num = QUERY_NUM;
	int co_idx = 0;
	int r_cnt = 0;
	
	//int state_num = STATE_NUM;
	
	while (table_num > 1)
	{
		++r_cnt;
		printf("#####Round %d starts#####\n", r_cnt);
		min_diff = 100000000000000;
		for (i = 1; i <= table_num; ++i)
		{
			for (j = i + 1; j <= table_num; ++j)
			{
				tmp_diff = 0;
				for (k = 0; k < STATE_NUM; ++k)
				{
					curr_diff = compute_diff_between_rows(k, i, j);
					tmp_diff += curr_diff;
					printf("diff(%d, %d)=%ld, total_diff(%d, %d)=%ld\n", i, j, curr_diff, i, j, tmp_diff);
					
				}
			
				if (tmp_diff < min_diff)
				{
					min_diff = tmp_diff;
					min_row1 = i;
					min_row2 = j;
					printf("row1: %d, row2: %d, diff: %ld\n", i, j, tmp_diff);
				}
			}
		}
	
		//output_state(0, table_num, query_num);
		min_new = combine_two_rows(min_row1, min_row2, table_num);
		cardi[min_new] = cardi[min_row1] + cardi[min_row2];
		table_num--;
		
		printf("combine row %d and row %d to row %d\n", min_row1, min_row2, min_new);
		
		printf("\n#####Round %d ends#####\n\n\n", r_cnt);
	}
	*/
	//============row=clustering=end===========================
	
	
	
	//++++++++++++column+clustering+begin+++++++++++++++++++++
	/*long tmp_diff;
	long min_diff;
	int min_col1, min_col2, min_new;
	int table_num = TABLE_NUM;
	int query_num = QUERY_NUM;
	int co_idx = 0;
	
	//int state_num = STATE_NUM;
	
	while (query_num > 1)
	{
		min_diff = 10000000000000;
		for (i = 0; i < query_num; ++i)
		{
			for (j = i + 1; j < query_num; ++j)
			{
				tmp_diff = 0;
				for (k = 0; k < STATE_NUM; ++k)
				{
					tmp_diff += compute_diff_between_columns(k, i, j);
				}
			
				if (tmp_diff < min_diff)
				{
					min_diff = tmp_diff;
					min_col1 = i;
					min_col2 = j;
					//printf("row1: %d, row2: %d, diff: %d\n", i, j, tmp_diff);
				}
			}
		}
	
		//output_state(0, table_num, query_num);
		min_new = combine_two_columns(min_col1, min_col2, query_num);
		cardi[min_new] = cardi[min_col1] + cardi[min_col2];
		query_num--;
		
		printf("combine column %d and column %d to column %d\n", min_col1, min_col2, min_new);
	}*/
	//++++++++++++column+clustering+end+++++++++++++++++++++++
	
	
	//~~~~~~~~~~~~~~state~clustering~begin~~~~~~~~~~~~~~~~~~~~
	long tmp_diff;
	long min_diff;
	int min_sta1, min_sta2, min_new;
	int table_num = TABLE_NUM;
	int query_num = QUERY_NUM;
	int state_num = STATE_NUM;
	 
	while (state_num > 1)
	{	
		//printf("state_num = %d\n", state_num);
		min_diff = 10000000000000;
		for (i = 0; i < state_num; ++i)
		{
			for (j = i + 1; j < state_num; ++j)
			{
				tmp_diff = compute_diff_between_states(i, j, QUERY_NUM, TABLE_NUM);
				if (tmp_diff < min_diff)
				{
					min_diff = tmp_diff;
					min_sta1 = i;
					min_sta2 = j;
					//printf("min_sta = %d, %d\n", min_sta1, min_sta2);
				}
				
			}
		}
		min_new = combine_two_states(min_sta1, min_sta2, state_num);
		cardi[min_new] = cardi[min_sta1] + cardi[min_sta2];
		state_num--;
		
		//printf("combine state %d(%d) and state %d(%d) to state %d\n", min_sta1, orig[min_sta1], min_sta2, orig[min_sta2], min_new);
	}
	
	print_mem_dfs(mcnt + STATE_NUM);
	output_state_reorder();
	//~~~~~~~~~~~~~~~state~clustering~end~~~~~~~~~~~~~~~~~~~~~
	
	
	return 0;
}




