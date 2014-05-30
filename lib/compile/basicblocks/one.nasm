section .text
str1 db "Ich bin der Eddie", 13h, 0
str1len equ $-str1-1
str2 db "Und der Code wird schon lange erwartet", 13h, 0
str2len equ $-str2-1

global _start
_start:

    mov eax, 4
    mov ebx, 1,
    mov ecx, str1
    mov edx, str1len
    int 80h

    
    
    


