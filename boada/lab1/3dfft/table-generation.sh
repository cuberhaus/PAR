#!/bin/bash

cp modelfactors.out modelfactors.tex
sed -i -e 's/|/\&/g' -e 's/--//g' -e 's/average/average us/g' -e 's/%/\\\\%/g'  modelfactors.tex

TABLE_1="table1.tex"
TABLE_2="table2.tex"
TABLE_3="table3.tex"

echo "\begin{table}[h]" > $TABLE_1
echo "\begin{center}" >> $TABLE_1
tabular_line="\begin{tabular}{|l|"
processors_line="Number of processors"

P=$np_MIN
number_of_columns=1
while (test $P -le $np_MAX)
do
    tabular_line+="c|"
    processors_line+=" & $P"
    if (test $P -eq 1) then
        P=4;
    else
        P=`expr $P + $np_STEP`
    fi
    number_of_columns=`expr $number_of_columns + 1`
done

tabular_line+="}"
echo "$tabular_line" >> $TABLE_1
echo "\hline" >> $TABLE_1

compiled_by="$(date), $(whoami)"

echo "\multicolumn{$number_of_columns}{|c|}{Overview of whole program execution metrics} \\\\" >> $TABLE_1
echo "\hline" >> $TABLE_1
echo "\hline" >> $TABLE_1
echo "$processors_line \\\\" >> $TABLE_1
echo "\hline" >> $TABLE_1

number_of_lines=0
cat modelfactors.tex | while read line
do
   if (test 4 -le $number_of_lines) then
       if (test $number_of_lines -le 6) then
           echo "$line \\\\" >> $TABLE_1
           echo "\hline" >> $TABLE_1
       fi
   fi
   number_of_lines=`expr $number_of_lines + 1`
done
echo "\end{tabular}" >> $TABLE_1
echo "\end{center}" >> $TABLE_1
echo "\caption{ Analysis done on $compiled_by}" >> $TABLE_1
echo "\end{table}" >> $TABLE_1




echo "\begin{table}[h]" > $TABLE_2
echo "\begin{center}" >> $TABLE_2
echo "$tabular_line" >> $TABLE_2
echo "\hline" >> $TABLE_2

parallel_fraction=0
number_of_lines=0
cat modelfactors.tex | while read line
do
#   echo "$number_of_lines: $line"
   if (test 13 -eq $number_of_lines) then
       parallel_fraction_i=0
       for i in $line
       do
          parallel_fraction_i=`expr $parallel_fraction_i + 1`
          if (test $parallel_fraction_i -eq 4 ) then
             echo "\multicolumn{$number_of_columns}{|c|}{Overview of the Efficiency metrics in parallel fraction, \$\\phi\$=$i} \\\\" >> $TABLE_2;
             echo "\hline" >> $TABLE_2;
             echo "\hline" >> $TABLE_2;
             echo "$processors_line \\\\" >> $TABLE_2;
             echo "\hline" >> $TABLE_2
             echo "\hline" >> $TABLE_2
          fi
       done
   fi
   if (test 15 -le $number_of_lines) then
       if (test $number_of_lines -le 22) then
           echo "$line \\\\" >> $TABLE_2
           if (test 15 -eq $number_of_lines) then
              echo "\hline" >> $TABLE_2
              echo "\hline" >> $TABLE_2
           fi
           if (test 16 -eq $number_of_lines) then
              echo "\hline" >> $TABLE_2
           fi
           if (test 18 -eq $number_of_lines) then
              echo "\hline" >> $TABLE_2
              echo "\hline" >> $TABLE_2
           fi
           if (test 19 -eq $number_of_lines) then
              echo "\hline" >> $TABLE_2
           fi
#           echo "$line"
       fi
   fi
   number_of_lines=`expr $number_of_lines + 1`
done
echo "\hline" >> $TABLE_2
echo "\end{tabular}" >> $TABLE_2
echo "\end{center}" >> $TABLE_2
echo "\caption{ Analysis done on $compiled_by}" >> $TABLE_2
echo "\end{table}" >> $TABLE_2


echo "\begin{table}[h]" > $TABLE_3
echo "\begin{center}" >> $TABLE_3
echo "$tabular_line" >> $TABLE_3
echo "\hline" >> $TABLE_3

echo "\multicolumn{$number_of_columns}{|c|}{Statistics about explicit tasks in parallel fraction} \\\\" >> $TABLE_3;
echo "\hline" >> $TABLE_3;
echo "\hline" >> $TABLE_3;
echo "$processors_line \\\\" >> $TABLE_3;
echo "\hline" >> $TABLE_3
echo "\hline" >> $TABLE_3

number_of_lines=0
cat modelfactors.tex | while read line
do
   if (test 29 -le $number_of_lines) then
       if (test $number_of_lines -le 35) then
           echo "$line \\\\" >> $TABLE_3
           echo "\hline" >> $TABLE_3
       fi
   fi
   number_of_lines=`expr $number_of_lines + 1`
done

echo "\end{tabular}" >> $TABLE_3
echo "\end{center}" >> $TABLE_3
echo "\caption{ Analysis done on $compiled_by}" >> $TABLE_3
echo "\end{table}" >> $TABLE_3



rm modelfactors.tex
rm modelfactors_tmp.tex

