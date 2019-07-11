#include <jni.h>
#include <string>
#include <sstream>
#include <ACBExtractor.h>
#include "libmp3lame/lame.h"
#include "hcadecoder/clHCA.h"
#include "aes/aes.hpp"

std::string ltos(long l) {
    return std::to_string(l);
}

std::string dtos(double d) {
    return std::to_string(d);
}

extern "C" JNIEXPORT jstring JNICALL
Java_com_github_toyobayashi_cgss_Client_acb2hca(
        JNIEnv* env,
        jobject self,
        jstring acbPath) {
    const char* acbfile = env->GetStringUTFChars(acbPath, 0);

    ACBExtractor* acb;
    try {
        std::string acbfilePath = acbfile;
        acb = new ACBExtractor(acbfilePath);

        bool result = acb->extract(nullptr);
        if (result) {
            auto posl = acbfilePath.find_last_of('/');
            std::string dirname;
            std::string filename;
            if (posl == std::string::npos) {
                dirname = ".";
                filename = acbfilePath;
            } else {
                dirname = acbfilePath.substr(0, posl);
                filename = acbfilePath.substr(posl + 1);
            }
            std::string targetDir = dirname + "/_acb_" + filename;
            delete acb;
            env->ReleaseStringUTFChars(acbPath, acbfile);
            return env->NewStringUTF(targetDir.c_str());
        } else {
            delete acb;
            env->ReleaseStringUTFChars(acbPath, acbfile);
            return env->NewStringUTF("");
        }
    } catch (const char* err) {
        if (acb) {
            delete acb;
        }
        env->ReleaseStringUTFChars(acbPath, acbfile);
        return env->NewStringUTF("");
    }
}

extern "C" JNIEXPORT jboolean JNICALL
Java_com_github_toyobayashi_cgss_Client_hca2wav(
        JNIEnv* env,
        jobject self,
        jstring hcaPath,
        jstring wavPath) {
    clHCA *hca = new clHCA(0xF27E3B22, 0x00003657);

    const char* hcafile = env->GetStringUTFChars(hcaPath, 0);
    const char* wavfile = env->GetStringUTFChars(wavPath, 0);

    float volume = 1.0;
    int mode = 16;
    int loop = 0;

    auto result = (jboolean)hca->DecodeToWavefile(hcafile, wavfile, volume, mode, loop);
    delete hca;
    env->ReleaseStringUTFChars(hcaPath, hcafile);
    env->ReleaseStringUTFChars(wavPath, wavfile);
    return result;
}

