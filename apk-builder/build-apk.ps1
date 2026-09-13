param(
    [string]$AppUrl = "https://doorstep-handheld-trustable.ngrok-free.dev"
)

$ErrorActionPreference = "Stop"

$root = $PSScriptRoot
$sdk = "$env:LOCALAPPDATA\Android\Sdk"
$buildTools = "$sdk\build-tools\36.1.0"
$platformJar = "$sdk\platforms\android-36.1\android.jar"

Write-Host "=== Compilando APK Nativo Conecta 360 ===" -ForegroundColor Cyan
Write-Host "Build Tools: $buildTools"
Write-Host "Platform: $platformJar"
Write-Host "App URL objetivo: $AppUrl"

$srcDir = "$root\src\co\conecta360\app"
$resDir = "$root\res"
$resValues = "$resDir\values"
$resDrawable = "$resDir\drawable"
$genDir = "$root\gen"
$binDir = "$root\bin"
$objDir = "$root\obj"
$dexDir = "$root\dex"

Remove-Item -Recurse -Force "$genDir","$binDir","$objDir","$dexDir" -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $srcDir, $resValues, $resDrawable, $genDir, $binDir, $objDir, $dexDir | Out-Null

$sourceIcon = "C:\Informacion David\Desarrollo\conecta360\frontend\public\images\logo-conecta-hero-icon.png"
if (Test-Path $sourceIcon) {
    Copy-Item $sourceIcon "$resDrawable\ic_launcher.png" -Force
}

$utf8NoBom = [System.Text.UTF8Encoding]::new($false)

$stringsXml = @"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">Conecta 360</string>
</resources>
"@
[System.IO.File]::WriteAllText("$resValues\strings.xml", $stringsXml, $utf8NoBom)

$manifestXml = @"
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="co.conecta360.app"
    android:versionCode="4"
    android:versionName="1.4.0">

    <uses-sdk android:minSdkVersion="24" android:targetSdkVersion="34" />

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

    <application
        android:label="@string/app_name"
        android:icon="@drawable/ic_launcher"
        android:roundIcon="@drawable/ic_launcher"
        android:theme="@android:style/Theme.DeviceDefault.NoActionBar"
        android:usesCleartextTraffic="true"
        android:supportsRtl="true"
        android:hardwareAccelerated="true">

        <activity
            android:name="co.conecta360.app.MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|keyboardHidden|screenLayout"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
"@
[System.IO.File]::WriteAllText("$root\AndroidManifest.xml", $manifestXml, $utf8NoBom)

$mainActivityJava = @"
package co.conecta360.app;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.GeolocationPermissions;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import java.util.HashMap;
import java.util.Map;

