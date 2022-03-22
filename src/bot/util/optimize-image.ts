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

const allowedMimes = ["image/gif", "image/jpeg", "image/jpg", "image/png", "image/"];
const optimizeMimes = ["image/gif", "image/png"];

export interface OptimizedImage {
  buf: Buffer;
  mime: string;
}

export async function extractImageBuffer(url: string): Promise<OptimizedImage | undefined> {
  const imageBuffer = await fetchImage(url);
  const ft = await fileType.fromBuffer(imageBuffer);
  if (!ft) return;

  logger.debug(`Trying emote url with Mime type: ${ft.mime}`);

  if (!allowedMimes.includes(ft.mime))
    throw new UserError(`Filetype not supported as an emote (${ft.mime})`);

  if (!optimizeMimes.includes(ft.mime)) {
    if (imageBuffer.byteLength > 256_000) {
      throw new UserError(
        `Emote is too large (over 256kb) and media type doesn't support compression (${ft.mime})`
      );
    }

    return { buf: imageBuffer, mime: ft.mime };
  }

  // Only optimize an image if it's greater than 256kb
  if (imageBuffer.byteLength < 256_000) return { buf: imageBuffer, mime: ft.mime };

  logger.debug("Minifying emote image url", { url, mime: ft.mime });

  const buf = await imagemin.buffer(imageBuffer, {
    plugins: [
      imageminPngquant({
        quality: [0.6, 0.9],
      }),
      imageminGifsicle({ optimizationLevel: 3 }),
    ],
  });

  if (buf.byteLength > 256_000) {
    throw new UserError(
      `Emote is too large (over 256kb) even after attempted compression (${ft.mime})`
    );
  }

  return { buf, mime: ft.mime };
}
