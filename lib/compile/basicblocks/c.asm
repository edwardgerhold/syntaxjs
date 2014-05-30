.data
count:
.byte 0
str:
.ascii "The usual string\n\0\0"

.text
.globl _start
_start:
    jmp print

next:  
    mov count, %eax
    jbe %eax
    jmp exit

print:
    mov $4, %eax
    mov $1, %ebx
    mov $str, %ecx
    mov $17, %edx
    int $0x80
    jmp next

exit:
    mov $0, %ebx
    int $0x80
    