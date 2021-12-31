import fileType from "file-type";
import got from "got";
import imagemin from "imagemin";
import imageminPngquant from "imagemin-pngquant";
import imageminGifsicle from "imagemin-gifsicle";
import { UserError } from "../../errors";
import { logger } from "../../logger";

export const fetchImage = async (url: string): Promise<Buffer> => {
  try {
    const imageBuffer = await got.get(url).buffer();
    return imageBuffer;
  } catch (e) {
    throw new UserError("Error fetching provided image");
  }
};

const allowedMimes = ["image/gif", "image/jpeg", "image/jpg", "image/png"];
const optimizeMimes = ["image/gif", "image/png"];

export async function optimizeImageUrl(url: string): Promise<Buffer | undefined> {
  const imageBuffer = await fetchImage(url);
  const ft = await fileType.fromBuffer(imageBuffer);
  if (!ft) return;
  if (!allowedMimes.includes(ft.mime)) return;

  if (!optimizeMimes.includes(ft.mime)) return;

  // Only optimize an image if it's greater than 256kb
  if (imageBuffer.byteLength < 256_000) return;

  logger.debug("Minifying emote image url", { url });

  const buf = await imagemin.buffer(imageBuffer, {
    plugins: [
      imageminPngquant({
        quality: [0.6, 0.9],
      }),
      imageminGifsicle({ optimizationLevel: 3 }),
    ],
  });

  return buf;
}
