# values={1..50}
values=($(seq 1 1 50))

for i in "${values[@]}"
do
    echo $i
done
