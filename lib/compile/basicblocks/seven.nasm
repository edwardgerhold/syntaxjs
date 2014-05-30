section .text

str1 db "Die PID ist: ", 0
str1len equ $-str1-1

%include "putstr.mac"

global _start
_start:

    putstr str1 str1len
    putstr str1 str1len
    putstr str1 str1len
    putstr str1 str1len
    
    
    