public class MainActivity extends Activity {
    private WebView webView;
    private FrameLayout splashLayout;
    private ProgressBar progressBar;
    private final String TARGET_URL = "$AppUrl";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Estilizar barra de estado y navegacion nativas (Dark Theme Conecta 360)
        try {
            Window window = getWindow();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
                window.setStatusBarColor(Color.parseColor("#0f172a"));
                window.setNavigationBarColor(Color.parseColor("#0f172a"));
            }
        } catch (Throwable ignored) {}

        FrameLayout rootLayout = new FrameLayout(this);
        rootLayout.setLayoutParams(new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        rootLayout.setBackgroundColor(Color.parseColor("#0f172a"));

        // 1. WebView Principal
        webView = new WebView(this);
        webView.setLayoutParams(new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        webView.setBackgroundColor(Color.parseColor("#0f172a"));

        // 2. Barra de progreso sutil superior
        progressBar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        progressBar.setLayoutParams(new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, 8));
        progressBar.setMax(100);
        progressBar.setVisibility(View.GONE);

        // 3. Splash Screen Nativa de Carga Inicial
        splashLayout = new FrameLayout(this);
        splashLayout.setLayoutParams(new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        splashLayout.setBackgroundColor(Color.parseColor("#0f172a"));

        LinearLayout centerBox = new LinearLayout(this);
        centerBox.setOrientation(LinearLayout.VERTICAL);
        centerBox.setGravity(Gravity.CENTER);
        FrameLayout.LayoutParams centerParams = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        centerParams.gravity = Gravity.CENTER;
        centerBox.setLayoutParams(centerParams);

        ImageView iconView = new ImageView(this);
        iconView.setImageResource(R.drawable.ic_launcher);
        LinearLayout.LayoutParams iconParams = new LinearLayout.LayoutParams(180, 180);
        iconParams.bottomMargin = 30;
        iconView.setLayoutParams(iconParams);

        TextView titleView = new TextView(this);
        titleView.setText("CONECTA 360");
        titleView.setTextColor(Color.WHITE);
        titleView.setTextSize(22);
        titleView.setTypeface(null, android.graphics.Typeface.BOLD);
        titleView.setGravity(Gravity.CENTER);

        TextView subtitleView = new TextView(this);
        subtitleView.setText("Servicios y Cuadrillas en Colombia");
        subtitleView.setTextColor(Color.parseColor("#94a3b8"));
        subtitleView.setTextSize(13);
        subtitleView.setGravity(Gravity.CENTER);
        LinearLayout.LayoutParams subParams = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT);
        subParams.topMargin = 10;
        subParams.bottomMargin = 30;
        subtitleView.setLayoutParams(subParams);

        ProgressBar spinner = new ProgressBar(this);
        LinearLayout.LayoutParams spinParams = new LinearLayout.LayoutParams(70, 70);
        spinner.setLayoutParams(spinParams);

        centerBox.addView(iconView);
        centerBox.addView(titleView);
        centerBox.addView(subtitleView);
        centerBox.addView(spinner);
        splashLayout.addView(centerBox);

        rootLayout.addView(webView);
        rootLayout.addView(progressBar);
        rootLayout.addView(splashLayout);
        setContentView(rootLayout);

        // Bypass de aviso ngrok mediante Cookie y User-Agent
        CookieManager cookieManager = CookieManager.getInstance();
        cookieManager.setAcceptCookie(true);
        try {
            cookieManager.setAcceptThirdPartyCookies(webView, true);
        } catch (Throwable ignored) {}
        cookieManager.setCookie(TARGET_URL, "ngrok-skip-browser-warning=true; path=/; SameSite=None; Secure");

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setSupportZoom(true);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setGeolocationEnabled(true);
        // User Agent no-navegador para saltar el interstitial de ngrok inmediatamente
        settings.setUserAgentString("Conecta360App/1.0 (Android; Mobile)");
        try {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        } catch (Throwable ignored) {}

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                if (newProgress < 100) {
                    progressBar.setVisibility(View.VISIBLE);
                    progressBar.setProgress(newProgress);
                } else {
                    progressBar.setVisibility(View.GONE);
                }
            }

            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                callback.invoke(origin, true, false);
            }
        });

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                // Ocultar splash screen cuando la app haya cargado
                if (splashLayout != null && splashLayout.getVisibility() == View.VISIBLE) {
                    splashLayout.animate()
                            .alpha(0f)
                            .setDuration(350)
                            .withEndAction(new Runnable() {
                                @Override
                                public void run() {
                                    splashLayout.setVisibility(View.GONE);
                                }
                            });
                }
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (url.startsWith("tel:") || url.startsWith("mailto:") || url.startsWith("whatsapp:") || url.startsWith("https://wa.me/")) {
                    try {
                        Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                        startActivity(intent);
                        return true;
                    } catch (Exception e) {
                        Toast.makeText(MainActivity.this, "No hay aplicacion compatible", Toast.LENGTH_SHORT).show();
                        return true;
                    }
                }
                return false;
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                if (request.isForMainFrame()) {
                    if (splashLayout != null) splashLayout.setVisibility(View.GONE);
                    String html = "<html><head><meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                            "<style>body{background:#0b132b;color:#ffffff;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;padding:24px;text-align:center;}" +
                            "h2{color:#38bdf8;font-size:22px;margin-bottom:8px;}p{font-size:14px;color:#94a3b8;line-height:1.5;}" +
                            "button{background:#0056d2;color:white;border:none;padding:14px 32px;border-radius:14px;font-size:15px;font-weight:bold;margin-top:24px;box-shadow:0 4px 14px rgba(0,86,210,0.4);}</style></head>" +
                            "<body><h2>Conecta 360 Movil</h2><p>El servidor o conexion con la aplicacion se esta restableciendo.</p>" +
                            "<button onclick='location.reload()'>Reintentar Conexion</button></body></html>";
                    view.loadDataWithBaseURL(null, html, "text/html", "utf-8", null);
                }
            }
        });

        // Pasar cabecera para ignorar pantalla de ngrok
        Map<String, String> headers = new HashMap<String, String>();
        headers.put("ngrok-skip-browser-warning", "true");
        webView.loadUrl(TARGET_URL, headers);
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView != null && webView.canGoBack()) {
            webView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
"@
[System.IO.File]::WriteAllText("$srcDir\MainActivity.java", $mainActivityJava, $utf8NoBom)

Write-Host "-> Compilando recursos con AAPT2..." -ForegroundColor Yellow
$aapt2 = "$buildTools\aapt2.exe"
& $aapt2 compile --dir "$resDir" -o "$binDir\res.zip"

Write-Host "-> Enlazando APK con AAPT2 link..." -ForegroundColor Yellow
& $aapt2 link -I "$platformJar" --manifest "$root\AndroidManifest.xml" -o "$binDir\app.unaligned.apk" --java "$genDir" "$binDir\res.zip" --auto-add-overlay

Write-Host "-> Compilando clases Java con javac..." -ForegroundColor Yellow
$javaFiles = Get-ChildItem -Recurse -Filter "*.java" "$genDir", "$srcDir" | ForEach-Object { $_.FullName }
javac --release 17 -cp "$platformJar" -d "$objDir" $javaFiles

Write-Host "-> Generando classes.dex con D8..." -ForegroundColor Yellow
$classFiles = Get-ChildItem -Recurse -Filter "*.class" "$objDir" | ForEach-Object { $_.FullName }
& "$buildTools\d8.bat" --lib "$platformJar" --min-api 24 --output "$dexDir" $classFiles

Write-Host "-> Incorporando classes.dex a app.unaligned.apk..." -ForegroundColor Yellow
Push-Location "$dexDir"
jar uf "$binDir\app.unaligned.apk" classes.dex
Pop-Location

Write-Host "-> Alineando APK con zipalign..." -ForegroundColor Yellow
$zipalign = "$buildTools\zipalign.exe"
& $zipalign -p -f -v 4 "$binDir\app.unaligned.apk" "$binDir\app.aligned.apk" | Out-Null

Write-Host "-> Firmando APK con apksigner (v1 + v2 + v3 scheme)..." -ForegroundColor Yellow
$keystorePath = "$root\debug.keystore"
if (-not (Test-Path $keystorePath)) {
    keytool -genkeypair -v -keystore $keystorePath -alias conecta360key -keyalg RSA -keysize 2048 -validity 10000 -storepass conecta360pass -keypass conecta360pass -dname "CN=Conecta360, OU=Dev, O=Conecta360, L=Bogota, ST=DC, C=CO"
}

$apksigner = "$buildTools\apksigner.bat"
$finalApk = "$binDir\conecta360.apk"
& $apksigner sign --ks "$keystorePath" --ks-pass "pass:conecta360pass" --key-pass "pass:conecta360pass" --ks-key-alias conecta360key --v1-signing-enabled true --v2-signing-enabled true --v3-signing-enabled true --out "$finalApk" "$binDir\app.aligned.apk"

Write-Host "-> Verificando firma del APK..." -ForegroundColor Yellow
& $apksigner verify --verbose "$finalApk"

# 1. Carpeta de facil acceso en la raiz del proyecto para pasar por USB/Drive
$rootApkFolder = "C:\Informacion David\Desarrollo\conecta360\apk"
if (-not (Test-Path $rootApkFolder)) {
    New-Item -ItemType Directory -Force -Path $rootApkFolder | Out-Null
}
$rootApkDest = "$rootApkFolder\conecta360.apk"
Copy-Item "$finalApk" "$rootApkDest" -Force

# 2. Carpeta publica para descarga web
$destPath = "C:\Informacion David\Desarrollo\conecta360\frontend\public\downloads\conecta360.apk"
Copy-Item "$finalApk" "$destPath" -Force

$apkSize = (Get-Item "$rootApkDest").Length
Write-Host "=== APK compilado, optimizado y firmado con exito ===" -ForegroundColor Green
Write-Host "Ruta 1 (En codigo raiz para copiar a telefono): $rootApkDest"
Write-Host "Ruta 2 (Para descarga web): $destPath"
Write-Host "Tamano: $([Math]::Round($apkSize / 1024, 2)) KB"
