package com.github.toyobayashi.cgss;

class Rijndael {
    private static final int[] SIZES = { 16, 24, 32 };
    private static final int[][] ROUNDS = {
        null,null,null,null,null,null,null,null,
        null,null,null,null,null,null,null,null,
        {
            0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,10,
            0,0,0,0,0,0,0,12,
            0,0,0,0,0,0,0,14
        },
        null,null,null,null,null,null,null,
        {
            0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,12,
            0,0,0,0,0,0,0,12,
            0,0,0,0,0,0,0,14
        },
        null,null,null,null,null,null,null,{
            0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,14,
            0,0,0,0,0,0,0,14,
            0,0,0,0,0,0,0,14
        }
    };

    private static final int[] SBOX = RijndaelPreCalculated.SBOX;
    private static final int[] RCON = RijndaelPreCalculated.RCON;
    private static final int[][] ROW_SHIFT = RijndaelPreCalculated.ROW_SHIFT;

    private static final int[] MUL_02 = RijndaelPreCalculated.MUL2;
    private static final int[] MUL_03 = RijndaelPreCalculated.MUL3;
    private static final int[] MUL_09 = RijndaelPreCalculated.MUL9;
    private static final int[] MUL_11 = RijndaelPreCalculated.MUL11;
    private static final int[] MUL_13 = RijndaelPreCalculated.MUL13;
    private static final int[] MUL_14 = RijndaelPreCalculated.MUL14;

    private int keySize;
    private int[] key;

    Rijndael(String key) {
        int keySize = key.length();

        if(!RijndaelUtil.arrayIncludes(SIZES, keySize)) {
            throw new Error("Unsupported key size: " + (keySize * 8) + "bit");
        }

        this.key = RijndaelUtil.toArray(key);
        this.keySize = keySize;
    }

    Rijndael(int[] key) {
        int keySize = key.length;

        if(!RijndaelUtil.arrayIncludes(SIZES, keySize)) {
            throw new Error("Unsupported key size: " + (keySize * 8) + "bit");
        }

        this.key = RijndaelUtil.toArray(key);
        this.keySize = keySize;
    }

    int[] ExpandKey(int blockSize) {
        int keySize = this.key.length;
        int roundCount = ROUNDS[blockSize][keySize];
        int keyCount = roundCount + 1;
        int[] expandedKey = new int[keyCount * blockSize];

        // First key is original key
        for(int i = 0 ; i < keySize ; i++) expandedKey[i] = this.key[i];

        int rconIndex = 0;

        for(int i = keySize ; i < expandedKey.length ; i += 4) {
            // Take previous word
            int[] temp = RijndaelUtil.arraySlice(expandedKey, i - 4, i);

            // First 4 bytes
            if(i % keySize == 0) {
                // Key Schedule Core
                // 1. Rotate 8 bit left
                // 2. Apply S-box on every byte
                // 3. First byte ^= RCON[rconIndex]
                int[] _temp = {
                    SBOX[temp[1]] ^ RCON[rconIndex],
                    SBOX[temp[2]],
                    SBOX[temp[3]],
                    SBOX[temp[0]]
                };
                temp = _temp;
                // Use next RCON
                rconIndex++;
            }

            // Fill three word
            if(i % keySize < 16) {
                for(int j = 0 ; j < 4 ; j++)
                    expandedKey[i + j] = expandedKey[i - keySize + j] ^ temp[j];
            }

            // End of 128 bit key processing
            if(keySize == 16) continue;

            // For 256 bit key
            if(keySize == 32 && i % keySize == 16) {
                temp[0] = SBOX[temp[0]];
                temp[1] = SBOX[temp[1]];
                temp[2] = SBOX[temp[2]];
                temp[3] = SBOX[temp[3]];

                for(int j = 0 ; j < 4 ; j++)
                    expandedKey[i + j] = expandedKey[i - keySize + j] ^ temp[j];
            }
            // For 192 bit and 256 bit key, fill left one/three blocks
            else {
                for(int j = 0 ; j < 4 ; j++)
                    expandedKey[i + j] = expandedKey[i - keySize + j] ^ temp[j];
            }
        }

        return expandedKey;
    }

    void AddRoundKey(int[] block, int[] key, int keyIndex) {
        int blockSize = block.length;

        for(int i = 0 ; i < blockSize ; i++)
            block[i] ^= key[keyIndex * blockSize + i];
    }

    void SubBytes(int[] block) {
        for(int i = 0 ; i < block.length ; i++)
            block[i] = SBOX[block[i]];
    }

    void SubBytesReversed(int[] block) {
        for(int i = 0 ; i < block.length ; i++)
            block[i] = RijndaelUtil.arrayIndexOf(SBOX, block[i]);
    }

    void ShiftRows(int[] block) {
        int[] output = new int[block.length];

        for(int i = 0 ; i < block.length ; i++)
            output[i] = block[ROW_SHIFT[block.length][i]];

        for(int i = 0 ; i < block.length ; i++)
            block[i] = output[i];
    }

