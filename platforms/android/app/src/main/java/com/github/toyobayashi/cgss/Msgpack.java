package com.github.toyobayashi.cgss;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.msgpack.core.MessageBufferPacker;
import org.msgpack.core.MessageFormat;
import org.msgpack.core.MessagePack;
import org.msgpack.core.MessageUnpacker;
import org.msgpack.value.ArrayValue;
import org.msgpack.value.FloatValue;
import org.msgpack.value.IntegerValue;
import org.msgpack.value.MapValue;
import org.msgpack.value.Value;

import java.io.IOException;
import java.lang.reflect.Array;
import java.math.BigInteger;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

public class Msgpack {
    private Msgpack() {}

    public static byte[] encode(Object data) throws IOException, JSONException {
        MessageBufferPacker packer = new MessagePack.PackerConfig().withStr8FormatSupport(false).newBufferPacker();
        pack(packer, data);
        packer.close();
        return packer.toByteArray();
    }

    private static void put(JSONArray arr, Value value) throws IOException, JSONException {
        switch (value.getValueType()) {
            case NIL:
                arr.put(JSONObject.NULL);
                break;
            case BOOLEAN:
                arr.put(value.asBooleanValue().getBoolean());
                break;
            case INTEGER:
                IntegerValue iv = value.asIntegerValue();
                if (iv.isInIntRange()) {
                    arr.put(iv.toInt());
                } else if (iv.isInLongRange()) {
                    arr.put(iv.toLong());
                } else {
                    arr.put(iv.toBigInteger());
                }
                break;
            case FLOAT:
                FloatValue fv = value.asFloatValue();
                arr.put(fv.toDouble());
                break;
            case STRING:
                arr.put(value.asStringValue().asString());
                break;
            case BINARY:
                throw new IOException("can not be binary");
            case ARRAY:
                JSONArray newarr = new JSONArray();

                ArrayValue a = value.asArrayValue();
                for (Value e : a) {
                    put(newarr, e);
                }
                arr.put(newarr);
                break;
            case MAP:
                MapValue m = value.asMapValue();
                JSONObject obj = new JSONObject(new LinkedHashMap());
                Set<Map.Entry<Value, Value>> set = m.entrySet();

                for (Map.Entry<Value, Value> e : set) {
                    Value _key = e.getKey();
                    Value _value = e.getValue();
                    put(obj, _key.asStringValue().asString(), _value);
                }
                arr.put(obj);
                break;
            case EXTENSION:
                throw new IOException("can not be extension");
        }
    }

    private static void put(JSONObject object, String key, Value value) throws IOException, JSONException {
        switch (value.getValueType()) {
            case NIL:
                object.put(key, JSONObject.NULL);
                break;
            case BOOLEAN:
                object.put(key, value.asBooleanValue().getBoolean());
                break;
            case INTEGER:
                IntegerValue iv = value.asIntegerValue();
                if (iv.isInIntRange()) {
                    object.put(key, iv.toInt());
                } else if (iv.isInLongRange()) {
                    object.put(key, iv.toLong());
                } else {
                    object.put(key, iv.toBigInteger());
                }
                break;
            case FLOAT:
                FloatValue fv = value.asFloatValue();
                object.put(key, fv.toDouble());
                break;
            case STRING:
                object.put(key, value.asStringValue().asString());
                break;
            case BINARY:
                throw new IOException("can not be binary");
            case ARRAY:
                JSONArray arr = new JSONArray();

                ArrayValue a = value.asArrayValue();
                for (Value e : a) {
                    put(arr, e);
                }
                object.put(key, arr);
                break;
            case MAP:
                MapValue m = value.asMapValue();
                JSONObject obj = new JSONObject(new LinkedHashMap());
                Set<Map.Entry<Value, Value>> set = m.entrySet();

                for (Map.Entry<Value, Value> e : set) {
                    Value _key = e.getKey();
                    Value _value = e.getValue();
                    put(obj, _key.asStringValue().asString(), _value);
                }
                object.put(key, obj);
                break;
            case EXTENSION:
                throw new IOException("can not be extension");
        }
    }

