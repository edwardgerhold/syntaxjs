.DATA
str: db "edward macht assembly klar!\n\0"
strlen: equ $-str
.TEXT
.globl _start:
_start:
    push ebp
    sub ebp, 8
    
    mov eax, 4
    mov ebx, 1
    mov ecx, str
    mov edx, strlen
    int 80h
    
    pop ebp
    

    