    void ShiftRowsReversed(int[] block) {
        int[] output = new int[block.length];

        for(int i = 0 ; i < block.length ; i++)
            output[i] = block[RijndaelUtil.arrayIndexOf(ROW_SHIFT[block.length], i)];

        for(int i = 0 ; i < block.length ; i++) block[i] = output[i];
    }

    void MixColumns(int[] block) {
        for(int i = 0 ; i < block.length ; i += 4) {
            // b0 = 2a0 + 3a1 + 1a2 + 1a3
            // b1 = 1a0 + 2a1 + 3a2 + 1a3
            // b2 = 1a0 + 1a1 + 2a2 + 3a3
            // b3 = 3a0 + 1a1 + 1a2 + 2a3

            int[] a = new int[4];
            System.arraycopy(block, i, a, 0, 4);

            int[] b = {
                MUL_02[a[0]] ^ MUL_03[a[1]] ^ a[2] ^ a[3],
                a[0] ^ MUL_02[a[1]] ^ MUL_03[a[2]] ^ a[3],
                a[0] ^ a[1] ^ MUL_02[a[2]] ^ MUL_03[a[3]],
                MUL_03[a[0]] ^ a[1] ^ a[2] ^ MUL_02[a[3]]
            };

            block[i] = b[0];
            block[i + 1] = b[1];
            block[i + 2] = b[2];
            block[i + 3] = b[3];
        }
    }

    void MixColumnsReversed(int[] block) {
        for(int i = 0 ; i < block.length ; i += 4) {
            // a0 = 14b0 + 11b1 + 13b2 +  9b3
            // a1 =  9b0 + 14b1 + 11b2 + 13b3
            // a2 = 13b0 +  9b1 + 14b2 + 11b3
            // a3 = 11b0 + 13b1 +  9b2 + 14b3
            int[] b = new int[4];
            System.arraycopy(block, i, b, 0, 4);

            int[] a = {
                MUL_14[b[0]] ^ MUL_11[b[1]] ^ MUL_13[b[2]] ^ MUL_09[b[3]],
                MUL_09[b[0]] ^ MUL_14[b[1]] ^ MUL_11[b[2]] ^ MUL_13[b[3]],
                MUL_13[b[0]] ^ MUL_09[b[1]] ^ MUL_14[b[2]] ^ MUL_11[b[3]],
                MUL_11[b[0]] ^ MUL_13[b[1]] ^ MUL_09[b[2]] ^ MUL_14[b[3]]
            };

            block[i] = a[0];
            block[i + 1] = a[1];
            block[i + 2] = a[2];
            block[i + 3] = a[3];
        }
    }

    int[] encrypt(int[] _block) {
        int[] block = RijndaelUtil.toArray(_block);

        int blockSize = block.length;
        int keySize = this.keySize;
        int roundCount = ROUNDS[blockSize][keySize];

        if(!RijndaelUtil.arrayIncludes(SIZES, blockSize))
            throw new Error("Unsupported block size: " + (blockSize * 8) + "bit");

        // Calculations are made to this state
        int[] state = new int[block.length];
        System.arraycopy(block, 0, state, 0, block.length);

        // Key Expansion
        int[] expandedKey = this.ExpandKey(blockSize);

        // Initial Round
        this.AddRoundKey(state, expandedKey, 0);

        // Rounds
        for(int round = 1 ; round < roundCount ; round++) {
            this.SubBytes(state);
            this.ShiftRows(state);
            this.MixColumns(state);
            this.AddRoundKey(state, expandedKey, round);
        }

        // Final Round
        this.SubBytes(state);
        this.ShiftRows(state);
        this.AddRoundKey(state, expandedKey, roundCount);

        return state;
    }

    int[] decrypt(int[] _block) {
        int[] block = RijndaelUtil.toArray(_block);

        int blockSize = block.length;
        int keySize = this.keySize;
        int roundCount = ROUNDS[blockSize][keySize];

        if(!RijndaelUtil.arrayIncludes(SIZES, blockSize))
            throw new Error("Unsupported block size: " + (blockSize * 8) + "bit");

        // Calculations are made to this state
        int[] state = new int[block.length];
        System.arraycopy(block, 0, state, 0, block.length);

        // Key Expansion
        int[] expandedKey = this.ExpandKey(blockSize);

        // Final Round (Reversed)
        this.AddRoundKey(state, expandedKey, roundCount);
        this.ShiftRowsReversed(state);
        this.SubBytesReversed(state);

        // Rounds (Reversed)
        for(int round = roundCount - 1 ; 1 <= round ; round--) {
            this.AddRoundKey(state, expandedKey, round);
            this.MixColumnsReversed(state);
            this.ShiftRowsReversed(state);
            this.SubBytesReversed(state);
        }

        // Initial Round (Reversed)
        this.AddRoundKey(state, expandedKey, 0);

        return state;
    }
}
