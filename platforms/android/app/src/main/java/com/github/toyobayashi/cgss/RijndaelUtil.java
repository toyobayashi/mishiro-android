package com.github.toyobayashi.cgss;

// import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;

class RijndaelUtil {
    private RijndaelUtil() {}

    static int arrayIndexOf(int[] arr, int el) {
        for (int i = 0; i < arr.length; ++i) {
            if (arr[i] == el) {
                return i;
            }
        }
        return -1;
    }

    static int arrayIndexOf(String[] arr, String el) {
        for (int i = 0; i < arr.length; ++i) {
            if (arr[i].equals(el)) {
                return i;
            }
        }
        return -1;
    }

    static boolean arrayIncludes(int[] arr, int el) {
        return RijndaelUtil.arrayIndexOf(arr, el) != -1;
    }

    static boolean arrayIncludes(String[] arr, String el) {
        return RijndaelUtil.arrayIndexOf(arr, el) != -1;
    }

    static int[] arrayPush(int[] arr, int el) {
        int[] newArr = new int[arr.length + 1];
        System.arraycopy(arr, 0, newArr, 0, arr.length);
        newArr[newArr.length - 1] = el;
        return newArr;
    }

    static int[] arraySlice(int[] arr) {
        int[] result = new int[arr.length];
        System.arraycopy(arr, 0, result, 0, arr.length);
        return result;
    }

    static int[] arraySlice(int[] arr, int start, int end) {
        if (end <= start) throw new Error("end <= start");
        int length = end - start;
        int[] result = new int[length];
        System.arraycopy(arr, start, result, 0, length);
        return result;
    }

    static int[] toArray(String value) {
        return toArray(value.getBytes(StandardCharsets.UTF_8));
    }

    static int[] toArray(int[] value) {
        int[] result = new int[value.length];
        System.arraycopy(value, 0, result, 0, value.length);
        return result;
    }

    static int[] toArray(byte[] value) {
        int[] result = new int[value.length];
        for (int i = 0; i < value.length; ++i) {
            if (value[i] < 0) result[i] = (value[i] & 0xFF);
            else result[i] = value[i];
        }
        return result;
    }

    static byte[] bufferFrom(int[] arr) {
        byte[] buff = new byte[arr.length];
        for (int i = 0; i < arr.length; i++) {
            buff[i] = (byte) arr[i];
        }
        return buff;
    }

    /* static byte[] bufferFrom(String str, Charset charset) {
        return str.getBytes(charset);
    }

    static byte[] bufferFrom(String str) {
        return str.getBytes(StandardCharsets.UTF_8);
    } */
}