    public static <T> T decode(byte[] data) throws IOException, JSONException {
        MessageUnpacker unpacker = MessagePack.newDefaultUnpacker(data);

        if (!unpacker.hasNext()) throw new IOException("error data");

        MessageFormat format = unpacker.getNextFormat();
        if (format == MessageFormat.FIXMAP || format == MessageFormat.MAP16 || format == MessageFormat.MAP32) {
            int keyLength = unpacker.unpackMapHeader();
            JSONObject object = new JSONObject(new LinkedHashMap());
            for (int i = 0; i < keyLength; i++) {
                String key = unpacker.unpackString();

                Value value = unpacker.unpackValue();
                put(object, key, value);
            }
            return (T) object;
        } else if (format == MessageFormat.FIXARRAY || format == MessageFormat.ARRAY16 || format == MessageFormat.ARRAY32) {
            int arrLength = unpacker.unpackArrayHeader();
            JSONArray arr = new JSONArray();
            for (int i = 0; i < arrLength; i++) {
                Value value = unpacker.unpackValue();
                put(arr, value);
            }
            return (T) arr;
        } else {
            Value v = unpacker.unpackValue();
            switch (v.getValueType()) {
                case NIL:
                    return (T) JSONObject.NULL;
                case BOOLEAN:
                    Boolean b = v.asBooleanValue().getBoolean();
                    return (T) b;
                case INTEGER:
                    IntegerValue iv = v.asIntegerValue();
                    if (iv.isInIntRange()) {
                        Integer i = iv.toInt();
                        return (T) i;
                    }
                    else if (iv.isInLongRange()) {
                        Long l = iv.toLong();
                        return (T) l;
                    }
                    else {
                        BigInteger i = iv.toBigInteger();
                        return (T) i;
                    }
                case FLOAT:
                    FloatValue fv = v.asFloatValue();
                    // float f = fv.toFloat();
                    Double d = fv.toDouble();
                    return (T) d;
                case STRING:
                    String s = v.asStringValue().asString();
                    return (T) s;
                case BINARY:
                    throw new IOException("can not be binary");
                case ARRAY:
                    throw new IOException("can not be array");
                case MAP:
                    throw new IOException("can not be map");
                case EXTENSION:
                    throw new IOException("can not be extension");
                default:
                    throw new IOException("unknown type");
            }
        }
    }

    private static void packJObject(MessageBufferPacker packer, JSONObject data) throws IOException, JSONException {
        packer.packMapHeader(data.length());
        Iterator<String> keys = data.keys();
        while(keys.hasNext()) {
            String key = keys.next();
            packer.packString(key);
            pack(packer, data.get(key));
        }
    }

    private static void pack(MessageBufferPacker packer, Object value) throws IOException, JSONException {
        if(value instanceof JSONObject) {
            packJObject(packer,(JSONObject)value);
        }
        else if(value instanceof JSONArray){
            packJArray(packer,(JSONArray)value);
        }
        else {
            packPrimitive(packer, value);
        }
    }

    private static void packJArray(MessageBufferPacker packer, JSONArray data) throws IOException, JSONException {
        packer.packArrayHeader(data.length());
        for(int i = 0; i < data.length(); i++) {
            pack(packer, data.get(i));
        }
    }

    private static void packPrimitive(MessageBufferPacker packer, Object value) throws IOException, JSONException {
        if(value instanceof String) {
            packer.packString((String)value);
        }
        else if(value instanceof Integer) {
            packer.packInt((Integer) value);
        }
        else if(value instanceof Boolean) {
            packer.packBoolean((boolean)value);
        }
        else if(value instanceof Double) {
            packer.packDouble((double)value);
        }
        else if(value instanceof Long) {
            packer.packLong((long)value);
        }
        else if(value == JSONObject.NULL || value == null) {
            packer.packNil();
        }
        else if(value.getClass().isArray()) {
            JSONArray arr = new JSONArray();
            int length = Array.getLength(value);
            for (int i = 0; i < length; i++) {
                arr.put(Array.get(value, i));
            }
            packJArray(packer, arr);
        }
        else {
            throw new IOException("Invalid packing value of type " + value.getClass().getName());
        }
    }
}
