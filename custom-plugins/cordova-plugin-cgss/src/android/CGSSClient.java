package com.github.toyobayashi.cgss;

import android.util.Base64;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigInteger;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Random;

public class CGSSClient {
    private String user;
    private String viewer;
    private String udid;
    private String sid;
    private String resVer;

    public String getResVer() {
        return resVer;
    }

    private static final String VIEWER_ID_KEY = "cyU1Vk5RKEgkJkJxYjYjMys3OGgyOSFGdDR3U2cpZXg=";
    private static final String SID_KEY = "ciFJQG50OGU1aT0=";

    private static int ord(char c) {
        return (int) c;
    }

    private static char chr(int i) {
        return (char) i;
    }

    private static String crypto(String str, String algorithm) {
        try {
            MessageDigest md = MessageDigest.getInstance(algorithm);
            md.update(str.getBytes(StandardCharsets.UTF_8));
            return new BigInteger(1, md.digest()).toString(16);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return "";
    }

    private static String createRandomNumberString(int length) {
        Random random = new Random();
        StringBuilder str = new StringBuilder();
        for (int i = 0; i < length; i++) {
            str.append(random.nextInt(10));
        }
        return str.toString();
    }

    private static String md5(String str) {
        return crypto(str, "MD5");
    }

    private static String sha1(String str) {
        return crypto(str, "SHA1");
    }

    public CGSSClient(String account, String resVer) {
        String[] accountArr = account.split(":");
        this.user = accountArr[0];
        this.viewer = accountArr[1];
        this.udid = accountArr[2];
        this.sid = "";
        this.resVer = resVer;
    }

    public CGSSClient(String account) {
        String[] accountArr = account.split(":");
        this.user = accountArr[0];
        this.viewer = accountArr[1];
        this.udid = accountArr[2];
        this.sid = "";
        this.resVer = "10040400";
    }

    private static String b64encode(byte[] buff) {
        return Base64.encodeToString(buff, Base64.DEFAULT).replaceAll("\n", "");
    }

    private static String b64encode(String str) {
        return Base64.encodeToString(str.getBytes(StandardCharsets.US_ASCII), Base64.DEFAULT).replaceAll("\n", "");
    }

    private static byte[] b64decode(String buff) {
        return Base64.decode(buff, Base64.DEFAULT);
    }

    private static byte[] b64decode(byte[] str) {
        return Base64.decode(str, Base64.DEFAULT);
    }

    private static String $xFFFF32() {
        Random random = new Random();
        StringBuilder str = new StringBuilder();
        for (int i = 0; i < 32; i++) {
            str.append(String.format("%x", random.nextInt(65536)));
        }
        return str.toString();
    }

    private static class CryptAES {
        private CryptAES() {}
        public static byte[] encryptRJ256(String s, String iv, String key) {
            RijndaelBlock rijndael = new RijndaelBlock(key, "cbc");
            return rijndael.encrypt(s, 256, iv);
        }

        public static byte[] decryptRJ256(byte[] b, String iv, String key) {
            RijndaelBlock rijndael = new RijndaelBlock(key, "cbc");
            return rijndael.decrypt(b, 256, iv);
        }
    }

    private static class CryptoGrapher {
        private CryptoGrapher() {}
        public static String encode(String s) {
            String length = String.format("%04x", s.length());
            StringBuilder str = new StringBuilder();
            str.append(length);
            for (int i = 0; i < s.length(); i++) {
                char c = s.charAt(i);
                str.append(createRandomNumberString(2) + chr(ord(c) + 10) + createRandomNumberString(1));
            }
            str.append(createRandomNumberString(32));
            return str.toString();
        }
    }

    public JSONObject post(String path, JSONObject args) throws IOException, JSONException {
        String viewerIV = createRandomNumberString(32);
        args.put("timezone", "09:00:00");
        args.put("viewer_id", viewerIV + b64encode(CryptAES.encryptRJ256(this.viewer, viewerIV, new String(b64decode(VIEWER_ID_KEY)))));
        String plain = b64encode(Msgpack.encode(args));
        String key = b64encode($xFFFF32()).substring(0, 32);
        String bodyIV = this.udid.replaceAll("-", "");
        String body = b64encode(bufferConcat(CryptAES.encryptRJ256(plain, bodyIV, key), key.getBytes(StandardCharsets.US_ASCII)));
        String sid = !this.sid.equals("") ? this.sid : (this.viewer + this.udid);

        URL url = new URL("https://apis.game.starlight-stage.jp" + path);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setDoOutput(true);
        connection.setDoInput(true);
        connection.setRequestMethod("POST");
        connection.setUseCaches(false);
        connection.setInstanceFollowRedirects(true);
        connection.setRequestProperty("USER_ID", CryptoGrapher.encode(this.user));
        connection.setRequestProperty("DEVICE_NAME", "Nexus 42");
        connection.setRequestProperty("APP_VER", "9.9.9");
        connection.setRequestProperty("DEVICE_ID", md5("Totally a real Android"));
        connection.setRequestProperty("GRAPHICS_DEVICE_NAME", "3dfx Voodoo2 (TM)");
        connection.setRequestProperty("IDFA", "");
        connection.setRequestProperty("SID", md5(sid + new String(b64decode(SID_KEY))));
        connection.setRequestProperty("DEVICE", "2");
        connection.setRequestProperty("KEYCHAIN", "");
        connection.setRequestProperty("PLATFORM_OS_VERSION", "Android OS 13.3.7 / API-42 (XYZZ1Y/74726f6c6c)");
        connection.setRequestProperty("PARAM", sha1(this.udid + this.viewer + path + plain));
        connection.setRequestProperty("X-Unity-Version", "5.4.5p1");
        connection.setRequestProperty("CARRIER", "google");
        connection.setRequestProperty("RES_VER", this.resVer);
        connection.setRequestProperty("UDID", CryptoGrapher.encode(this.udid));
        connection.setRequestProperty("IP_ADDRESS", "127.0.0.1");
        connection.setRequestProperty("User-Agent", "Dalvik/2.1.0 (Linux; U; Android 13.3.7; Nexus 42 Build/XYZZ1Y)");
        connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
        connection.connect();
        DataOutputStream out = new DataOutputStream(connection.getOutputStream());
        out.writeBytes(body);
        out.flush();
        out.close();

        int responseCode = connection.getResponseCode();

        if (HttpURLConnection.HTTP_OK == responseCode) {
            StringBuilder sb=new StringBuilder();
            String readLine;
            BufferedReader responseReader=new BufferedReader(new InputStreamReader(connection.getInputStream(), StandardCharsets.UTF_8));
            while((readLine = responseReader.readLine())!=null){
                sb.append(readLine).append("\n");
            }
            responseReader.close();
            connection.disconnect();
            String b64Body = sb.toString().replaceAll("\n", "");

            return decryptBody(b64Body, bodyIV);
        }
        return null;
    }

    public JSONObject check() throws IOException, JSONException {
        JSONObject arg = new JSONObject();
        arg.put("campaign_data", "");
        arg.put("campaign_user", 1337);
        arg.put("campaign_sign", md5("All your APIs are belong to us"));
        arg.put("app_type", 0);
        return this.post("/load/check", arg);
    }

    public static JSONObject decryptBody(String b64Body, String iv) throws IOException, JSONException {
        byte[] bin = b64decode(b64Body);
        byte[] data = new byte[bin.length - 32];
        byte[] key = new byte[32];
        System.arraycopy(bin, 0, data, 0, bin.length - 32);
        System.arraycopy(bin, bin.length - 32, key, 0, 32);
        return Msgpack.decode(b64decode(CryptAES.decryptRJ256(data, iv, new String(key, StandardCharsets.US_ASCII))));
    }

    private static byte[] bufferConcat(byte[] a, byte[] b) {
        byte[] result = new byte[a.length + b.length];
        System.arraycopy(a, 0, result, 0, a.length);
        System.arraycopy(b, 0, result, a.length, b.length);
        return result;
    }
}
