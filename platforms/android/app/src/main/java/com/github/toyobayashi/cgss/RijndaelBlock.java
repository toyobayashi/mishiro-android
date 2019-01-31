package com.github.toyobayashi.cgss;

import android.util.Base64;

public class RijndaelBlock {
    private static final int[] SIZES = { 16, 24, 32 };
    private static final String[] MODES = { "ecb", "cbc" };

    private int[] key;
    private int keySize;
    private String mode;

    public RijndaelBlock(String key, String mode) {
        int keySize = key.length();

        if(!RijndaelUtil.arrayIncludes(SIZES, keySize))
            throw new Error("Unsupported key size: " + (keySize * 8) + " bit");

        if(!RijndaelUtil.arrayIncludes(MODES, mode))
            throw new Error("Unsupported mode: " + mode);

        this.key = RijndaelUtil.toArray(key);
        this.keySize = keySize;
        this.mode = mode;
    }

    private int checkBlockSize(int blockSize) {
        if (blockSize <= 32 && !RijndaelUtil.arrayIncludes(SIZES, blockSize)) {
            throw new Error("Unsupported block size: " + (blockSize * 8) + " bit");
        } else if (32 < blockSize) {
            blockSize /= 8;
            if(!RijndaelUtil.arrayIncludes(SIZES, blockSize))
                throw new Error("Unsupported block size: " + blockSize + " bit");
        }
        return blockSize;
    }

    public byte[] encrypt(String _plaintext, int blockSize, String _iv) {

        blockSize = checkBlockSize(blockSize);

        if(this.mode.equals("cbc")) {

            if(_iv.length() != blockSize)
                throw new Error("IV size should match with block size (" + (blockSize * 8) + " bit)");
        }

        int[] plaintext = RijndaelUtil.toArray(_plaintext);
        int padLength = plaintext.length % blockSize;
        if(padLength != 0) padLength = blockSize - padLength;
        while(padLength-- > 0) {
            plaintext = RijndaelUtil.arrayPush(plaintext, 0);
        }

        int blockCount = plaintext.length / blockSize;
        int[] ciphertext = new int[plaintext.length];

        Rijndael cipher = new Rijndael(this.key);

        switch(this.mode) {
            case "ecb":
                for(int i = 0 ; i < blockCount ; i++) {
                    int start = i * blockSize, end = (i + 1) * blockSize;
                    int[] block = RijndaelUtil.arraySlice(plaintext, start, end);

                    int[] encrypted = cipher.encrypt(block);
                    for(int j = 0 ; j < blockSize ; j++)
                        ciphertext[start + j] = encrypted[j];
                }

                break;

            case "cbc":
                int[] iv = RijndaelUtil.toArray(_iv);

                for(int i = 0 ; i < blockCount ; i++) {
                    int start = i * blockSize, end = (i + 1) * blockSize;
                    int[] block = RijndaelUtil.arraySlice(plaintext, start, end);

                    for(int j = 0 ; j < blockSize ; j++) block[j] ^= iv[j];

                    int[] encrypted = cipher.encrypt(block);
                    for(int j = 0 ; j < blockSize ; j++)
                        ciphertext[start + j] = encrypted[j];

                    iv = RijndaelUtil.arraySlice(encrypted);
                }

                break;
        }

        return RijndaelUtil.bufferFrom(ciphertext);
        // return ciphertext;
    }

    public byte[] decrypt(String _ciphertext, int blockSize, String _iv) {
        byte[] ciphertext = Base64.decode(_ciphertext, Base64.DEFAULT);
        return decrypt(ciphertext, blockSize, _iv);
    }

    public byte[] decrypt(byte[] _ciphertext, int blockSize, String _iv) {
        int[] ciphertext = RijndaelUtil.toArray(_ciphertext);
        return decrypt(ciphertext, blockSize, _iv);
    }

    public byte[] decrypt(int[] _ciphertext, int blockSize, String _iv) {

        blockSize = checkBlockSize(blockSize);

        if(this.mode.equals("cbc")) {
            if(_iv.length() != blockSize)
                throw new Error("IV size should match with block size (" + (blockSize * 8) + " bit)");
        }


        int[] ciphertext = RijndaelUtil.toArray(_ciphertext);
        if(ciphertext.length % blockSize != 0)
            throw new Error("Ciphertext length should be multiple of " + (blockSize * 8) + " bit");

        int blockCount = ciphertext.length / blockSize;
        int[] plaintext = new int[ciphertext.length];

        Rijndael cipher = new Rijndael(this.key);

        switch(this.mode) {
            case "ecb":
                for(int i = 0 ; i < blockCount ; i++) {
                    int start = i * blockSize, end = (i + 1) * blockSize;
                    int[] block = RijndaelUtil.arraySlice(ciphertext, start, end);

                    int[] decrypted = cipher.decrypt(block);
                    for(int j = 0 ; j < blockSize ; j++)
                        plaintext[start + j] = decrypted[j];
                }

                break;

            case "cbc":
                int[] iv = RijndaelUtil.toArray(_iv);

                for(int i = 0 ; i < blockCount ; i++) {
                    int start = i * blockSize, end = (i + 1) * blockSize;
                    int[] block = RijndaelUtil.arraySlice(ciphertext, start, end);

                    int[] decrypted = cipher.decrypt(block);
                    for(int j = 0 ; j < blockSize ; j++)
                        plaintext[start + j] = decrypted[j] ^ iv[j];

                    iv = RijndaelUtil.arraySlice(block);
                }

                break;
        }

        return RijndaelUtil.bufferFrom(plaintext);
        // return plaintext;
    }
}
