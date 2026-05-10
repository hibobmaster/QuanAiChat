import fs from "fs";
import path from "path";

const root = path.resolve(__dirname, "..");

function read(relativePath: string) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

describe("export image format", () => {
  test("uses compressed JPEG output for message image exports", () => {
    const exporter = read("app/components/exporter.tsx");

    expect(exporter).toContain("toJpeg");
    expect(exporter).not.toContain("toPng");
    expect(exporter).toContain('EXPORT_IMAGE_MIME_TYPE = "image/jpeg"');
    expect(exporter).toContain("EXPORT_IMAGE_QUALITY = 0.82");
    expect(exporter).toContain("EXPORT_IMAGE_PIXEL_RATIO = 1");
    expect(exporter).toContain("type: EXPORT_IMAGE_MIME_TYPE");
    expect(exporter).toContain("quality: EXPORT_IMAGE_QUALITY");
    expect(exporter).toContain("pixelRatio: EXPORT_IMAGE_PIXEL_RATIO");
    expect(exporter).toContain("link.download = `${props.topic}.jpg`");
  });
});
