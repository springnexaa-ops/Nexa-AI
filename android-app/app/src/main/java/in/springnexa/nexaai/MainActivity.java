package in.springnexa.nexaai;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.os.Bundle;
import android.os.Handler;
import android.speech.RecognizerIntent;
import android.view.Gravity;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.inputmethod.InputMethodManager;
import android.content.Context;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;
import android.net.Uri;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Locale;

public class MainActivity extends Activity {
    private static final String API_URL = "https://ai.springnexa.in/v1/chat/completions";
    private static final int FILE_PICKER = 200;
    private static final int VOICE_INPUT = 201;

    private LinearLayout root;
    private LinearLayout drawer;
    private LinearLayout messages;
    private ScrollView chatScroll;
    private EditText composer;
    private TextView sendButton;
    private TextView modelButton;
    private boolean drawerOpen = false;
    private boolean busy = false;
    private final ArrayList<JSONObject> history = new ArrayList<>();
    private final Handler handler = new Handler();

    private int dp(float v) {
        return (int) (v * getResources().getDisplayMetrics().density + 0.5f);
    }

    private TextView label(String text, float size, int color) {
        TextView t = new TextView(this);
        t.setText(text);
        t.setTextSize(size);
        t.setTextColor(color);
        t.setGravity(Gravity.CENTER_VERTICAL);
        return t;
    }

    private GradientButton button(String text) {
        return new GradientButton(this, text);
    }