extern "C" JNIEXPORT void JNICALL
Java_com_github_toyobayashi_cgss_Client_wav2mp3(
        JNIEnv* env,
        jobject self,
        jstring wavPath,
        jstring mp3Path,
        jobject callbackContext) {

    jclass CallbackContext = env->GetObjectClass(callbackContext);
    jclass PluginResult = env->FindClass("org.apache.cordova.PluginResult");
    jclass JSONObject = env->FindClass("org.json.JSONObject");
    jclass Status = env->FindClass("org/apache/cordova/PluginResult$Status");
    jfieldID okId = env->GetStaticFieldID(Status, "OK", "Lorg/apache/cordova/PluginResult$Status;");
    jobject ok = env->GetStaticObjectField(Status, okId);
    jmethodID JSONObjectConstructor = env->GetMethodID(JSONObject, "<init>", "(Ljava/lang/String;)V");
    // jmethodID PluginResultConstructor = env->GetMethodID(PluginResult, "<init>", "(Lorg/apache/cordova/PluginResult$Status;I)V");
    jmethodID PluginResultConstructor = env->GetMethodID(PluginResult, "<init>", "(Lorg/apache/cordova/PluginResult$Status;Lorg/json/JSONObject;)V");
    jmethodID setKeepCallback = env->GetMethodID(PluginResult, "setKeepCallback", "(Z)V");
    jmethodID success = env->GetMethodID(CallbackContext, "success", "(Lorg/json/JSONObject;)V");
    jmethodID error = env->GetMethodID(CallbackContext, "error", "(Ljava/lang/String;)V");
    jmethodID sendPluginResult = env->GetMethodID(CallbackContext, "sendPluginResult", "(Lorg/apache/cordova/PluginResult;)V");

    int read;
    int write;
    const char* wavfile = env->GetStringUTFChars(wavPath, 0);
    const char* mp3file = env->GetStringUTFChars(mp3Path, 0);

    FILE *wav = fopen(wavfile, "rb");
    if (!wav) {
        // return static_cast<jboolean>(false);
        env->CallVoidMethod(callbackContext, error, env->NewStringUTF("Decode Failed."));
        return;
    }

    long start = 4 * 1024;
    fseek(wav, 0L, SEEK_END);
    long wavsize = ftell(wav);
    fseek(wav, start, SEEK_SET);
    FILE *mp3 = fopen(mp3file, "wb");
    if (!mp3) {
        env->CallVoidMethod(callbackContext, error, env->NewStringUTF("Decode Failed."));
        // return static_cast<jboolean>(false);
        return;
    }

    const int WAV_SIZE = 8192;
    const int MP3_SIZE = 8192;

    const int CHANNEL = 2;

    short int *wav_buffer = new short int[WAV_SIZE * CHANNEL];
    unsigned char *mp3_buffer = new unsigned char[MP3_SIZE];

    lame_t lame = lame_init();
    lame_set_in_samplerate(lame, 44100);
    lame_set_num_channels(lame, CHANNEL);
    // lame_set_mode(lame, MONO);
    // lame_set_VBR(lame, vbr_default);
    lame_set_brate(lame, 128);
    lame_init_params(lame);

    long total = start;
    do {
        read = static_cast<int>(fread(wav_buffer, sizeof(short int) * CHANNEL, WAV_SIZE, wav));
        total += read * sizeof(short int) * CHANNEL;
        // publishJavaProgress(env, obj, total);
        if (read != 0) {
            // write = lame_encode_buffer(lame, wav_buffer, NULL, read, mp3_buffer, MP3_SIZE);
            write = lame_encode_buffer_interleaved(lame, wav_buffer, read, mp3_buffer, MP3_SIZE);

            std::string jsonString = "{computable:true,loaded:" + ltos(total) + ",total:" + ltos(wavsize) + ",percentage:" + dtos(100 * ((double)(total) / (double)(wavsize))) + ",ended:false}";
            jobject json = env->NewObject(JSONObject, JSONObjectConstructor, env->NewStringUTF(jsonString.c_str()));
            jobject pluginResult = env->NewObject(PluginResult, PluginResultConstructor, ok, json);
            env->CallVoidMethod(pluginResult, setKeepCallback, static_cast<jboolean>(true));
            env->CallVoidMethod(callbackContext, sendPluginResult, pluginResult);
        } else {
            write = lame_encode_flush(lame, mp3_buffer, MP3_SIZE);
        }
        fwrite(mp3_buffer, sizeof(unsigned char), static_cast<size_t>(write), mp3);
    } while (read != 0);

    // lame_mp3_tags_fid(lame, mp3);
    delete[] wav_buffer;
    delete[] mp3_buffer;
    lame_close(lame);
    fclose(mp3);
    fclose(wav);

    env->ReleaseStringUTFChars(wavPath, wavfile);
    env->ReleaseStringUTFChars(mp3Path, mp3file);

    std::string jsonString = "{computable:true,loaded:" + ltos(total) + ",total:" + ltos(wavsize) + ",percentage:" + dtos(100 * ((double)(total) / (double)(wavsize))) + ",ended:true}";
    jobject json = env->NewObject(JSONObject, JSONObjectConstructor, env->NewStringUTF(jsonString.c_str()));
    env->CallVoidMethod(callbackContext, success, json);
}

