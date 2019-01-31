package com.github.toyobayashi.cgss;

import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.LinkedHashMap;

public class DB {

    private SQLiteDatabase db;

    public JSONArray select (String sql, String[] selectionArgs) throws JSONException {
        JSONArray result = new JSONArray();
        if (!db.isOpen()) return result;

        Cursor cursor = db.rawQuery(sql, selectionArgs);
        while (cursor.moveToNext()) {
            JSONObject row = new JSONObject(new LinkedHashMap());
            int columnCount = cursor.getColumnCount();
            for (int i = 0; i < columnCount; i++) {
                int type = cursor.getType(i);
                String columnName = cursor.getColumnName(i);

                switch (type) {
                    case Cursor.FIELD_TYPE_NULL:
                        row.put(columnName, JSONObject.NULL);
                        break;
                    case Cursor.FIELD_TYPE_FLOAT:
                        row.put(columnName, cursor.getDouble(i));
                        break;
                    case Cursor.FIELD_TYPE_INTEGER:
                        row.put(columnName, cursor.getInt(i));
                        break;
                    case Cursor.FIELD_TYPE_STRING:
                        row.put(columnName, cursor.getString(i));
                        break;
                    case Cursor.FIELD_TYPE_BLOB:
                        byte[] buffer = cursor.getBlob(i);
                        JSONArray arr = new JSONArray();
                        for (byte b : buffer) {
                            arr.put(b & 0xff);
                        }
                        row.put(columnName, arr);
                        break;
                    default:
                        break;
                }
            }

            result.put(row);

        }
        cursor.close();
        return result;
    }

    DB (String path) {
        db = SQLiteDatabase.openOrCreateDatabase(path, null);
    }

    public boolean close () {
        if (!db.isOpen()) return false;

        db.close();
        return true;
    }

    public SQLiteDatabase getDb () {
        return db;
    }
}
