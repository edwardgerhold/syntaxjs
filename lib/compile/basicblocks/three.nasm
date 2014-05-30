section .text
str1 db "Ich bin der Eddie", 13h, 10h, 0
str1len equ $-str1-1
str2 db "Und der Code wird schon lange erwartet", 13h, 10h, 0
str2len equ $-str2-1

inputBuf db 81
inputLen equ 80


WriteLn:
    enter 0,0
    mov ecx, [EBP+0]
    mov ecx, [EBP+str1len]
    ;pop edx
    ;pop ecx
    ; mov ecx, eax
    ; mov edx, ebx
    mov eax, 4
    mov ebx, 1
    int 80h
    leave
    ret 


global _start
_start:
    push str1 ;    mov eax, str1
    push str1len ;    mov ebx, str1len
    call WriteLn
    

