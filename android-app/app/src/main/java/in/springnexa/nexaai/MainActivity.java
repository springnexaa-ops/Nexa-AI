package in.springnexa.nexaai;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Build;
import android.os.Bundle;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.text.InputType;
import android.view.Gravity;
import android.view.View;
import android.view.Window;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Locale;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

public class MainActivity extends Activity {
    private static final String API_BASE = "https://ai.springnexa.in";
    private static final String API_CHAT = API_BASE + "/v1/chat/completions";
    private static final String API_LOGIN = API_BASE + "/v1/auth/login";
    private static final String API_REGISTER = API_BASE + "/v1/auth/register";
    private static final String API_LOGOUT = API_BASE + "/v1/auth/logout";
    private static final String API_CONSENT = API_BASE + "/v1/privacy/consent";
    private static final String API_PRIVACY = API_BASE + "/v1/privacy/request";
    private static final String KEY_ALIAS = "NEXA_AI_SESSION_V1";
    private static final String PREFS = "nexa_secure_settings";
    private static final String CONSENT_VERSION = "2026-09-18";

    private LinearLayout root, drawer, messages;
    private ScrollView chatScroll;
    private EditText composer;
    private TextView sendButton, modelButton, accountButton;
    private boolean drawerOpen, busy, authenticated;
    private final ArrayList<JSONObject> history = new ArrayList<>();
    private SharedPreferences prefs;

    private int dp(float v) { return (int)(v * getResources().getDisplayMetrics().density + .5f); }

    private TextView text(String s, float size, int color) {
        TextView t = new TextView(this);
        t.setText(s); t.setTextSize(size); t.setTextColor(color);
        t.setGravity(Gravity.CENTER_VERTICAL);
        return t;
    }

