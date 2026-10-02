package in.springnexa.nexa;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
  private static final int FILE_PICKER = 7001;
  private static final int AUDIO_PERMISSION = 7002;
  private WebView webView;
  private ValueCallback<Uri[]> fileCallback;
  private PermissionRequest pendingPermission;

  @Override protected void onCreate(Bundle state) {
    super.onCreate(state);
    webView = new WebView(this);
    setContentView(webView);

    WebSettings s = webView.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(true);
    s.setMediaPlaybackRequiresUserGesture(false);
    s.setAllowFileAccess(false);
    s.setAllowContentAccess(false);
    s.setBuiltInZoomControls(false);
    s.setDisplayZoomControls(false);
    s.setUserAgentString(s.getUserAgentString() + " NexaAI-Android/1.0");

    webView.setWebViewClient(new WebViewClient() {
      @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        Uri u = request.getUrl();
        Uri base = Uri.parse(BuildConfig.NEXA_WEB_URL);
        if (base.getHost() != null && base.getHost().equalsIgnoreCase(u.getHost())) return false;
        try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception ignored) {}
        return true;
      }
    });

    webView.setWebChromeClient(new WebChromeClient() {
      @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
        if (fileCallback != null) fileCallback.onReceiveValue(null);
        fileCallback = callback;
        try {
          startActivityForResult(params.createIntent(), FILE_PICKER);
          return true;
        } catch (Exception e) {
          fileCallback = null;
          callback.onReceiveValue(null);
          return false;
        }
      }

      @Override public void onPermissionRequest(PermissionRequest request) {
        boolean audio = false;
        for (String resource : request.getResources()) {
          if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource)) audio = true;
        }
        if (!audio) { request.deny(); return; }
        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
          request.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
        } else {
          pendingPermission = request;
          requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, AUDIO_PERMISSION);
        }
      }
    });

    webView.loadUrl(BuildConfig.NEXA_WEB_URL);
  }

  @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
    super.onActivityResult(requestCode, resultCode, data);
    if (requestCode != FILE_PICKER || fileCallback == null) return;
    Uri[] results = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
    fileCallback.onReceiveValue(results);
    fileCallback = null;
  }

  @Override public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] results) {
    super.onRequestPermissionsResult(requestCode, permissions, results);
    if (requestCode == AUDIO_PERMISSION && pendingPermission != null) {
      if (results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED) {
        pendingPermission.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
      } else pendingPermission.deny();
      pendingPermission = null;
    }
  }

  @Override public void onBackPressed() {
    if (webView.canGoBack()) webView.goBack(); else super.onBackPressed();
  }
}
