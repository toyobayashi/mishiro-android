1. `util.h` 

    ``` cpp
    // extern ieee754_float32_t fast_log2(ieee754_float32_t x);
    extern float fast_log2(float x);
    ```

2. `id3tag.c` & `machine.h`

    ``` cpp
    /* # ifndef HAVE_STRCHR
    #  define strchr index
    #  define strrchr rindex
    # endif */
    char   *strchr(), *strrchr();
    /*# ifndef HAVE_MEMCPY
    #  define memcpy(d, s, n) bcopy ((s), (d), (n))
    #  define memmove(d, s, n) bcopy ((s), (d), (n))
    # endif */
    ```

3. `fft.c`

    ``` cpp
    // #include "vector/lame_intrin.h"
    ```

4. `set_get.h`

    ``` cpp
    // #include <lame.h>
    #include "lame.h"
    ```
