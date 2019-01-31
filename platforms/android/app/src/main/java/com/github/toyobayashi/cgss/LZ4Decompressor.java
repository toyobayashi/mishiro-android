package com.github.toyobayashi.cgss;

public class LZ4Decompressor {

    public byte[] decompress(byte[] array) {

        int[] lz4IntBuffer = new int[array.length];
        for (int i = 0; i < array.length; i++) {
            lz4IntBuffer[i] = array[i] < 0 ? (array[i] & 0xFF) : array[i];
        }

        BinaryReader r = new BinaryReader(lz4IntBuffer);

        int dataSize = 0;
        int decompressedSize = 0;

        int token = 0;
        int sqSize = 0;
        int matchSize = 0;
        // int litPos = 0;
        int offset = 0;
        int retCurPos = 0;
        int endPos = 0;

        r.seekAbs(4);
        decompressedSize = r.readIntLE();
        dataSize = r.readIntLE();
        endPos = dataSize + 16;
        int[] retArray = new int[decompressedSize];

        r.seekAbs(16);

        // Start reading sequences
        while(true) {
            // Read the LiteralSize and MatchSize
            token = r.readByte();
            sqSize = token >> 4;
            matchSize = (token & 0x0f) + 4;
            if (sqSize == 15) {
                sqSize += readAdditionalSize(r);
            }

            // Copy the literal
            retArray = r.copyBytes(retArray, retCurPos, sqSize);
            retCurPos += sqSize;

            if (r.getPos() >= endPos - 1) {
                break;
            }

            // Read the offset
            offset = r.readShortLE();

            // Read the additional MatchSize
            if (matchSize == 19) {
                matchSize += readAdditionalSize(r);
            }

            // Copy the match properly
            if (matchSize > offset) {
                int matchPos = retCurPos - offset;
                while(true) {
                    System.arraycopy(retArray, matchPos, retArray, retCurPos, offset);
                    retCurPos += offset;
                    matchSize -= offset;
                    if (matchSize < offset) {
                        break;
                    }
                }
            }
            System.arraycopy(retArray, retCurPos - offset, retArray, retCurPos, matchSize);
            retCurPos += matchSize;
        }

        byte[] buff = new byte[retArray.length];
        for (int i = 0; i < retArray.length; i++) {
            buff[i] = (byte) retArray[i];
        }
        return buff;
    }
    private int readAdditionalSize(BinaryReader reader) {
        int size = reader.readByte();
        if (size == 255) {
            return size + readAdditionalSize(reader);
        } else {
            return size;
        }
    }

    private static class BinaryReader {
        private int[] ary;
        private int curPos;
        public BinaryReader(int[] array) {
            ary = array;
            curPos = 0;
        }

        public int readByte() {
            curPos++;
            return ary[curPos - 1];
        }

        public int readShortLE() {
            curPos += 2;
            return ary[curPos - 2] + (ary[curPos - 1] << 8);
        }

        public int readIntLE() {
            curPos += 4;
            return ary[curPos - 4] + (ary[curPos - 3] << 8) + (ary[curPos - 2] << 16) + (ary[curPos - 1] << 24);
        }

        public int[] copyBytes(int[] target, int targetStart, int size) {
            curPos += size;
            System.arraycopy(ary, curPos - size, target, targetStart, size);
            return target;
        }

        public void seekAbs(int pos) {
            curPos = pos;
        }

        public int getPos() {
            return curPos;
        }
    }
}
