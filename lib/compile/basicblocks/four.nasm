section .text
str1 db "Ich bin der Eddie", 13h, 10h, 0
str1len equ $-str1-1
str2 db "Und der Code wird schon lange erwartet", 13h, 10h, 0
str2len equ $-str2-1

inputBuf db 81
inputLen equ 10


WriteLn:
    enter 0,0
    mov ecx, eax
    mov edx, ebx
    mov eax, 4
    mov ebx, 1
    int 80h
    leave
    ret 

ReadLn:
    enter 0, 0
    mov eax, 3	; 3 = sys_read
    mov ebx, 0	; 0 = stdin
    mov ecx, inputBuf
    mov edx, inputLen
    int 80h
    leave
    ret

global _start
_start:
    call ReadLn    
    mov eax, inputBuf
    mov ebx, inputLen
    call WriteLn
    

