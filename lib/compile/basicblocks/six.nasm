section .text
buf1 db 32
buf2 db 4
buf3 db 8
buf4 db 12

global _start
_start:

    mov BYTE [buf1], 61
    add BYTE [buf1], 5
    
    mov eax, 4
    mov ebx, 1
    mov ecx, buf1
    mov edx, 1
    int 80h
    
    

    

