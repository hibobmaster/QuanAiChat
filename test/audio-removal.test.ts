import fs from "fs";
import path from "path";

const root = path.resolve(__dirname, "..");

function read(relativePath: string) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function exists(relativePath: string) {
  return fs.existsSync(path.join(root, relativePath));
}

describe("audio feature removal", () => {
  test("does not keep audio helper files or voice assets", () => {
    [
      "app/lib/audio.ts",
      "public/audio-processor.js",
      "app/components/voice-print",
      "app/icons/voice.svg",
      "app/icons/voice-off.svg",
      "app/icons/voice-white.svg",
    ].forEach((relativePath) => {
      expect(exists(relativePath)).toBe(false);
    });
  });

  test("does not expose speech methods in provider clients", () => {
    [
      "app/client/api.ts",
      "app/client/platforms/google.ts",
      "app/client/platforms/deepseek.ts",
    ].forEach((relativePath) => {
      const source = read(relativePath);

      expect(source).not.toContain("SpeechOptions");
      expect(source).not.toContain("speech(");
      expect(source).not.toContain("ArrayBuffer");
    });
  });

  test("does not keep audio rendering in chat or markdown", () => {
    const chatStore = read("app/store/chat.ts");
    const chat = read("app/components/chat.tsx");
    const chatStyles = read("app/components/chat.module.css");
    const markdown = read("app/components/markdown.tsx");

    expect(chatStore).not.toContain("audio_url");
    expect(chat).not.toContain("<audio");
    expect(chat).not.toContain("chat-message-audio");
    expect(chatStyles).not.toContain("chat-message-audio");
    expect(markdown).not.toContain("<audio");
  });

  test("does not keep TTS or STT locale settings", () => {
    ["app/locales/en.ts", "app/locales/cn.ts"].forEach((relativePath) => {
      const source = read(relativePath);

      expect(source).not.toContain("Speech:");
      expect(source).not.toContain("StopSpeech:");
      expect(source).not.toContain("StartSpeak:");
      expect(source).not.toContain("StopSpeak:");
      expect(source).not.toContain("TTS:");
    });

    const localeIndex = read("app/locales/index.ts");

    expect(localeIndex).not.toContain("STT_LANG_MAP");
    expect(localeIndex).not.toContain("getSTTLang");
  });
});
