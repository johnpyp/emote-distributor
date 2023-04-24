import got from "got/dist/source";

const GET_EMOTE_QUERY = `query Emote($id: ObjectID!) {
    emote(id: $id) {
        id
        name
        flags
        lifecycle
        tags
        animated
        created_at
        owner_id
        trending
        state
        listed
        personal_use
        host {
            url
            files {
                name
                format
                width
                height
                frame_count
                size
            }
        }
    }
}`;

interface EmoteQueryRoot {
  data: EmoteData;
}

interface EmoteData {
  emote?: SevenTVEmote;
}

export interface SevenTVEmote {
  id: string;
  name: string;
  flags: number;
  lifecycle: number;
  tags: string[];
  animated: boolean;
  created_at: string;
  owner_id: string;
  trending: number | null;
  state: string[];
  listed: boolean;
  personal_use: boolean;
  host: EmoteCdnHost;
}

interface EmoteCdnHost {
  url: string;
  files: EmoteFile[];
}

interface EmoteFile {
  name: string;
  format: string;
  width: number;
  height: number;
  frame_count: number;
  size: number;
}

export class SevenTVApi {
  private static GQL_URL = "https://7tv.io/v3/gql";

  public static async getEmote(emoteId: string): Promise<SevenTVEmote | null> {
    const result = await got
      .post(this.GQL_URL, {
        json: {
          operationName: "Emote",
          query: GET_EMOTE_QUERY,
          variables: {
            id: emoteId,
          },
        },
      })
      .json<EmoteQueryRoot>();

    const emote = result?.data?.emote;
    return emote ?? null;
  }
}
