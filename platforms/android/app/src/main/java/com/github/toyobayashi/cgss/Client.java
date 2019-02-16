package com.github.toyobayashi.cgss;

import android.content.pm.PackageManager;
import android.util.Base64;
import android.view.View;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;

import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.LinkedHashMap;

public class Client extends CordovaPlugin {

    static {
        System.loadLibrary("native-lib");
    }

    public native void wav2mp3(String wavPath, String mp3Path, CallbackContext callbackContext);
    public native boolean hca2wav(String hcaPath, String wavPath);
    public native String acb2hca(String acbPath);

    private CGSSClient client = new CGSSClient(new String(Base64.decode("Nzc1ODkxMjUwOjkxMDg0MTY3NTo2MDBhNWVmZC1jYWU1LTQxZmYtYTBjNy03ZGVkYTc1MWM1ZWQ=", Base64.DEFAULT), StandardCharsets.US_ASCII));
    private static HashMap<String, DB> dbMap = new HashMap<>();
    private static HashMap<String, Boolean> dlMap = new HashMap<>();

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {

        if (action.equals("getVersion")) {
            PackageManager manager = cordova.getContext().getPackageManager();
            try {
                callbackContext.success(manager.getPackageInfo(cordova.getContext().getPackageName(), 0).versionName);
            } catch (PackageManager.NameNotFoundException e) {
                e.printStackTrace();
                callbackContext.error(e.toString());
            }
            return true;
        }

        if (action.equals("download")) {
            String url = args.getString(0);
            String path = args.getString(1);

            cordova.getThreadPool().execute(() -> {
                this.download(url, path, callbackContext);
            });
            return true;
        }

        if (action.equals("abortDownload")) {
            String path = args.getString(0);

            dlMap.remove(path);
            callbackContext.success();
            return true;
        }

        if (action.equals("rmrf")) {
            String path = args.getString(0);
            cordova.getThreadPool().execute(() -> {
                try {
                    Process p = Runtime.getRuntime().exec("rm -rf " + path);
                    p.waitFor();
                    int res = p.exitValue();
                    if (res == 0) {
                        callbackContext.success();
                    } else {
                        callbackContext.error(res);
                    }
                } catch (IOException | InterruptedException e) {
                    e.printStackTrace();
                    callbackContext.error(e.toString());
                }
            });
            return true;
        }

        if (action.equals("mkdirs")) {
            String path = args.getString(0);
            cordova.getThreadPool().execute(() -> {
                File p = new File(path);
                if (!p.exists()) {
                    if (p.mkdirs()) {
                        callbackContext.success();
                    } else {
                        callbackContext.error("mkdirs failed.");
                    }
                } else {
                    if (!p.isDirectory()) {
                        callbackContext.error("mkdirs failed.");
                    } else {
                        callbackContext.success();
                    }
                }
            });
            return true;
        }

        if (action.equals("setFullScreen")) {
            boolean isFullScreen = args.getBoolean(0);
            cordova.getActivity().runOnUiThread(() -> {
                if (isFullScreen) {
                    int uiFlags = View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                        | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        | View.SYSTEM_UI_FLAG_FULLSCREEN;
                    uiFlags |= 0x00001000;
                    cordova.getActivity().getWindow().getDecorView().setSystemUiVisibility(uiFlags);
                } else {
                    int uiFlags = View.SYSTEM_UI_FLAG_LAYOUT_STABLE;
                    uiFlags |= 0x00001000;
                    cordova.getActivity().getWindow().getDecorView().setSystemUiVisibility(uiFlags);
                    //cordova.getActivity().getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_VISIBLE);
                }
                callbackContext.success();
            });
            return true;
        }

        if (action.equals("check")) {
            cordova.getThreadPool().execute(() -> {
                try {
                    String resver = this.check();
                    callbackContext.success(resver);
                } catch (Exception e) {
                    e.printStackTrace();
                    callbackContext.error(e.toString());
                }
            });
            return true;
        }

        if (action.equals("lz4dec")) {
            String path = args.getString(0);
            cordova.getThreadPool().execute(() -> {
                try {
                    this.lz4dec(path);
                    callbackContext.success();
                } catch (IOException e) {
                    e.printStackTrace();
                    callbackContext.error(e.toString());
                }
            });
            return true;
        }

        if (action.equals("wav2mp3")) {
            String wavPath = args.getString(0);
            String mp3Path = args.getString(1);
            cordova.getThreadPool().execute(() -> {
                this.wav2mp3(wavPath, mp3Path, callbackContext);
            });
            return true;
        }

        if (action.equals("hca2wav")) {
            String hcaPath = args.getString(0);
            String wavPath = args.getString(1);
            cordova.getThreadPool().execute(() -> {
                boolean result = this.hca2wav(hcaPath, wavPath);
                if (result) {
                    callbackContext.success();
                } else {
                    callbackContext.error("HCA decode failed.");
                }
            });
            return true;
        }

        if (action.equals("acb2hca")) {
            String acbPath = args.getString(0);
            cordova.getThreadPool().execute(() -> {
                String hcaDir = this.acb2hca(acbPath);
                if (hcaDir.equals("")) {
                    callbackContext.error("ACB extracting failed.");
                } else {
                    callbackContext.success(hcaDir);
                }
            });
            return true;
        }

        if (action.equals("openDatabase")) {
            String dbPath = args.getString(0);
            cordova.getThreadPool().execute(() -> {
                DB database = new DB(dbPath);
                dbMap.put(database.getDb().toString(), database);
                callbackContext.success(database.getDb().toString());
            });
            return true;
        }

        if (action.equals("queryDatabase")) {
            String id = args.getString(0);
            String sql = args.getString(1);
            JSONArray selectionArgs = args.getJSONArray(2);
            String[] selectionArgsJava;
            int length = selectionArgs.length();
            if (length != 0) {
                selectionArgsJava = new String[length];
                for (int i = 0; i < length; i++) {
                    selectionArgsJava[i] = selectionArgs.getString(i);
                }
            } else {
                selectionArgsJava = null;
            }
            cordova.getThreadPool().execute(() -> {
                DB database = dbMap.get(id);
                if (database == null) {
                    callbackContext.error("Query failed. Database not opened: " + id);
                    return;
                }

                try {
                    JSONArray result = database.select(sql, selectionArgsJava);
                    callbackContext.success(result);
                } catch (JSONException e) {
                    e.printStackTrace();
                    callbackContext.error(e.toString());
                }
            });
            return true;
        }

        if (action.equals("closeDatabase")) {
            String id = args.getString(0);
            cordova.getThreadPool().execute(() -> {
                DB database = dbMap.get(id);
                if (database == null) {
                    callbackContext.error("Close failed. Database not opened: " + id);
                    return;
                }

                boolean result = database.close();
                if (!result) {
                    callbackContext.error("Close database failed.");
                    return;
                }

                dbMap.remove(id);
                callbackContext.success();
            });
            return true;
        }
        return false;
    }

