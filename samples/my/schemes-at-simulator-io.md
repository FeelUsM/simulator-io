- http://simulator.io/board/AWZpw7Fy3I/1067    исходный процессор с асинхронными тактовыми генераторами

- http://simulator.io/board/AWZpw7Fy3I/1049    всё переместил вправо
- http://simulator.io/board/AWZpw7Fy3I/1050    output перенёс налево
- http://simulator.io/board/AWZpw7Fy3I/1052    input перенести налево  
                        добавить NOP
- http://simulator.io/board/AWZpw7Fy3I/1053    сделать чтобы во всех шинах младший разряд был либо справа либо сверху  
                        регистр B паренести налево
- http://simulator.io/board/AWZpw7Fy3I/1055    сделать команду с двумя параметрами
- http://simulator.io/board/AWZpw7Fy3I/1056    увеличить ROM
- http://simulator.io/board/AWZpw7Fy3I/1057    вывел линии
- http://simulator.io/board/AWZpw7Fy3I/1058    переделать jmp в ljmp
- http://simulator.io/board/AWZpw7Fy3I/1059    подготовил регистр B к копированию
- http://simulator.io/board/AWZpw7Fy3I/1060    и 16 регистров с экранами
- http://simulator.io/board/AWZpw7Fy3I/1061    
- https://simulator.io/board/AWZpw7Fy3I/1061    добавил JC
- http://simulator.io/board/AWZpw7Fy3I/1064    демультиплексоры рулят
- http://simulator.io/board/AWZpw7Fy3I/1065    поправил обновление адреса команды
- http://simulator.io/board/AWZpw7Fy3I/1066    добавил асинхронне тактовые генераторы

- http://simulator.io/board/stl78lG7UB/2      простой демультиплексор
- http://simulator.io/board/stl78lG7UB/3      компактный демултиплексор
- http://simulator.io/board/stl78lG7UB/4      остается правильно сделать счётчик
- http://simulator.io/board/stl78lG7UB/5      сделал счётчик
- http://simulator.io/board/stl78lG7UB/6      проверил, работает на периоде 3
- http://simulator.io/board/stl78lG7UB/8      быстрая инициализация
- выровнять регистр А

------------------------------
сравнение двух чисел (максимум)
```
00  0  in
01  3  swap b0
02  0
03  0  in
04  5  sub b0
05  0
06  d  jc met
07  f
08  0
09  4  add b0
0a  0
0b  1  out
0c  a  jmp 0
0d  0
0e  0
met:
0f  4  add b0
10  0
11  3  swap b0
12  0
13  1  out
14  a  jmp 0
15  0
16  0
```
- http://simulator.io/board/AWZpw7Fy3I/1062    поправил carry flag для вычитания

---------------------------
алгоритм евклида
```
00  0  in
01  3  swap b0
02  0
03  0  in
  start:
04  5  sub b0
05  0
06  b  jz end
07  6
08  1
09  d  jc sw
0a  f
0b  0
0c  a  jmp start
0d  4
0e   0
    sw:
0f  4  add b0
10  0
11  3  swap b0
12  0
13  a  jmp start
14  4
15  0
    end:
16  4  add b0
17  0
18  1  out
19  a  jmp 0
1a  0
1b  0
```
http://simulator.io/board/AWZpw7Fy3I/1063

---------------------------------
умножение
```
00  0  in
01  3  swap b0
02  0
03  0  in
  start:


  
---------------------------------
ввод 4 цифр
000  2  mov 1
001  1
002  3  swap 15
003  15
004  2  mov 10
005  10
006  3  swap 14
007  14
  start_row0:
008  0  in
009  5  sub b14 ; 10
010  14
011  b  jz start_row1
012  14
013  1
014  d  jc operation
015  4
016  3
017  4  add b14 ; 10
018  14
019  3  swap b0
020  0
021  3  swap b1
022  1
023  3  swap b2
024  2
025  3  swap b3
026  3
027  a  jmp start_row0
028  8
029  0
  start_row1:
030  0  in
031  5  sub b14 ; 10
200  14
201  b  jz start_row0
202  8
203  0
204  d  jc operation
205  4
206  3
207  4  add b14 ; 10
208  14
209  3  swap b4
210  4
211  3  swap b5
212  5
213  3  swap b6
214  6
215  3  swap b7
216  7
217  a  jmp start_row1
218  14
219  1
  operation:
220  1  out
221  a  jmp start_row0
222  8
223  0
```
перевод 4значного дес. числа в двоичное
перевод двоичного в 4значного дес. числа
