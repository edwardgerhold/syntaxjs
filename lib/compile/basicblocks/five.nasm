section .text

str1 db "Die PID ist: ", 0
str1len equ $-str1-1

global _start
_start:

    mov eax,  20	; sys_getpid
    int 80h
    
    push eax
    mov eax, 4
    mov ebx, 1
    mov ecx, str1
    mov edx, str1len

    pop eax
    mov ecx, eax
    mov edx, 4
    mov eax, 4
    mov ebx, 1
    int 80h
    