    private void download(String urlString, String path, CallbackContext callbackContext) {
        if (dlMap.get(path) != null) {
            callbackContext.error("Downloading.");
            return;
        }

        File f = new File(path);
        if (f.exists()) {
            JSONObject res = new JSONObject(new LinkedHashMap());
            try {
                res.put("computable", true);
                res.put("loaded", f.length());
                res.put("total", f.length());
                res.put("percentage", 100);
                res.put("ended", true);
                callbackContext.success(res);
            } catch (JSONException e) {
                e.printStackTrace();
                callbackContext.error(e.toString());
            }

            return;
        }

        String pathTemp = path + ".tmp";
        String dir = pathTemp.substring(0, pathTemp.lastIndexOf(File.separator));
        File saveDir = new File(dir);
        if (!saveDir.exists()) {
            if (!saveDir.mkdirs()) {
                callbackContext.error("Make directory failed: " + dir);
                return;
            }
        }

        File file = new File(pathTemp);
        long fileLength = file.length();

        try {
            URL url = new URL(urlString);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setConnectTimeout(10000);
            connection.setRequestProperty("User-Agent", "Dalvik/2.1.0 (Linux; U; Android 7.0; Nexus 42 Build/XYZZ1Y)");
            connection.setRequestProperty("X-Unity-Version", "2017.4.2f2");
            connection.setRequestProperty("Accept-Encoding", "gzip");
            connection.setRequestProperty("Connection", "Keep-Alive");
            if (fileLength > 0) {
                connection.setRequestProperty("Range", "bytes=" + String.valueOf(fileLength) + "-");
            }
            connection.setRequestMethod("GET");

            int contentLength = connection.getContentLength();
            byte[] buffer = new byte[8192];
            int len;

            InputStream inputStream = connection.getInputStream();

            long current = fileLength;
            long total = fileLength + contentLength;
            // ByteArrayOutputStream bos = new ByteArrayOutputStream();

            FileOutputStream fos = new FileOutputStream(file, true);

            dlMap.put(path, true);

            while (true) {
                if (null == dlMap.get(path)) {
                    connection.disconnect();
                    inputStream.close();
                    fos.close();
                    callbackContext.error("Download aborted.");
                    return;
                }

                len = inputStream.read(buffer);

                if (len == -1) {
                    break;
                }

                fos.write(buffer, 0, len);
                current += len;

                JSONObject res = new JSONObject(new LinkedHashMap());
                res.put("computable", true);
                res.put("loaded", current);
                res.put("total", total);
                res.put("percentage", 100 * (((double) current) / ((double) total)));
                res.put("ended", false);

                PluginResult downloadProgress = new PluginResult(PluginResult.Status.OK, res);
                downloadProgress.setKeepCallback(true);
                callbackContext.sendPluginResult(downloadProgress);
            }

            connection.disconnect();
            inputStream.close();
            fos.close();
            dlMap.remove(path);
            if (file.renameTo(f)) {
                JSONObject res = new JSONObject(new LinkedHashMap());
                res.put("computable", true);
                res.put("loaded", current);
                res.put("total", total);
                res.put("percentage", 100 * (((double) current) / ((double) total)));
                res.put("ended", true);
                callbackContext.success(res);
            } else {
                callbackContext.error("Rename error.");
            }
        } catch (IOException | JSONException e) {
            e.printStackTrace();
            callbackContext.error(e.toString());
        }

    }

    private void lz4dec(String path) throws IOException {
        int len;
        byte[] buffer = new byte[8192];
        FileInputStream lz4ins = new FileInputStream(path);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        while ((len = lz4ins.read(buffer)) != -1) {
            baos.write(buffer, 0, len);
        }
        lz4ins.close();

        LZ4Decompressor lz4Decompressor = new LZ4Decompressor();
        byte[] decBuffer = lz4Decompressor.decompress(baos.toByteArray());
        baos.close();

        String outputPath = path.substring(0, path.lastIndexOf("."));

        FileOutputStream decfos = new FileOutputStream(outputPath);
        decfos.write(decBuffer);
        decfos.close();
    }

    private String check() throws Exception {

        JSONObject res = client.check();
        JSONObject dataHeaders = res.getJSONObject("data_headers");
        int resultCode = dataHeaders.getInt("result_code");
        if (resultCode == 214) {
            String resver =  dataHeaders.getString("required_res_ver");
            return resver;
        } else if (resultCode == 1) {
            return client.getResVer();
        } else {
            throw new Exception(String.valueOf(resultCode));
        }
    }
}
