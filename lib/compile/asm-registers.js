/**
 * Created by root on 20.07.14.
 */

    /*
        These are typed registers
        purpose is handling data
        which is numeric and compiled.

        Plain JavaScript Objects which
        can not be inside an ASM.JS context
        will get four external registers
        accessable by some extern void procedure.

        Ten are too much already, i believe.

     */

var r0buf   = ArrayBuffer(8),
    r0d     = new Float64Array(r0buf),
    r0s     = new Float32Array(r0buf),
    r0i32   = new Int32Array(r0buf),
    r0ui32  = new Uint32Array(r0buf),
    r0i16   = new Int16Array(r0buf),
    r0ui16  = new Uint16Array(r0buf),
    r0i8    = new Int8Array(r0buf),
    r0ui8   = new Uint8Array(r0buf);

var r1buf   = ArrayBuffer(8),
    r1d     = new Float64Array(r1buf),
    r1s     = new Float32Array(r1buf),
    r1i32   = new Int32Array(r1buf),
    r1ui32  = new Uint32Array(r1buf),
    r1i16   = new Int16Array(r1buf),
    r1ui16  = new Uint16Array(r1buf),
    r1i8    = new Int8Array(r1buf),
    r1ui8   = new Uint8Array(r1buf);

var r2buf   = ArrayBuffer(8),
    r2d     = new Float64Array(r2buf),
    r2s     = new Float32Array(r2buf),
    r2i32   = new Int32Array(r2buf),
    r2ui32  = new Uint32Array(r2buf),
    r2i16   = new Int16Array(r2buf),
    r2ui16  = new Uint16Array(r2buf),
    r2i8    = new Int8Array(r2buf),
    r2ui8   = new Uint8Array(r2buf);

var r3buf   = ArrayBuffer(8),
    r3d     = new Float64Array(r3buf),
    r3s     = new Float32Array(r3buf),
    r3i32   = new Int32Array(r3buf),
    r3ui32  = new Uint32Array(r3buf),
    r3i16   = new Int16Array(r3buf),
    r3ui16  = new Uint16Array(r3buf),
    r3i8    = new Int8Array(r3buf),
    r3ui8   = new Uint8Array(r3buf);

var r4buf   = ArrayBuffer(8),
    r4d     = new Float64Array(r4buf),
    r4s     = new Float32Array(r4buf),
    r4i32   = new Int32Array(r4buf),
    r4ui32  = new Uint32Array(r4buf),
    r4i16   = new Int16Array(r4buf),
    r4ui16  = new Uint16Array(r4buf),
    r4i8    = new Int8Array(r4buf),
    r4ui8   = new Uint8Array(r4buf);


var r5buf   = ArrayBuffer(8),
    r5d     = new Float64Array(r5buf),
    r5s     = new Float32Array(r5buf),
    r5i32   = new Int32Array(r5buf),
    r5ui32  = new Uint32Array(r5buf),
    r5i16   = new Int16Array(r5buf),
    r5ui16  = new Uint16Array(r5buf),
    r5i8    = new Int8Array(r5buf),
    r5ui8   = new Uint8Array(r5buf);


var r6buf   = ArrayBuffer(8),
    r6d     = new Float64Array(r6buf),
    r6s     = new Float32Array(r6buf),
    r6i32   = new Int32Array(r6buf),
    r6ui32  = new Uint32Array(r6buf),
    r6i16   = new Int16Array(r6buf),
    r6ui16  = new Uint16Array(r6buf),
    r6i8    = new Int8Array(r6buf),
    r6ui8   = new Uint8Array(r6buf);


var r7buf   = ArrayBuffer(8),
    r7d     = new Float64Array(r7buf),
    r7s     = new Float32Array(r7buf),
    r7i32   = new Int32Array(r7buf),
    r7ui32  = new Uint32Array(r7buf),
    r7i16   = new Int16Array(r7buf),
    r7ui16  = new Uint16Array(r7buf),
    r7i8    = new Int8Array(r7buf),
    r7ui8   = new Uint8Array(r7buf);


var r8buf   = ArrayBuffer(8),
    r8d     = new Float64Array(r8buf),
    r8s     = new Float32Array(r8buf),
    r8i32   = new Int32Array(r8buf),
    r8ui32  = new Uint32Array(r8buf),
    r8i16   = new Int16Array(r8buf),
    r8ui16  = new Uint16Array(r8buf),
    r8i8    = new Int8Array(r8buf),
    r8ui8   = new Uint8Array(r8buf);


var r9buf   = ArrayBuffer(8),
    r9d     = new Float64Array(r9buf),
    r9s     = new Float32Array(r9buf),
    r9i32   = new Int32Array(r9buf),
    r9ui32  = new Uint32Array(r9buf),
    r9i16   = new Int16Array(r9buf),
    r9ui16  = new Uint16Array(r9buf),
    r9i8    = new Int8Array(r9buf),
    r9ui8   = new Uint8Array(r9buf);


/*

    How to do Mod/RM encoding


    We have ten registers...

    Ok, without taking the CPU manual:

    two bits for the kind of only one operand
    three bits will duplicate the number, so

    dont use
    01 = Register = putting/getting the data into the above
    10 = Memory = HEAPxx Address for the data
    11 = Immediate = Compiled into the Bytecode

    use:
    ----  dest ----- src ----
    000 = register-register
    010 = register-memory
    011 = register-immediate
    100 = memory-register
    101 = memory-memory
    110 = memory-immediate


    Next i need to encode the register number
    and the addresses

    000 - needs to register numbers

    000 000 000     = 9 bits?






 */