    @Override protected void onCreate(Bundle state) {
        super.onCreate(state);
        Window w = getWindow();
        w.setStatusBarColor(Color.rgb(8, 10, 14));
        w.setNavigationBarColor(Color.rgb(8, 10, 14));
        if (android.os.Build.VERSION.SDK_INT >= 23) {
            w.getDecorView().setSystemUiVisibility(0);
        }
        buildNativeUI();
        if (android.os.Build.VERSION.SDK_INT >= 23 &&
            checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, 100);
        }
    }

    private void buildNativeUI() {
        root = new LinearLayout(this);
        root.setOrientation(LinearLayout.HORIZONTAL);
        root.setBackgroundColor(Color.rgb(8, 10, 14));

        drawer = buildDrawer();
        root.addView(drawer, new LinearLayout.LayoutParams(dp(286), -1));

        LinearLayout main = new LinearLayout(this);
        main.setOrientation(LinearLayout.VERTICAL);
        main.setBackgroundColor(Color.rgb(8, 10, 14));
        root.addView(main, new LinearLayout.LayoutParams(0, -1, 1));

        main.addView(buildTopBar(), new LinearLayout.LayoutParams(-1, dp(64)));

        chatScroll = new ScrollView(this);
        chatScroll.setFillViewport(true);
        messages = new LinearLayout(this);
        messages.setOrientation(LinearLayout.VERTICAL);
        messages.setPadding(dp(18), dp(12), dp(18), dp(24));
        chatScroll.addView(messages);
        main.addView(chatScroll, new LinearLayout.LayoutParams(-1, 0, 1));

        addWelcome();

        main.addView(buildComposer(), new LinearLayout.LayoutParams(-1, dp(88)));
        drawer.setVisibility(View.GONE);
        setContentView(root);
    }

    private LinearLayout buildDrawer() {
        LinearLayout d = new LinearLayout(this);
        d.setOrientation(LinearLayout.VERTICAL);
        d.setPadding(dp(16), dp(24), dp(12), dp(16));
        d.setBackgroundColor(Color.rgb(15, 18, 24));

        TextView brand = label("NEXA AI", 21, Color.WHITE);
        brand.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        d.addView(brand, new LinearLayout.LayoutParams(-1, dp(48)));

        GradientButton newChat = button("+  New chat");
        newChat.setOnClickListener(v -> {
            history.clear();
            messages.removeAllViews();
            addWelcome();
            closeDrawer();
        });
        d.addView(newChat, new LinearLayout.LayoutParams(-1, dp(48)));

        TextView recent = label("RECENT", 11, Color.rgb(130, 138, 151));
        recent.setPadding(dp(6), dp(22), 0, dp(8));
        d.addView(recent);

        TextView item = label("  Current conversation", 14, Color.rgb(220, 224, 230));
        item.setPadding(dp(8), 0, 0, 0);
        d.addView(item, new LinearLayout.LayoutParams(-1, dp(44)));

        LinearLayout spacer = new LinearLayout(this);
        d.addView(spacer, new LinearLayout.LayoutParams(1, 0, 1));

        TextView footer = label("SpringNexa Private Limited\nAI • Healthcare • Technology", 12, Color.rgb(125, 133, 146));
        footer.setPadding(dp(6), 0, 0, dp(12));
        d.addView(footer);
        return d;
    }

    private LinearLayout buildTopBar() {
        LinearLayout bar = new LinearLayout(this);
        bar.setGravity(Gravity.CENTER_VERTICAL);
        bar.setPadding(dp(10), 0, dp(10), 0);
        bar.setBackgroundColor(Color.rgb(8, 10, 14));

        TextView menu = label("☰", 25, Color.WHITE);
        menu.setGravity(Gravity.CENTER);
        menu.setOnClickListener(v -> toggleDrawer());
        bar.addView(menu, new LinearLayout.LayoutParams(dp(48), dp(52)));

        LinearLayout titleBox = new LinearLayout(this);
        titleBox.setOrientation(LinearLayout.VERTICAL);
        titleBox.setPadding(dp(4), 0, 0, 0);
        TextView title = label("NEXA AI", 17, Color.WHITE);
        title.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        titleBox.addView(title, new LinearLayout.LayoutParams(-1, dp(27)));
        TextView sub = label("SpringNexa", 11, Color.rgb(135, 145, 158));
        titleBox.addView(sub, new LinearLayout.LayoutParams(-1, dp(20)));
        bar.addView(titleBox, new LinearLayout.LayoutParams(0, -1, 1));

        modelButton = label("Auto  ▾", 13, Color.rgb(220, 225, 232));
        modelButton.setGravity(Gravity.CENTER);
        modelButton.setPadding(dp(10), 0, dp(10), 0);
        modelButton.setBackgroundColor(Color.rgb(23, 27, 34));
        modelButton.setOnClickListener(v -> chooseMode());
        bar.addView(modelButton, new LinearLayout.LayoutParams(dp(82), dp(38)));
        return bar;
    }

    private LinearLayout buildComposer() {
        LinearLayout outer = new LinearLayout(this);
        outer.setOrientation(LinearLayout.HORIZONTAL);
        outer.setGravity(Gravity.CENTER_VERTICAL);
        outer.setPadding(dp(10), dp(8), dp(10), dp(10));
        outer.setBackgroundColor(Color.rgb(8, 10, 14));

        TextView plus = label("+", 27, Color.WHITE);
        plus.setGravity(Gravity.CENTER);
        plus.setBackgroundColor(Color.rgb(25, 29, 36));
        plus.setOnClickListener(v -> openFiles());
        outer.addView(plus, new LinearLayout.LayoutParams(dp(44), dp(48)));

        composer = new EditText(this);
        composer.setTextColor(Color.WHITE);
        composer.setHintTextColor(Color.rgb(125, 133, 145));
        composer.setHint("Message NEXA AI…");
        composer.setTextSize(15);
        composer.setSingleLine(false);
        composer.setMaxLines(4);
        composer.setPadding(dp(12), dp(8), dp(8), dp(8));
        composer.setBackgroundColor(Color.rgb(23, 27, 34));
        outer.addView(composer, new LinearLayout.LayoutParams(0, dp(52), 1));

        TextView mic = label("◉", 22, Color.WHITE);
        mic.setGravity(Gravity.CENTER);
        mic.setOnClickListener(v -> startVoice());
        outer.addView(mic, new LinearLayout.LayoutParams(dp(42), dp(48)));

        sendButton = label("➤", 23, Color.WHITE);
        sendButton.setGravity(Gravity.CENTER);
        sendButton.setBackgroundColor(Color.rgb(37, 99, 235));
        sendButton.setOnClickListener(v -> sendMessage());
        outer.addView(sendButton, new LinearLayout.LayoutParams(dp(48), dp(48)));
        return outer;
    }

    private void addWelcome() {
        TextView h = label("How can I help you today?", 25, Color.WHITE);
        h.setGravity(Gravity.CENTER);
        h.setTypeface(Typeface.DEFAULT, Typeface.BOLD);
        messages.addView(h, new LinearLayout.LayoutParams(-1, dp(100)));

        TextView p = label("Ask anything, analyze a document, or switch to NEXA Medical for clinical education and decision support.", 14, Color.rgb(155, 164, 177));
        p.setGravity(Gravity.CENTER);
        p.setPadding(dp(20), 0, dp(20), dp(18));
        messages.addView(p, new LinearLayout.LayoutParams(-1, dp(70)));

        LinearLayout chips = new LinearLayout(this);
        chips.setGravity(Gravity.CENTER);
        String[] qs = {"Explain something", "Analyze a file", "NEXA Medical"};
        for (String q : qs) {
            TextView c = label(q, 12, Color.rgb(210, 216, 225));
            c.setGravity(Gravity.CENTER);
            c.setBackgroundColor(Color.rgb(22, 26, 33));
            c.setPadding(dp(10), 0, dp(10), 0);
            c.setOnClickListener(v -> {
                if (((TextView)v).getText().toString().contains("Medical")) {
                    modelButton.setText("Medical  ▾");
                }
                composer.setText(((TextView)v).getText().toString());
                composer.requestFocus();
            });
            chips.addView(c, new LinearLayout.LayoutParams(0, dp(42), 1));
        }
        messages.addView(chips, new LinearLayout.LayoutParams(-1, dp(52)));
    }

    private void addMessage(String text, boolean user) {
        TextView bubble = label(text, 15, user ? Color.WHITE : Color.rgb(226, 230, 236));
        bubble.setPadding(dp(15), dp(12), dp(15), dp(12));
        bubble.setGravity(Gravity.CENTER_VERTICAL);
        bubble.setBackgroundColor(user ? Color.rgb(37, 99, 235) : Color.rgb(21, 25, 32));
        LinearLayout row = new LinearLayout(this);
        row.setGravity(user ? Gravity.RIGHT : Gravity.LEFT);
        row.setPadding(0, dp(5), 0, dp(5));
        row.addView(bubble, new LinearLayout.LayoutParams(dp(285), -2));
        messages.addView(row);
        chatScroll.post(() -> chatScroll.fullScroll(View.FOCUS_DOWN));
    }

    private void sendMessage() {
        if (busy) return;
        String text = composer.getText().toString().trim();
        if (text.isEmpty()) return;
        if (history.isEmpty()) messages.removeAllViews();
        addMessage(text, true);
        composer.setText("");
        busy = true;
        sendButton.setText("■");
        addMessage("Thinking…", false);

        new Thread(() -> {
            String answer = callApi(text);
            handler.post(() -> {
                if (messages.getChildCount() > 0) messages.removeViewAt(messages.getChildCount() - 1);
                addMessage(answer, false);
                busy = false;
                sendButton.setText("➤");
            });
        }).start();
    }

    private String callApi(String text) {
        HttpURLConnection c = null;
        try {
            URL u = new URL(API_URL);
            c = (HttpURLConnection) u.openConnection();
            c.setRequestMethod("POST");
            c.setConnectTimeout(15000);
            c.setReadTimeout(60000);
            c.setDoOutput(true);
            c.setRequestProperty("Content-Type", "application/json");
            JSONArray msgs = new JSONArray();
            String system = modelButton.getText().toString().startsWith("Medical")
                    ? "You are Nexa AI Medical, powered by SpringNexa Private Limited. Provide medical education and decision support, not definitive diagnosis or prescription. Distinguish possibilities from diagnosis and advise clinician review when appropriate."
                    : "You are Nexa AI, powered by SpringNexa Private Limited. Be accurate, useful and concise. Do not invent facts or citations.";
            JSONObject s = new JSONObject();
            s.put("role", "system"); s.put("content", system); msgs.put(s);
            for (JSONObject h : history) msgs.put(h);
            JSONObject uMsg = new JSONObject();
            uMsg.put("role", "user"); uMsg.put("content", text); msgs.put(uMsg);
            JSONObject body = new JSONObject();
            body.put("mode", modelButton.getText().toString().startsWith("Medical") ? "auto" : "auto");
            body.put("language", "English");
            body.put("messages", msgs);
            OutputStream os = c.getOutputStream();
            os.write(body.toString().getBytes(StandardCharsets.UTF_8));
            os.close();
            int code = c.getResponseCode();
            BufferedReader br = new BufferedReader(new InputStreamReader(
                    code >= 200 && code < 300 ? c.getInputStream() : c.getErrorStream(), StandardCharsets.UTF_8));
            StringBuilder out = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) out.append(line);
            br.close();
            JSONObject result = new JSONObject(out.toString());
            if (code < 200 || code >= 300) return "NEXA AI request failed: " + result.optString("error", "HTTP " + code);
            String answer = result.optJSONArray("choices").optJSONObject(0).optJSONObject("message").optString("content", "");
            if (answer.isEmpty()) return "NEXA AI returned an empty response.";
            JSONObject a = new JSONObject();
            a.put("role", "user"); a.put("content", text); history.add(a);
            JSONObject b = new JSONObject();
            b.put("role", "assistant"); b.put("content", answer); history.add(b);
            return answer;
        } catch (Exception e) {
            return "Connection error. Please check your internet connection and try again.";
        } finally {
            if (c != null) c.disconnect();
        }
    }

    private void chooseMode() {
        String current = modelButton.getText().toString();
        modelButton.setText(current.startsWith("Medical") ? "Auto  ▾" : "Medical  ▾");
        Toast.makeText(this, current.startsWith("Medical") ? "NEXA Auto mode" : "NEXA Medical mode", Toast.LENGTH_SHORT).show();
    }

    private void openFiles() {
        Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        i.setType("*/*");
        i.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, false);
        i.addCategory(Intent.CATEGORY_OPENABLE);
        startActivityForResult(i, FILE_PICKER);
    }

    private void startVoice() {
        try {
            Intent i = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            i.putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault());
            startActivityForResult(i, VOICE_INPUT);
        } catch (Exception e) {
            Toast.makeText(this, "Voice input is not available on this device.", Toast.LENGTH_SHORT).show();
        }
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (resultCode != RESULT_OK || data == null) return;
        if (requestCode == FILE_PICKER) {
            Uri uri = data.getData();
            if (uri != null) {
                composer.setText("Please analyze this file: " + uri.getLastPathSegment());
                Toast.makeText(this, "File selected. Full file analysis will be connected next.", Toast.LENGTH_SHORT).show();
            }
        } else if (requestCode == VOICE_INPUT) {
            ArrayList<String> results = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
            if (results != null && !results.isEmpty()) composer.setText(results.get(0));
        }
    }

    private void toggleDrawer() {
        drawerOpen = !drawerOpen;
        drawer.setVisibility(drawerOpen ? View.VISIBLE : View.GONE);
    }

    private void closeDrawer() {
        drawerOpen = false;
        drawer.setVisibility(View.GONE);
    }

    @Override public void onBackPressed() {
        if (drawerOpen) { closeDrawer(); return; }
        super.onBackPressed();
    }

    public static class GradientButton extends TextView {
        public GradientButton(Context c, String text) {
            super(c);
            setText(text);
            setTextColor(Color.WHITE);
            setTextSize(14);
            setGravity(Gravity.CENTER);
            setTypeface(Typeface.DEFAULT, Typeface.BOLD);
            setBackgroundColor(Color.rgb(37, 99, 235));
        }
    }
}
