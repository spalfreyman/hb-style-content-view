export type LocalizedStrings = Record<string, string>;
export type LocalizedLists = Record<string, string[]>;

/** The shared style content stored once in the Custom Object (container style-content, key = style id). */
export type StyleContentValue = {
  description: LocalizedStrings;
  details: LocalizedLists;
  material: LocalizedStrings;
  care: LocalizedLists;
};

export type StyleContentObject = {
  id: string;
  version: number;
  container: string;
  key: string;
  value: StyleContentValue;
};

export type FetchStyleContentData = {
  product: {
    id: string;
    masterData: {
      staged: {
        name: string | null;
        masterVariant: {
          attributesRaw: {
            name: string;
            referencedResource: StyleContentObject | null;
          }[];
        };
      } | null;
    };
  } | null;
};

export type SharedProduct = {
  id: string;
  key: string | null;
  masterData: {
    current: {
      masterVariant: {
        attributesRaw: {
          name: string;
          value: { key?: string; label?: string } | string;
        }[];
      };
    } | null;
  };
};
export type FetchSharedProductsData = {
  products: { total: number; results: SharedProduct[] };
};