extern "C" JNIEXPORT jbyteArray JNICALL
Java_com_github_toyobayashi_cgss_CGSSClient_aesEncrypt(
        JNIEnv* env,
        jclass type,
        jbyteArray data,
        jbyteArray key,
        jbyteArray iv) {
    jbyte* dataJavaBuf = env->GetByteArrayElements(data, 0);
    jsize dataLength = env->GetArrayLength(data);
    jbyte* keyBuf = env->GetByteArrayElements(key, 0);
    jbyte* ivBuf = env->GetByteArrayElements(iv, 0);

    uint8_t* dataBuf = nullptr;

    int padding = dataLength % 16;
    uint32_t encryptLength = 0;
    if (padding != 0) {
        padding = 16 - padding;
        encryptLength = (uint32_t) (dataLength + padding);
        dataBuf = new uint8_t[encryptLength];
        for (int i = 0; i < dataLength; i++) {
            dataBuf[i] = (uint8_t) dataJavaBuf[i];
        }
        for (int i = 0; i < padding; i++) {
            dataBuf[i + dataLength] = (uint8_t) padding;
        }
    } else {
        encryptLength = (uint32_t) (dataLength);
        dataBuf = new uint8_t[dataLength];
        for (int i = 0; i < dataLength; i++) {
            dataBuf[i] = (uint8_t) dataJavaBuf[i];
        }
    }

    struct AES_ctx ctx;
    AES_init_ctx_iv(&ctx, (uint8_t*)keyBuf, (uint8_t*)ivBuf);
    AES_CBC_encrypt_buffer(&ctx, dataBuf, encryptLength);

    jbyteArray res = env->NewByteArray(encryptLength);
    jbyte* resArr = env->GetByteArrayElements(res, 0);
    for (int i = 0; i < encryptLength; i++) {
        resArr[i] = (jbyte) dataBuf[i];
    }

    delete[] dataBuf;

    env->ReleaseByteArrayElements(data, dataJavaBuf, JNI_ABORT);

    env->ReleaseByteArrayElements(key, keyBuf, JNI_ABORT);
    env->ReleaseByteArrayElements(iv, ivBuf, JNI_ABORT);
    env->ReleaseByteArrayElements(res, resArr, 0);

    return res;
}

extern "C" JNIEXPORT jbyteArray JNICALL
Java_com_github_toyobayashi_cgss_CGSSClient_aesDecrypt(
        JNIEnv* env,
        jclass type,
        jbyteArray data,
        jbyteArray key,
        jbyteArray iv) {
    jbyte* dataJavaBuf = env->GetByteArrayElements(data, 0);
    jsize dataLength = env->GetArrayLength(data);
    jbyte* keyBuf = env->GetByteArrayElements(key, 0);
    jbyte* ivBuf = env->GetByteArrayElements(iv, 0);

    auto * dataBuf = new uint8_t[dataLength];
    for (int i = 0; i < dataLength; i++) {
        dataBuf[i] = (uint8_t) dataJavaBuf[i];
    }

    struct AES_ctx ctx;
    AES_init_ctx_iv(&ctx, (uint8_t*)keyBuf, (uint8_t*)ivBuf);
    AES_CBC_decrypt_buffer(&ctx, dataBuf, (uint32_t)dataLength);

    jbyteArray res;
    jbyte* resArr = nullptr;
    uint8_t padding = dataBuf[dataLength - 1];
    if (padding > 0 && padding <= 16) {
        res = env->NewByteArray(dataLength - padding);
        resArr = env->GetByteArrayElements(res, 0);
        for (int i = 0; i < dataLength - padding; i++) {
            resArr[i] = (jbyte) dataBuf[i];
        }
    } else {
        res = env->NewByteArray(dataLength);
        resArr = env->GetByteArrayElements(res, 0);
        for (int i = 0; i < dataLength; i++) {
            resArr[i] = (jbyte) dataBuf[i];
        }
    }

    delete[] dataBuf;

    env->ReleaseByteArrayElements(data, dataJavaBuf, JNI_ABORT);
    env->ReleaseByteArrayElements(key, keyBuf, JNI_ABORT);
    env->ReleaseByteArrayElements(iv, ivBuf, JNI_ABORT);
    env->ReleaseByteArrayElements(res, resArr, 0);

    return res;
}