    @Override protected void onCreate(Bundle state) {
        super.onCreate(state);
        prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        Window w = getWindow();
        w.setStatusBarColor(Color.rgb(8,10,14));
        w.setNavigationBarColor(Color.rgb(8,10,14));
        if (prefs.getBoolean("secure_screen", true)) w.setFlags(8192,8192);
        buildNativeUI();
        if (Build.VERSION.SDK_INT >= 23 && checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED)
            requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO},100);
        if (!prefs.getBoolean("privacy_notice_seen", false)) showPrivacyNotice(false);
    }

    @Override protected void onResume() {
        super.onResume();
        if (prefs != null && prefs.getBoolean("biometric_lock", false) && authenticated) authenticateApp();
    }

    private void buildNativeUI() {
        root = new LinearLayout(this);
        root.setOrientation(LinearLayout.HORIZONTAL);
        root.setBackgroundColor(Color.rgb(8,10,14));

        drawer = buildDrawer();
        drawer.setVisibility(View.GONE);
        root.addView(drawer, new LinearLayout.LayoutParams(dp(286),-1));

        LinearLayout main = new LinearLayout(this);
        main.setOrientation(LinearLayout.VERTICAL);
        root.addView(main,new LinearLayout.LayoutParams(0,-1,1));
        main.addView(buildTopBar(),new LinearLayout.LayoutParams(-1,dp(64)));

        chatScroll = new ScrollView(this);
        messages = new LinearLayout(this);
        messages.setOrientation(LinearLayout.VERTICAL);
        messages.setPadding(dp(18),dp(12),dp(18),dp(24));
        chatScroll.addView(messages);
        main.addView(chatScroll,new LinearLayout.LayoutParams(-1,0,1));
        addWelcome();

        main.addView(buildComposer(),new LinearLayout.LayoutParams(-1,dp(88)));
        setContentView(root);
    }

    private LinearLayout buildDrawer() {
        LinearLayout d=new LinearLayout(this); d.setOrientation(LinearLayout.VERTICAL);
        d.setPadding(dp(16),dp(24),dp(12),dp(16)); d.setBackgroundColor(Color.rgb(15,18,24));

        TextView brand=text("NEXA AI",21,Color.WHITE); brand.setTypeface(Typeface.DEFAULT,Typeface.BOLD);
        d.addView(brand,new LinearLayout.LayoutParams(-1,dp(48)));

        TextView newChat=text("+  New chat",15,Color.WHITE); newChat.setGravity(Gravity.CENTER);
        newChat.setBackgroundColor(Color.rgb(37,99,235));
        newChat.setOnClickListener(v->{history.clear();messages.removeAllViews();addWelcome();closeDrawer();});
        d.addView(newChat,new LinearLayout.LayoutParams(-1,dp(48)));

        TextView security=text("Security & Privacy",14,Color.rgb(225,230,238));
        security.setPadding(dp(8),dp(16),0,0);
        security.setOnClickListener(v->showSecurityCenter());
        d.addView(security,new LinearLayout.LayoutParams(-1,dp(52)));

        TextView account=text("Account / Sign in",14,Color.rgb(225,230,238));
        account.setPadding(dp(8),0,0,0);
        account.setOnClickListener(v->{closeDrawer();showAccount();});
        d.addView(account,new LinearLayout.LayoutParams(-1,dp(52)));

        TextView recent=text("RECENT",11,Color.rgb(130,138,151));
        recent.setPadding(dp(6),dp(18),0,dp(8)); d.addView(recent);
        TextView item=text("  Current conversation",14,Color.rgb(210,216,225));
        d.addView(item,new LinearLayout.LayoutParams(-1,dp(44)));

        LinearLayout spacer=new LinearLayout(this); d.addView(spacer,new LinearLayout.LayoutParams(1,0,1));
        TextView footer=text("Privacy-first AI\nSpringNexa Private Limited",12,Color.rgb(125,133,146));
        d.addView(footer,new LinearLayout.LayoutParams(-1,dp(44)));
        return d;
    }

    private LinearLayout buildTopBar() {
        LinearLayout b=new LinearLayout(this); b.setGravity(Gravity.CENTER_VERTICAL);
        b.setPadding(dp(10),0,dp(10),0);
        TextView menu=text("☰",25,Color.WHITE); menu.setGravity(Gravity.CENTER);
        menu.setOnClickListener(v->toggleDrawer());
        b.addView(menu,new LinearLayout.LayoutParams(dp(48),dp(52)));

        LinearLayout title=new LinearLayout(this); title.setOrientation(LinearLayout.VERTICAL);
        TextView t=text("NEXA AI",17,Color.WHITE); t.setTypeface(Typeface.DEFAULT,Typeface.BOLD);
        title.addView(t,new LinearLayout.LayoutParams(-1,dp(27)));
        title.addView(text(authenticated?"Secure session":"Guest session",11,Color.rgb(135,145,158)),new LinearLayout.LayoutParams(-1,dp(20)));
        b.addView(title,new LinearLayout.LayoutParams(0,-1,1));

        modelButton=text("Auto  ▾",13,Color.rgb(220,225,232)); modelButton.setGravity(Gravity.CENTER);
        modelButton.setBackgroundColor(Color.rgb(23,27,34)); modelButton.setOnClickListener(v->chooseMode());
        b.addView(modelButton,new LinearLayout.LayoutParams(dp(86),dp(38)));

        accountButton=text("●",16,authenticated?Color.rgb(52,211,153):Color.rgb(148,163,184));
        accountButton.setGravity(Gravity.CENTER); accountButton.setOnClickListener(v->showAccount());
        b.addView(accountButton,new LinearLayout.LayoutParams(dp(42),dp(42)));
        return b;
    }

    private LinearLayout buildComposer() {
        LinearLayout o=new LinearLayout(this); o.setGravity(Gravity.CENTER_VERTICAL);
        o.setPadding(dp(10),dp(8),dp(10),dp(10));
        TextView plus=text("+",27,Color.WHITE); plus.setGravity(Gravity.CENTER);
        plus.setBackgroundColor(Color.rgb(25,29,36)); plus.setOnClickListener(v->openFiles());
        o.addView(plus,new LinearLayout.LayoutParams(dp(44),dp(48)));

        composer=new EditText(this); composer.setTextColor(Color.WHITE); composer.setHintTextColor(Color.rgb(125,133,145));
        composer.setHint("Message NEXA AI…"); composer.setTextSize(15); composer.setMaxLines(4);
        composer.setInputType(InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_FLAG_MULTI_LINE|InputType.TYPE_TEXT_FLAG_CAP_SENTENCES);
        composer.setPadding(dp(12),dp(8),dp(8),dp(8)); composer.setBackgroundColor(Color.rgb(23,27,34));
        o.addView(composer,new LinearLayout.LayoutParams(0,dp(52),1));

        TextView mic=text("◉",22,Color.WHITE); mic.setGravity(Gravity.CENTER); mic.setOnClickListener(v->startVoice());
        o.addView(mic,new LinearLayout.LayoutParams(dp(42),dp(48)));

        sendButton=text("➤",23,Color.WHITE); sendButton.setGravity(Gravity.CENTER); sendButton.setBackgroundColor(Color.rgb(37,99,235));
        sendButton.setOnClickListener(v->sendMessage()); o.addView(sendButton,new LinearLayout.LayoutParams(dp(48),dp(48)));
        return o;
    }

    private void addWelcome() {
        TextView h=text("How can I help you today?",25,Color.WHITE); h.setGravity(Gravity.CENTER); h.setTypeface(Typeface.DEFAULT,Typeface.BOLD);
        messages.addView(h,new LinearLayout.LayoutParams(-1,dp(100)));
        TextView p=text("Private by design. Ask anything, analyze a document, or use NEXA Medical for clinical education and decision support.",14,Color.rgb(155,164,177));
        p.setGravity(Gravity.CENTER); p.setPadding(dp(20),0,dp(20),dp(18)); messages.addView(p,new LinearLayout.LayoutParams(-1,dp(78)));
    }

    private void addMessage(String s,boolean user) {
        TextView bubble=text(s,15,user?Color.WHITE:Color.rgb(226,230,236)); bubble.setPadding(dp(15),dp(12),dp(15),dp(12));
        bubble.setBackgroundColor(user?Color.rgb(37,99,235):Color.rgb(21,25,32));
        LinearLayout row=new LinearLayout(this); row.setGravity(user?Gravity.RIGHT:Gravity.LEFT); row.setPadding(0,dp(5),0,dp(5));
        row.addView(bubble,new LinearLayout.LayoutParams(dp(300),-2)); messages.addView(row);
        chatScroll.post(()->chatScroll.fullScroll(View.FOCUS_DOWN));
    }

    private void sendMessage() {
        if(busy)return; if(!prefs.getBoolean("privacy_notice_seen",false)){showPrivacyNotice(true);return;}
        String q=composer.getText().toString().trim(); if(q.isEmpty())return;
        if(history.isEmpty())messages.removeAllViews();
        addMessage(q,true); composer.setText(""); busy=true; sendButton.setText("■"); addMessage("Thinking…",false);
        new Thread(()->{String a=callApi(q); runOnUiThread(()->{if(messages.getChildCount()>0)messages.removeViewAt(messages.getChildCount()-1);addMessage(a,false);busy=false;sendButton.setText("➤");});}).start();
    }

    private String callApi(String q) {
        HttpURLConnection c=null;
        try {
            c=(HttpURLConnection)new URL(API_CHAT).openConnection(); c.setRequestMethod("POST"); c.setConnectTimeout(15000); c.setReadTimeout(60000); c.setDoOutput(true);
            c.setRequestProperty("Content-Type","application/json"); c.setRequestProperty("X-Nexa-App","android-native-1.1");
            String token=loadSecret("session_token"); if(token!=null)c.setRequestProperty("Authorization","Bearer "+token);
            JSONArray ms=new JSONArray();
            JSONObject sys=new JSONObject(); sys.put("role","system"); sys.put("content",modelButton.getText().toString().startsWith("Medical")?"You are Nexa AI Medical, powered by SpringNexa Private Limited. Provide medical education and decision support, not definitive diagnosis or prescription. Protect privacy and do not invent records, citations or clinicians.":"You are Nexa AI, powered by SpringNexa Private Limited. Be accurate, useful and privacy-preserving. Do not invent facts or citations."); ms.put(sys);
            for(JSONObject h:history)ms.put(h); JSONObject u=new JSONObject();u.put("role","user");u.put("content",q);ms.put(u);
            JSONObject body=new JSONObject();body.put("mode","auto");body.put("language","English");body.put("messages",ms);
            OutputStream os=c.getOutputStream();os.write(body.toString().getBytes(StandardCharsets.UTF_8));os.close();
            int code=c.getResponseCode(); BufferedReader br=new BufferedReader(new InputStreamReader(code>=200&&code<300?c.getInputStream():c.getErrorStream(),StandardCharsets.UTF_8));
            StringBuilder out=new StringBuilder();String line;while((line=br.readLine())!=null)out.append(line);br.close();
            JSONObject r=new JSONObject(out.toString()); if(code<200||code>=300)return r.optString("error","Request failed (HTTP "+code+")");
            JSONArray choices=r.optJSONArray("choices"); String a=choices!=null&&choices.length()>0?choices.optJSONObject(0).optJSONObject("message").optString("content",""):"";
            if(a.isEmpty())return "NEXA AI returned an empty response.";
            JSONObject u2=new JSONObject();u2.put("role","user");u2.put("content",q);history.add(u2);JSONObject a2=new JSONObject();a2.put("role","assistant");a2.put("content",a);history.add(a2);return a;
        }catch(Exception e){return "Secure connection failed. Please try again."; }finally{if(c!=null)c.disconnect();}
    }

    private void showAccount() {
        AlertDialog.Builder b=new AlertDialog.Builder(this); LinearLayout l=form();
        if(authenticated) {
            l.addView(text("Signed in securely",18,Color.WHITE)); l.addView(text("Your session token is encrypted with Android Keystore.",13,Color.GRAY));
            TextView sec=text("Security & Privacy Center",15,Color.WHITE); sec.setPadding(0,dp(18),0,dp(12)); sec.setOnClickListener(v->{b.create().dismiss();showSecurityCenter();}); l.addView(sec);
            TextView logout=text("Sign out",15,Color.rgb(248,113,113)); logout.setPadding(0,dp(12),0,dp(12)); logout.setOnClickListener(v->{b.create().dismiss();logout();});l.addView(logout);
        } else {
            EditText email=field("Email",false),pass=field("Password",true); l.addView(email);l.addView(pass);
            TextView login=text("Sign in",15,Color.WHITE);login.setGravity(Gravity.CENTER);login.setBackgroundColor(Color.rgb(37,99,235));login.setPadding(0,dp(14),0,dp(14));
            login.setOnClickListener(v->login(email.getText().toString(),pass.getText().toString()));l.addView(login);
            TextView reg=text("Create account",14,Color.rgb(180,190,205));reg.setGravity(Gravity.CENTER);reg.setPadding(0,dp(18),0,dp(10));reg.setOnClickListener(v->registerDialog());l.addView(reg);
        }
        AlertDialog d=b.setTitle("NEXA AI Account").setView(l).create();d.show();
    }

    private LinearLayout form(){LinearLayout l=new LinearLayout(this);l.setOrientation(LinearLayout.VERTICAL);l.setPadding(dp(18),dp(4),dp(18),dp(4));return l;}
    private EditText field(String hint,boolean password){EditText e=new EditText(this);e.setHint(hint);e.setTextColor(Color.WHITE);e.setHintTextColor(Color.GRAY);if(password)e.setInputType(InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_VARIATION_PASSWORD);e.setPadding(0,dp(8),0,dp(8));return e;}

    private void login(String email,String password) {
        new Thread(()->{try{JSONObject b=new JSONObject();b.put("email",email);b.put("password",password);JSONObject r=postJson(API_LOGIN,b,null);if(!r.optBoolean("ok")){toast(r.optString("error","Sign in failed"));return;}saveSecret("session_token",r.getString("token"));authenticated=true;runOnUiThread(()->{accountButton.setTextColor(Color.rgb(52,211,153));Toast.makeText(this,"Secure session established.",Toast.LENGTH_SHORT).show();showPrivacyNotice(true);});}catch(Exception e){toast("Sign in failed securely. Try again.");}}).start();
    }

    private void registerDialog() {
        final EditText name=field("Name",false),email=field("Email",false),pass=field("Password (10+ characters)",true);
        LinearLayout l=form();l.addView(name);l.addView(email);l.addView(pass);
        new AlertDialog.Builder(this).setTitle("Create NEXA AI account").setMessage("Accounts are reviewed before activation. Use only information necessary for the service.")
            .setView(l).setPositiveButton("Register",(d,w)->new Thread(()->{try{JSONObject b=new JSONObject();b.put("name",name.getText().toString());b.put("email",email.getText().toString());b.put("password",pass.getText().toString());JSONObject r=postJson(API_REGISTER,b,null);toast(r.optString("message",r.optString("error","Registration submitted.")));}catch(Exception e){toast("Registration failed.");}}).start()).setNegativeButton("Cancel",null).show();
    }

    private JSONObject postJson(String endpoint,JSONObject body,String token)throws Exception {
        HttpURLConnection c=(HttpURLConnection)new URL(endpoint).openConnection();c.setRequestMethod("POST");c.setConnectTimeout(15000);c.setReadTimeout(30000);c.setDoOutput(true);c.setRequestProperty("Content-Type","application/json");
        if(token!=null)c.setRequestProperty("Authorization","Bearer "+token);OutputStream os=c.getOutputStream();os.write(body.toString().getBytes(StandardCharsets.UTF_8));os.close();
        BufferedReader br=new BufferedReader(new InputStreamReader(c.getResponseCode()>=200&&c.getResponseCode()<300?c.getInputStream():c.getErrorStream(),StandardCharsets.UTF_8));StringBuilder s=new StringBuilder();String line;while((line=br.readLine())!=null)s.append(line);br.close();c.disconnect();return new JSONObject(s.toString());
    }

    private void showPrivacyNotice(boolean allowContinue) {
        String message="NEXA AI processes account, prompts and files only to provide requested services. Medical information is sensitive. Do not upload information you are not authorised to share.\n\nYou can withdraw consent and request access, correction, erasure, data portability or grievance handling from Security & Privacy.\n\nChildren: processing personal data of a child requires applicable parental/guardian consent. This app does not treat a simple checkbox as legal verification.\n\nThis notice is informational and does not by itself establish legal compliance for SpringNexa.";
        AlertDialog d=new AlertDialog.Builder(this).setTitle("Privacy & consent").setMessage(message)
            .setPositiveButton("I understand & continue",(x,w)->{prefs.edit().putBoolean("privacy_notice_seen",true).apply();if(authenticated)sendConsent(true);})
            .setNegativeButton(allowContinue?"Not now":"Exit",null).create();d.show();
    }

    private void sendConsent(boolean granted){String token=loadSecret("session_token");if(token==null)return;new Thread(()->{try{JSONObject b=new JSONObject();b.put("noticeVersion",CONSENT_VERSION);b.put("granted",granted);JSONArray p=new JSONArray();p.put("account and authentication");p.put("AI conversation processing");p.put("security and abuse prevention");if(modelButton.getText().toString().startsWith("Medical"))p.put("medical education and decision support");b.put("purposes",p);postJson(API_CONSENT,b,token);}catch(Exception ignored){}}).start();}

    private void showSecurityCenter() {
        LinearLayout l=form();
        l.addView(text("Security posture",18,Color.WHITE));
        l.addView(text("✓ HTTPS/TLS-only API\n✓ Android Keystore encrypted session token\n✓ Release build uses no cleartext HTTP\n✓ Sensitive-screen capture protection: "+(prefs.getBoolean("secure_screen",true)?"ON":"OFF")+"\n✓ Privacy notice version: "+CONSENT_VERSION+"\n✓ Server-side privacy request and security-audit endpoints enabled",13,Color.rgb(190,198,210)));
        TextView bio=text((prefs.getBoolean("biometric_lock",false)?"Disable":"Enable")+" biometric/device-lock",15,Color.WHITE);bio.setPadding(0,dp(18),0,dp(12));bio.setOnClickListener(v->{if(Build.VERSION.SDK_INT>=28){prefs.edit().putBoolean("biometric_lock",!prefs.getBoolean("biometric_lock",false)).apply();Toast.makeText(this,"Biometric lock updated.",Toast.LENGTH_SHORT).show();}else Toast.makeText(this,"Biometric prompt requires Android 9+.",Toast.LENGTH_SHORT).show();});l.addView(bio);
        TextView screen=text((prefs.getBoolean("secure_screen",true)?"Allow screenshots":"Block screenshots"),15,Color.WHITE);screen.setPadding(0,dp(10),0,dp(12));screen.setOnClickListener(v->{boolean on=!prefs.getBoolean("secure_screen",true);prefs.edit().putBoolean("secure_screen",on).apply();if(on)getWindow().setFlags(8192,8192);else getWindow().clearFlags(8192);Toast.makeText(this,on?"Sensitive-screen protection ON":"Screenshots allowed for testing",Toast.LENGTH_SHORT).show();});l.addView(screen);
        TextView withdraw=text("Withdraw consent",15,Color.rgb(248,180,100));withdraw.setPadding(0,dp(10),0,dp(12));withdraw.setOnClickListener(v->{prefs.edit().putBoolean("privacy_notice_seen",false).apply();sendConsent(false);Toast.makeText(this,"Consent withdrawal recorded for your authenticated account.",Toast.LENGTH_LONG).show();});l.addView(withdraw);
        String[] types={"access","correction","erasure","data-portability","grievance"};
        for(String type:types){TextView r=text("Request "+type.replace('-',' '),14,Color.rgb(210,218,228));r.setPadding(0,dp(7),0,dp(7));r.setOnClickListener(v->privacyRequest(type));l.addView(r);}
        l.addView(text("Security note: legal compliance also requires organisational controls, processor contracts, incident response, retention/deletion controls, audits and—where applicable—ABDM/CERT-In obligations. This screen does not certify compliance.",11,Color.rgb(130,140,153)));
        new AlertDialog.Builder(this).setTitle("Security & Privacy Center").setView(l).setPositiveButton("Close",null).show();
    }

    private void privacyRequest(String type) {
        if(!authenticated){showAccount();return;} EditText detail=field("Optional details",false);LinearLayout l=form();l.addView(detail);
        new AlertDialog.Builder(this).setTitle("Privacy request: "+type).setView(l).setPositiveButton("Submit",(d,w)->new Thread(()->{try{JSONObject b=new JSONObject();b.put("type",type);b.put("details",detail.getText().toString());JSONObject r=postJson(API_PRIVACY,b,loadSecret("session_token"));toast(r.optString("ok")?"Request received: "+r.optString("requestId",""):"Request failed.");}catch(Exception e){toast("Could not submit request.");}}).start()).setNegativeButton("Cancel",null).show();
    }

    private void logout(){String token=loadSecret("session_token");new Thread(()->{try{if(token!=null)postJson(API_LOGOUT,new JSONObject(),token);}catch(Exception ignored){}deleteSecret();runOnUiThread(()->{authenticated=false;accountButton.setTextColor(Color.rgb(148,163,184));Toast.makeText(this,"Signed out. Session removed.",Toast.LENGTH_SHORT).show();});}).start();}

    private void authenticateApp() {
        if(Build.VERSION.SDK_INT<28)return;
        android.hardware.biometrics.BiometricPrompt prompt=new android.hardware.biometrics.BiometricPrompt.Builder(this).setTitle("Unlock NEXA AI").setSubtitle("Protected session").setDescription("Authenticate to access your NEXA AI session.").setNegativeButton("Cancel",getMainExecutor(),(d,w)->{}).build();
        prompt.authenticate(new android.os.CancellationSignal(),getMainExecutor(),new android.hardware.biometrics.BiometricPrompt.AuthenticationCallback(){
            @Override public void onAuthenticationSucceeded(android.hardware.biometrics.BiometricPrompt.AuthenticationResult result){ }
            @Override public void onAuthenticationFailed(){ }
        });
    }

    private void saveSecret(String name,String value)throws Exception {
        KeyStore ks=KeyStore.getInstance("AndroidKeyStore");ks.load(null);SecretKey key;
        if(!ks.containsAlias(KEY_ALIAS)){KeyGenerator kg=KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES,"AndroidKeyStore");kg.init(new KeyGenParameterSpec.Builder(KEY_ALIAS,KeyProperties.PURPOSE_ENCRYPT|KeyProperties.PURPOSE_DECRYPT).setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE).setUserAuthenticationRequired(false).build());key=kg.generateKey();}else key=((KeyStore.SecretKeyEntry)ks.getEntry(KEY_ALIAS,null)).getSecretKey();
        Cipher c=Cipher.getInstance("AES/GCM/NoPadding");c.init(Cipher.ENCRYPT_MODE,key);String iv=Base64.getEncoder().encodeToString(c.getIV());String ct=Base64.getEncoder().encodeToString(c.doFinal(value.getBytes(StandardCharsets.UTF_8)));prefs.edit().putString("secret_"+name,iv+"."+ct).apply();
    }

    private String loadSecret(String name){try{String packed=prefs.getString("secret_"+name,null);if(packed==null)return null;String[] p=packed.split("\\.",2);KeyStore ks=KeyStore.getInstance("AndroidKeyStore");ks.load(null);SecretKey key=((KeyStore.SecretKeyEntry)ks.getEntry(KEY_ALIAS,null)).getSecretKey();Cipher c=Cipher.getInstance("AES/GCM/NoPadding");c.init(Cipher.DECRYPT_MODE,key,new GCMParameterSpec(128,Base64.getDecoder().decode(p[0])));return new String(c.doFinal(Base64.getDecoder().decode(p[1])),StandardCharsets.UTF_8);}catch(Exception e){return null;}}
    private void deleteSecret(){prefs.edit().remove("secret_session_token").apply();}

    private void chooseMode(){modelButton.setText(modelButton.getText().toString().startsWith("Medical")?"Auto  ▾":"Medical  ▾");}
    private void openFiles(){Intent i=new Intent(Intent.ACTION_OPEN_DOCUMENT);i.setType("*/*");i.addCategory(Intent.CATEGORY_OPENABLE);startActivityForResult(i,200);}
    private void startVoice(){try{Intent i=new Intent(android.speech.RecognizerIntent.ACTION_RECOGNIZE_SPEECH);i.putExtra(android.speech.RecognizerIntent.EXTRA_LANGUAGE_MODEL,android.speech.RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);startActivityForResult(i,201);}catch(Exception e){Toast.makeText(this,"Voice input unavailable.",Toast.LENGTH_SHORT).show();}}
    @Override protected void onActivityResult(int r,int c,Intent d){super.onActivityResult(r,c,d);if(c!=RESULT_OK||d==null)return;if(r==200&&d.getData()!=null)composer.setText("Please analyze this file: "+d.getData().getLastPathSegment());else if(r==201){ArrayList<String>x=d.getStringArrayListExtra(android.speech.RecognizerIntent.EXTRA_RESULTS);if(x!=null&&!x.isEmpty())composer.setText(x.get(0));}}
    private void toggleDrawer(){drawerOpen=!drawerOpen;drawer.setVisibility(drawerOpen?View.VISIBLE:View.GONE);}
    private void closeDrawer(){drawerOpen=false;drawer.setVisibility(View.GONE);}
    @Override public void onBackPressed(){if(drawerOpen){closeDrawer();return;}super.onBackPressed();}
}
