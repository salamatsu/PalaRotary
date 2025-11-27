import { createCanvas, loadImage } from "canvas";

import { imageToBase64 } from "../utils/tobase64";
import { SHIRT_ZONES_IMAGE } from "../lib/constants";
import Athletic from "../assets/fonts/Athletic.ttf";

// Load custom font for canvas use
const loadFont = async () => {
  try {
    const font = new FontFace("Athletic", `url(${Athletic})`);
    await font.load();
    document.fonts.add(font);
  } catch (error) {
    console.warn("Failed to load Athletic font:", error);
  }
};

// Initialize font loading
loadFont();

export const draw = async (data) => {
  const name = `${data?.name}`?.toUpperCase()?.trim() || "LAST NAME";
  const number = data?.number || "00"; // shirt number
  const imageTemplate = SHIRT_ZONES_IMAGE[data.zone || "ZONE 3"];

  const width = 800;
  const height = 481;
  const nameHeight = 70;
  const nameWidth = 180;
  const numberHeight = 180;
  const numberWidth = 400;

  try {
    // Ensure font is loaded before drawing
    await document.fonts.ready;

    const canvas = createCanvas(width, height);
    canvas.setAttribute("allowTaint", true);
    canvas.setAttribute("useCORS", true);
    const context = canvas.getContext("2d");

    const templateImgSrc = await imageToBase64(imageTemplate);

    const [templateImg] = await Promise.all([loadImage(templateImgSrc)]);

    context.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

    context.textBaseline = "middle";
    context.textAlign = "center";
    context.fillStyle = "white";

    // Draw name with Athletic font
    context.font = " 26pt 'Athletic', 'Arial'";
    context.fillText(name, 600, nameHeight, nameWidth);

    // Draw number if provided with Athletic font
    if (number) {
      context.font = " 90pt 'Athletic', 'Arial'";
      context.fillText(number, 600, numberHeight, numberWidth);
    }

    return canvas.toDataURL();
  } catch (error) {
    console.error(error);
    return "Failed to generate shirt template.";
  }
};
